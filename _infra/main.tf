terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

locals {
  domain = "ttrpgscheduler.com"
}

variable GITHUB_TOKEN {}

variable AWS_TOKEN_KEY {}

provider "aws" {
  region = "us-east-1"
}

provider "github" {
  owner = "sjkneisler"
}

resource "aws_ecr_repository" "app_ecr_repo" {
  name = "ttrpg-scheduler-repo"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_lifecycle_policy" "app_ecr_repo_lifecycle_policy" {
  repository = aws_ecr_repository.app_ecr_repo.name

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Keep last two images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 2
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}

resource "aws_acm_certificate" "backend_cert" {
  domain_name = aws_route53_record.api.name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "rds_security_group" {
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow traffic in from all sources
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "github_repository" "repo" {
  full_name = "sjkneisler/ttrpg-scheduler"
}

resource "github_repository_environment" "repo_sandbox_env" {
  repository = data.github_repository.repo.name
  environment = "sandbox"
}

resource "github_actions_environment_variable" "envvar_aws_region" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  variable_name = "AWS_REGION"
  value = "us-east-1"
}

resource "github_actions_environment_variable" "envvar_ecr_repository" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  variable_name = "ECR_REPOSITORY"
  value = aws_ecr_repository.app_ecr_repo.name
}

resource "github_actions_environment_variable" "envvar_aws_access_key_id" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  variable_name = "AWS_ACCESS_KEY_ID"
  value = var.AWS_TOKEN_KEY
}

resource "github_actions_environment_secret" "envvar_database_url" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  secret_name = "DATABASE_URL"
  plaintext_value = "postgresql://${aws_db_instance.database.username}:${aws_db_instance.database.password}@${aws_db_instance.database.endpoint}/ttrpg_scheduler?schema=public"
}

resource "aws_db_instance" "database" {
  engine = "postgres"
  instance_class = "db.t3.micro"
  allocated_storage = 10
  username = "main"
  password = "2GSOlt6FrlxPzHSS" # TODO: Use KMS for this secret, or pass in as variable and store in remote state
#   manage_master_user_password = true
#   master_user_secret {
#
#   }
  vpc_security_group_ids = [aws_security_group.rds_security_group.id]
  publicly_accessible = false

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_secretsmanager_secret" "db_master_password" {
  name = "db_master_password"
}

resource "aws_s3_bucket" "frontend" {
  bucket = "ttrpg-scheduler-frontend-bucket"
}

resource "github_actions_environment_variable" "envvar_frontend_s3_bucket" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  variable_name = "FRONTEND_S3_BUCKET"
  value = aws_s3_bucket.frontend.bucket
}

resource "github_actions_environment_variable" "envvar_react_app_server_url" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  variable_name = "REACT_APP_SERVER_URL"
  value = "https://${aws_route53_record.api.name}/"
}

resource "aws_s3_bucket_website_configuration" "frontend_s3_config" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "ttrpg-scheduler-frontend"
}

resource "aws_cloudfront_distribution" "frontend_cloudfront" {
  depends_on = [aws_acm_certificate_validation.root_validation]

  enabled = true
  default_root_object = "index.html"
  aliases = [data.aws_route53_zone.main.name]
  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend_s3_config.website_endpoint
    origin_id = aws_s3_bucket.frontend.bucket

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.frontend.bucket
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    min_ttl     = 0
    default_ttl = 5 * 60
    max_ttl     = 60 * 60

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.frontend_redirect.arn
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.root_cert.arn
    ssl_support_method = "sni-only"
  }
}

resource "aws_cloudfront_function" "frontend_redirect" {
  name    = "ttrpg_scheduler_frontend_redirect"
  runtime = "cloudfront-js-2.0"
  comment = "TTRPG Scheduler Frontend React Router Redirect"
  publish = true
  code    = file("${path.root}/cloudfront/frontend_redirect.js")
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "PublicReadGetObject",
          "Effect" : "Allow",
          "Principal" : "*",
          "Action" : "s3:GetObject",
          "Resource" : "arn:aws:s3:::${aws_s3_bucket.frontend.id}/*"
        }
      ]
    }
  )
}

data "aws_route53_zone" "main" {
  name = "ttrpgscheduler.com"
}

resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.main.id
  name = data.aws_route53_zone.main.name
  type = "A"

  alias {
    name = aws_cloudfront_distribution.frontend_cloudfront.domain_name
    zone_id = aws_cloudfront_distribution.frontend_cloudfront.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api" {
  name = "api.${data.aws_route53_zone.main.name}"
  zone_id = data.aws_route53_zone.main.id
  type = "A"

  alias {
    name = aws_apprunner_service.api.service_url
    zone_id = "Z01915732ZBZKC8D32TPT" #US-East-1 app runner hosted zone ID, Found here https://docs.aws.amazon.com/general/latest/gr/apprunner.html
    evaluate_target_health = true
  }

}

resource "aws_route53_record" "api_app_runner" {
  count = length(aws_apprunner_custom_domain_association.api_domain.certificate_validation_records)

  name = aws_apprunner_custom_domain_association.api_domain.certificate_validation_records.*.name[count.index]
  type = aws_apprunner_custom_domain_association.api_domain.certificate_validation_records.*.type[count.index]
  ttl = 300
  zone_id = data.aws_route53_zone.main.id

  records = [aws_apprunner_custom_domain_association.api_domain.certificate_validation_records.*.value[count.index]]
}

resource "aws_route53_record" "api_validations" {
  for_each = {
    for dvo in aws_acm_certificate.backend_cert.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = data.aws_route53_zone.main.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id
}

resource "aws_acm_certificate_validation" "api_validation" {
  certificate_arn = aws_acm_certificate.backend_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.api_validations : record.fqdn]
}


### Root SSL certificate and API validations

resource "aws_route53_record" "root_validations" {
  for_each = {
    for dvo in aws_acm_certificate.root_cert.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = data.aws_route53_zone.main.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id
}

resource "aws_acm_certificate" "root_cert" {
  domain_name = data.aws_route53_zone.main.name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "root_validation" {
  certificate_arn = aws_acm_certificate.root_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.root_validations : record.fqdn]
}

### New Cheaper backend (AppRunner + API Gateway)

resource "aws_iam_role" "ecrAccessorRole" {
  name               = "ecrAccessorRole"
  assume_role_policy = data.aws_iam_policy_document.apprunner_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecrAccessorRole_policy" {
  role       = aws_iam_role.ecrAccessorRole.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

data "aws_iam_policy_document" "apprunner_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["tasks.apprunner.amazonaws.com", "build.apprunner.amazonaws.com", "apprunner.amazonaws.com"]
    }
  }
}

resource "aws_apprunner_service" "api" {
  service_name = "ttrpg-scheduler-api"
  source_configuration {
    image_repository {
      image_configuration {
        port = "3001"
      }
      image_identifier      = "079358094174.dkr.ecr.us-east-1.amazonaws.com/ttrpg-scheduler-repo:latest"
      image_repository_type = "ECR"
    }
    auto_deployments_enabled = true
    authentication_configuration {
      access_role_arn = aws_iam_role.ecrAccessorRole.arn
    }
  }
  instance_configuration {
    cpu = "256"
    memory = "512"
  }
  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.api_scaling.arn
}

resource "aws_apprunner_auto_scaling_configuration_version" "api_scaling" {
  auto_scaling_configuration_name = "ttrpg-scheduler-api-scaling"

  max_concurrency = 1
  max_size        = 1
  min_size        = 1
}

resource "aws_apprunner_custom_domain_association" "api_domain" {
  domain_name = "api.ttrpgscheduler.com"
  service_arn = aws_apprunner_service.api.arn
}

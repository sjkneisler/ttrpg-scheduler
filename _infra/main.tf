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

resource "aws_ecs_cluster" "app_ecs_cluster" {
  name = "ttrpg-scheduler-cluster"
}

resource "aws_cloudwatch_log_group" "main" {
  name = "ttrpg-scheduler-logs"
}

resource "aws_ecs_task_definition" "app_task" {
  family = "ttrpg-scheduler-first-task"
  container_definitions = jsonencode([
            {
              name = "ttrpg-scheduler-first-task",
              image = aws_ecr_repository.app_ecr_repo.repository_url
              essential = true,
              portMappings = [
                {
                  "containerPort": 443,
                  "hostPort": 443,
                }],
              memory = 512,
              cpu = 256
              environment = [
                {
                  name = "DATABASE_URL"
                  value = "postgresql://${aws_db_instance.database.username}:${aws_db_instance.database.password}@${aws_db_instance.database.endpoint}/ttrpg_scheduler?schema=public"
                }
              ]
              healthCheck = {
                retries = 5
                command = [ "CMD-SHELL", "curl -f http://localhost:443/ || exit 1" ]
                timeout = 5
                interval = 30
                startPeriod = 90
              }
              logConfiguration = {
                logDriver = "awslogs"
                options = {
                  awslogs-group = aws_cloudwatch_log_group.main.name
                  awslogs-region = "us-east-1"
                  awslogs-stream-prefix = "ecs"
                }
              }
            }
          ])
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  memory = 512
  cpu = 256
  execution_role_arn = aws_iam_role.ecsTaskExecutionRole.arn
  lifecycle {
    ignore_changes = [
      container_definitions # Ignore changes because deploying this container without the github action fails deployment due to not specifying a valid ECR image tag
    ]
  }
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_default_vpc" "default_vpc" {
}

# Provide references to your default subnets
resource "aws_default_subnet" "default_subnet_a" {
  # Use your own region here but reference to subnet 1a
  availability_zone = "us-east-1a"
}

resource "aws_default_subnet" "default_subnet_b" {
  # Use your own region here but reference to subnet 1b
  availability_zone = "us-east-1b"
}

resource "aws_alb" "application_load_balancer" {
  name               = "ttrpg-scheduler-lb"
  load_balancer_type = "application"
  subnets = [ # Referencing the default subnets
    aws_default_subnet.default_subnet_a.id,
    aws_default_subnet.default_subnet_b.id
  ]
  # security group
  security_groups = [aws_security_group.load_balancer_security_group.id]
}

resource "aws_security_group" "load_balancer_security_group" {
  ingress {
    from_port   = 443
    to_port     = 443
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

resource "aws_lb_target_group" "target_group" {
  name        = "ttrpg-scheduler-target-group"
  port        = 443
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id # default VPC
}

resource "aws_acm_certificate" "backend_cert" {
  domain_name = aws_route53_record.api.name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_listener" "listener" {
  depends_on = [aws_acm_certificate_validation.api_validation]

  load_balancer_arn = aws_alb.application_load_balancer.arn #  load balancer
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn = aws_acm_certificate.backend_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn # target group
  }

  lifecycle {
    replace_triggered_by = [
      aws_lb_target_group.target_group,
    ]
  }
}

resource "aws_ecs_service" "app_service" {
  name            = "ttrpg-scheduler-first-service"     # Name the service
  cluster         = aws_ecs_cluster.app_ecs_cluster.id   # Reference the created Cluster
  task_definition = aws_ecs_task_definition.app_task.arn # Reference the task that the service will spin up
  launch_type     = "FARGATE"
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn # Reference the target group
    container_name   = aws_ecs_task_definition.app_task.family
    container_port   = 443 # Specify the container port
  }

  network_configuration {
    subnets          = [aws_default_subnet.default_subnet_a.id, aws_default_subnet.default_subnet_b.id]
    assign_public_ip = true     # Provide the containers with public IPs
    security_groups  = [aws_security_group.service_security_group.id] # Set up the security group
  }

  lifecycle {
    ignore_changes = [
      task_definition # Ignore changes because deploying this container without the github action fails deployment due to not specifying a valid ECR image tag
    ]
  }

   health_check_grace_period_seconds = 180 # Wait up to 3 minutes for prisma migrations
}

resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    security_groups = [aws_security_group.load_balancer_security_group.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
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

resource "github_actions_environment_variable" "envvar_ecs_service" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  variable_name = "ECS_SERVICE"
  value = aws_ecs_service.app_service.name
}

resource "github_actions_environment_variable" "envvar_ecs_cluster" {
  repository = data.github_repository.repo.name
  environment = github_repository_environment.repo_sandbox_env.environment
  variable_name = "ECS_CLUSTER"
  value = aws_ecs_cluster.app_ecs_cluster.name
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
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id = aws_s3_bucket.frontend.bucket

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
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
  type = "CNAME"
  ttl = 60
  records = [aws_alb.application_load_balancer.dns_name]
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
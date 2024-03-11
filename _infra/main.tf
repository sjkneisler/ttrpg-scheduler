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

resource "aws_ecs_task_definition" "app_task" {
  family = "ttrpg-scheduler-first-task"
  container_definitions = jsonencode([
            {
              name = "ttrpg-scheduler-first-task",
              image = aws_ecr_repository.app_ecr_repo.repository_url
              essential = true,
              portMappings = [
                {
                  "containerPort": 3001,
                  "hostPort": 3001,
                }],
              memory = 512,
              cpu = 256
              environment = [
                {
                  name = "DATABASE_URL"
                  value = "postgresql://${aws_db_instance.database.username}:${aws_db_instance.database.password}@${aws_db_instance.database.endpoint}/ttrpg_scheduler?schema=public"
                }
              ]
            }
          ])
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  memory = 512
  cpu = 256
  execution_role_arn = aws_iam_role.ecsTaskExecutionRole.arn
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
  name               = "ttrpg-scheduler-load-balancer" #load balancer name
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
    from_port   = 3001
    to_port     = 3001
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
  port        = 3001
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id # default VPC
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.application_load_balancer.arn #  load balancer
  port              = "3001"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn # target group
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
    container_port   = 3001 # Specify the container port
  }

  network_configuration {
    subnets          = [aws_default_subnet.default_subnet_a.id, aws_default_subnet.default_subnet_b.id]
    assign_public_ip = true     # Provide the containers with public IPs
    security_groups  = [aws_security_group.service_security_group.id] # Set up the security group
  }
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

#resource "github_actions_environment_secret" "envvar_aws_access_key_secret" {
#  repository = data.github_repository.repo.name
#  environment = github_repository_environment.repo_sandbox_env.environment
#  secret_name = "AWS_SECRET_ACCESS_KEY"
##   value = var.AWS_SECRET_KEY
#}

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
  vpc_security_group_ids = [aws_security_group.rds_security_group.id, aws_security_group.service_security_group.id]
  publicly_accessible = true # TODO: Set this up as false and secure behind VPCs

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_secretsmanager_secret" "db_master_password" {
  name = "db_master_password"

}

output "app_url" {
  value = aws_alb.application_load_balancer.dns_name
}


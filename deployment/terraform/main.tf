module "network" {
  source        = "git@github.com:kids-first/aws-infra-network-module?ref=8c6ed08"
  environment   = var.environment
  subnet_prefix = "apps"
  organization  = var.organization
  vpc_prefix    = "apps"
  azs           = ["a", "b"]
}

data "aws_caller_identity" "current" {}

data "template_file" "container_definition" {
  template = file("definitions/task-definition.json")
  vars = {
    project             = var.project
    environment         = var.environment
    region              = var.region
    log_group_name      = "apps-${var.environment}/${var.project}"
    image               = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/kf-cavatica-vwb-api:${var.image_tag}"
    task_role_arn       = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project}-${var.environment}-role"
    container_port      = "443"
    secret_name         = aws_secretsmanager_secret.secrets.id
    keycloak_url        = var.keycloak_url
    keycloak_realm      = var.keycloak_realm
    key_manager_url     = var.key_manager_url
    fence_list          = var.fence_list
    fhir_url            = var.fhir_url
    fhir_keycloak_url   = var.fhir_keycloak_url 
    fhir_keycloak_realm = var.fhir_keycloak_realm 
    manifest_bucket     = var.manifest_bucket 
  }
}

data "aws_lb" "lb" {
  name = var.alb_name
}

module "app" {
  source = "git@github.com:d3b-center/aws-ecs-service-module.git?ref=2b84cb4"
  project                 = var.project
  environment             = var.environment
  organization            = var.organization
  owner                   = "St. Justine DevOps"
  private_subnets         = module.network.private_subnets
  vpc_id                  = module.network.vpc_id
  vcpu_task               = "1024"
  memory_task             = "2048"
  domain                  = "${var.domain}"
  cluster_name            = "${var.organization}-apps-${var.environment}-us-east-1-ecs"
  security_group_cidr     = ["10.0.0.0/8"]
  container_port          = "443"
  container_definition    = data.template_file.container_definition.rendered
  deletion_protection     = false
  lb_security_group       = tolist(data.aws_lb.lb.security_groups)[0]
  alb_name                = var.alb_name
  health_check_protocol   = "HTTP"
  container_protocol      = "HTTP"
  host_header_list        = ["${var.project}-${var.environment}.${var.domain}"]
  health_check_path       = "/status"
  create_default_iam_role = 0
  iam_role                = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/kf-cavatica-vwb-api-${var.environment}-role"
}

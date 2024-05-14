variable "alb_name" {
    description = "ALB Name"
}
variable "environment" {
    description="Environment name"
}

variable "region" {
    description="AWS Region"
    default="us-east-1"
}

variable "image_tag" {
    description="Docker Image Tag in ECR"
}

variable "organization" {
  description = "Organization that service belongs to kidsfirst,include, d3b, etc"
  default     = "kf-strides"
}

variable "domain" {
  description = "Domain name"
  default     = "kf-strides.org"
}

variable "project" {
  description = "Project Name"
  default = "kf-cavatica-vwb-api"
}

###Application Variables
variable "port" {
  description = "Container Port"
  default = "443"
}

variable "keycloak_url" {
  description = "Keycloak URL"
}

variable "keycloak_realm" {
  description = "Keycloak Realm for Portal"
  default = "kidsfirstdrc"
}

variable "key_manager_url" {
  description = "Key Manager URL"
}

variable "fence_list" {
  description = "Fence Gen3 List"
  default = "gen3|dcf"
}

variable "fhir_url" {
  description = "FHIR URL"
  default = ""
}

variable "fhir_keycloak_url" {
  description = "FHIR Keycloak Auth URL"
  default = ""
}

variable "fhir_keycloak_realm" {
  description = "FHIR Keycloak Realm"
  default = ""
}

variable "manifest_bucket" {
  description = "Manifest Bucket"
  default = ""
}

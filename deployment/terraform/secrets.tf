resource "aws_secretsmanager_secret" "secrets" {
  name = "${var.project}/${var.environment}/secrets"
  description = "${var.project} Secrets"
}

resource "aws_secretsmanager_secret_version" "secrets" {
  secret_id     = aws_secretsmanager_secret.secrets.id
  secret_string = jsonencode(
	{
    "KEYCLOAK_CLIENT": ""
    "FHIR_KEYCLOAK_CLIENT_ID": ""
    "FHIR_KEYCLOAK_CLIENT_SECRET": ""
	}
  )
}


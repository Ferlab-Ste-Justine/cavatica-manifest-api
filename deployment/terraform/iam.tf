resource "aws_iam_role_policy" "secrets" {
name_prefix = "${var.project}-${var.environment}-secrets"
role        = module.app.iam_execute_role_name
policy      = data.aws_iam_policy_document.secrets.json
}

data "aws_kms_key" "aws-kms-key" {
key_id = "alias/aws/secretsmanager"
}

data "aws_iam_policy_document" "secrets" {
    statement {
        effect = "Allow"

        actions = [
            "secretsmanager:GetSecretValue",
            "kms:Decrypt"
        ]

        resources = [
            aws_secretsmanager_secret.secrets.id,
            data.aws_kms_key.aws-kms-key.arn
        ]
    }
}


resource "aws_dynamodb_table" "state" {
  name         = "gubblunch-state"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }
}

data "aws_iam_policy_document" "lambda_dynamodb" {
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem"]
    effect    = "Allow"
    resources = [aws_dynamodb_table.state.arn]
  }
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name   = "gubblunch-bot-dynamodb"
  role   = aws_iam_role.lambda_exec.id
  policy = data.aws_iam_policy_document.lambda_dynamodb.json
}
data "aws_caller_identity" "current" {}


data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name               = "gubblunch-bot-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../dist/lambda.js"
  output_path = "${path.module}/../dist/lambda.zip"
}

resource "aws_lambda_function" "slack_bot" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "gubblunch-bot"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "lambda.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 30

  environment {
    variables = {
      SLACK_BOT_TOKEN      = var.slack_bot_token
      SLACK_SIGNING_SECRET = var.slack_signing_secret
      GEMINI_API_KEY       = var.gemini_api_key
      GEMINI_MODEL         = var.gemini_model_name
      DYNAMODB_TABLE       = aws_dynamodb_table.state.name
    }
  }
}

resource "aws_lambda_function_url" "slack_bot_url" {
  function_name      = aws_lambda_function.slack_bot.function_name
  authorization_type = "NONE"
}

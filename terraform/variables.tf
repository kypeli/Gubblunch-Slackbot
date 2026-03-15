variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "slack_bot_token" {
  description = "Slack Bot Token (xoxb-...)"
  type        = string
  sensitive   = true
}

variable "slack_signing_secret" {
  description = "Slack App Signing Secret"
  type        = string
  sensitive   = true
}

variable "gemini_model_name" {
  description = "Gemini model name"
  type        = string
  default     = "gemini-3.1-flash-lite-preview"
}


variable "gemini_api_key" {
  description = "Gemini API Key"
  type        = string
  sensitive   = true
}

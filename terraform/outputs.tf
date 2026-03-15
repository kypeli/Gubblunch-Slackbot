output "slack_events_request_url" {
  description = "The URL to configure in the Slack App Event Subscriptions AND Interactivity pages"
  value       = aws_lambda_function_url.slack_bot_url.function_url
}

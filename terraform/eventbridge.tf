resource "aws_cloudwatch_event_rule" "cron" {
  name                = aws_lambda_function.genshin_notify.function_name
  schedule_expression = "cron(0 */2 * * ? *)"
  role_arn = aws_iam_role.eventbridge_role.arn
}

resource "aws_cloudwatch_event_target" "eventbridge_main" {
  target_id = "genshin_notify"
  rule      = aws_cloudwatch_event_rule.cron.name
  arn       = aws_lambda_function.genshin_notify.arn
}

resource "aws_iam_role" "eventbridge_role" {
  name               = "genshin-notify-eventbridge-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "scheduler.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "eventbridge_policy" {
  name   = "genshin-notify-eventbridge-policy"
  role   = aws_iam_role.eventbridge_role.name

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "lambda:InvokeFunction",
        ]
        Resource = [
          aws_lambda_function.genshin_notify.arn
        ]
      }
    ]
  })
}
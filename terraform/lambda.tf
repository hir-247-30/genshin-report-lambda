data "archive_file" "main_zip" {
  type        = "zip"
  source_dir  = "../dist"
  output_path = "../dist/upload.zip"
}

resource "aws_lambda_function" "genshin_notify" {
  function_name    = "genshin-notify"
  handler          = "main.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.main_zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.main_zip.output_path)
  role             = aws_iam_role.lambda_role.arn
}

resource "aws_iam_role" "lambda_role" {
  name = "genshin-notify-lambda-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "apigateway.amazonaws.com",
          "lambda.amazonaws.com",
          "events.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_policy" {
  name = "genshin-notify-lambda-policy"

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogGroup",
          "logs:PutLogEvents"
        ]
        Resource = [
          aws_cloudwatch_log_group.lambda_log_group.arn,
          "${aws_cloudwatch_log_group.lambda_log_group.arn}:*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}
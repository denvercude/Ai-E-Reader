## OCR with AWS Textract

This project uses **AWS Textract** for OCR (Optical Character Recognition).

### Environment Variables

Add the following to your `.env` file (or set in your deployment platform):

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
OCR_PROVIDER=aws-textract
```

Note: Keep `OCR_PROVIDER=aws-textract` for production. For local development, you may bypass AWS by commenting this out or using a different provider (e.g. Tesseract).

### Notes
- Textract is used instead of Tesseract because Vercel's serverless environment cannot reliably run heavy OCR workloads.
- Jobs are asynchronous: you upload a PDF with `/api/ocr/start`, then poll `/api/ocr/status/:jobId` for results.
- Direct text extraction still uses `pdfjs-dist`; Textract is only used as a fallback for scanned/image-based PDFs.

### Setting Up AWS

#### 1. Create an S3 bucket

Textract works on documents in S3.

1.	​	Go to the AWS Management Console -> S3.
2.	Click Create bucket.
3.	Choose a globally unique name, e.g. ai-e-reader-ocr.
    - Region: stick with something common (e.g. us-east-1). Make sure the bucket region matches your AWS_REGION environment variable.
    - Block Public Access: leave ON.
    - Default settings are fine otherwise.
4.	Hit Create bucket.

#### 2. Create an IAM user for your app

We don’t want to use your root account—create a least-privilege user.

1.	In the AWS Console -> IAM -> Users -> Add user.
2.	Name: ai-e-reader-service.
3.	Select: Programmatic access (creates access key + secret).
4.	Permissions -> Attach policies directly -> click Create policy.

Paste this JSON policy (replace YOUR_BUCKET_NAME_HERE):

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3AccessForTextract",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME_HERE",
        "arn:aws:s3:::YOUR_BUCKET_NAME_HERE/*"
      ]
    },
    {
      "Sid": "TextractAccess",
      "Effect": "Allow",
      "Action": [
        "textract:StartDocumentTextDetection",
        "textract:GetDocumentTextDetection"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 3. Collect your environment values

You’ll need:

	•	AWS_ACCESS_KEY_ID -> from CSV
	•	AWS_SECRET_ACCESS_KEY -> from CSV
	•	AWS_REGION -> e.g. us-east-1
	•	AWS_S3_BUCKET_NAME -> the bucket you created

#### 4. Enable Textract

Textract requires an active AWS account (not just the free tier). Be sure billing is enabled.

1. Navigate to AWS -> Textract (Tip: Use search bar)
2. Follow prompts to enable subscription

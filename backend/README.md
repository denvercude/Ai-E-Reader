## OCR

This project supports two OCR providers: **AWS Textract** (default for production) and **Local OCR (Tesseract.js)** as a fallback primarily for local development or dedicated server environments.

---

### AWS Textract (Default Provider)

This project uses **AWS Textract** for OCR (Optical Character Recognition) in production environments.

Textract is used instead of Tesseract because Vercel's serverless environment cannot reliably run heavy OCR workloads. Jobs are asynchronous: you upload a PDF with `/api/ocr/start`, then poll `/api/ocr/status/:id` for results.

Direct text extraction still uses `pdfjs-dist`; Textract is only used as a fallback for scanned/image-based PDFs. In some Node environments, `pdfjs-dist` may require tweaking worker options if worker-related warnings occur. Example:

```js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = undefined; // let legacy build manage the worker in Node
```

Currently **only multipart/form-data uploads** are supported. Send the file under the field name `file`. Example:

```bash
curl -s -F "file=@backend/test-files/test-text-document.pdf" \
  http://localhost:5050/api/ocr/start | jq
```

(Note: The same applies when Local OCR is enabled.)

#### Environment Variables

Add the following to your `.env` file (or set in your deployment platform):

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
OCR_PROVIDER=aws-textract
```

Note: Keep `OCR_PROVIDER=aws-textract` for production. For local development, you may bypass AWS by omitting this or using a different provider (e.g., Tesseract).

Optional flags:
- `CLOUD_OCR_ONLY=true` — Do not fall back to local OCR if Textract fails to start; return an error instead.
- Max upload size is 50 MB (requests over this limit are rejected with HTTP 413).

#### How To Test Locally

- Start server: `npm run dev` (listens on <http://localhost:5050>)

- Text PDF (direct): `curl -sS -F "file=@backend/test-files/test-text-document.pdf" http://localhost:5050/api/ocr/start | jq`

- Scanned PDF (Textract if OCR_PROVIDER=aws-textract): `curl -sS -F "file=@backend/test-files/test-scanned-document.pdf" http://localhost:5050/api/ocr/start | jq`
- Then: `curl -sS http://localhost:5050/api/ocr/status/$jobId | jq` (replace `$jobId` with the value returned by the previous call)

#### Response Status and Semantics

- Textract returns status codes: `IN_PROGRESS`, `SUCCEEDED`, `PARTIAL_SUCCESS`, `FAILED`.
- `PARTIAL_SUCCESS` may happen if only part of the document could be processed; extracted text is still returned and the service sets `success: true`, but the `status` field will show `PARTIAL_SUCCESS`.
- Clients should check both `success` and `status` for accurate handling.
- While jobs are processing (`IN_PROGRESS`), the API responds with `202 Accepted` and includes `Retry-After` to guide polling cadence.

#### Setting Up AWS

##### 1. Create an S3 bucket

Textract works on documents in S3.

1.  Go to the AWS Management Console -> S3 (Tip: use the search bar).
2.  Click Create bucket.
3.  Choose a globally unique name, e.g. ai-e-reader-ocr.
    - Region: use a common region (e.g. us-east-1). Make sure the bucket region matches your AWS_REGION environment variable.
    - Block Public Access: leave ON.
    - Default settings are fine otherwise.
4.  Hit Create bucket.
    - (Recommended) Create a lifecycle rule to auto-expire objects under the `uploads/ocr/` prefix after N days to keep storage usage in check.


##### 2. Create an IAM user for your app

We don’t want to use your root account—create a least-privilege user.

1.  In the AWS Console -> IAM -> Users -> Add user.
2.  Name: ai-e-reader-service.
3.  Select: Programmatic access (creates access key + secret).
4.  Permissions -> Attach policies directly -> click Create policy.

Paste this JSON policy (replace YOUR_BUCKET_NAME_HERE):

```json
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

##### 3. Collect your environment values

You’ll need:

```env
AWS_ACCESS_KEY_ID -> from CSV
AWS_SECRET_ACCESS_KEY -> from CSV
AWS_REGION -> e.g. us-east-1
AWS_S3_BUCKET_NAME -> the bucket you created
```

##### 4. Enable Textract

Textract requires an active AWS account (not just the free tier). Be sure billing is enabled.

1.  Navigate to AWS -> Textract (Tip: use the search bar)
2.  Follow prompts to enable subscription

---

### Local OCR (Tesseract.js)

Local OCR uses **Tesseract.js** as a fallback OCR provider, primarily intended for local development, bypassing AWS, or dedicated server use.

This approach is resource heavy and not recommended for serverless or limited-resource environments. To help reduce memory spikes, Local OCR now processes pages one by one instead of loading the entire document at once.

To use Local OCR, set the environment variable:

```env
OCR_PROVIDER=local-tesseract
```

Optional: set `OCR_LANGS` to control languages (default: `eng`). Example:

```env
OCR_LANGS=eng+spa
```

Offline environments: ensure the Tesseract language data for the selected languages is available. Tesseract.js will try to fetch data on first use; if outbound network is blocked, pre-provision language data and configure Tesseract to use it.

You can still upload files in the same way as with Textract (multipart/form-data with the field name `file`).
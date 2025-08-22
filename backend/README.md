## OCR

This project supports two OCR providers: **AWS Textract** (default for production) and **Local OCR (Tesseract.js)** as a fallback primarily for local development or dedicated server environments.

---

### AWS Textract (Default Provider)

This project uses **AWS Textract** for OCR (Optical Character Recognition) in production environments.  
Textract is preferred over Tesseract because Vercel’s serverless environment cannot reliably run CPU‑intensive OCR workloads.


Jobs are asynchronous: you upload a PDF with `/api/ocr/start`, then poll `/api/ocr/status/:id` for results.
When a Textract job is queued, the server responds with HTTP 202 Accepted and includes:
- `Location: /api/ocr/status/:id` pointing to the polling endpoint
- `Retry-After: 2–5` suggesting a polling cadence (seconds), depending on load


Max upload size is 50 MB (requests over this limit are rejected with HTTP 413).

Direct text extraction still uses `pdfjs-dist`; Textract is only used as a fallback for scanned/image-based PDFs. 
In some Node environments, `pdfjs-dist` may require tweaking worker options if worker-related warnings occur. Example:

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

Note: Keep `OCR_PROVIDER=aws-textract` for production. For local development, you may bypass AWS by setting `OCR_PROVIDER=local-tesseract`.

OCR provider selection:
- `OCR_PROVIDER=aws-textract` — recommended for production.
- `OCR_PROVIDER=local-tesseract` — for local/dev or dedicated servers (CPU‑heavy).

If OCR_PROVIDER is omitted:
- In production: treated as `aws-textract` (recommended).
- In local/dev: treated as `local-tesseract` if the local stack is available.

Optional flags:
- `CLOUD_OCR_ONLY=true` — Do not fall back to local OCR if Textract fails to start; return an error instead.
- `OCR_LANGS=eng+spa`   — Languages for local Tesseract (default: eng)

#### How To Test Locally

- Start server: `npm run dev` (listens on <http://localhost:5050>)

- Text PDF (direct): `curl -sS -F "file=@backend/test-files/test-text-document.pdf" http://localhost:5050/api/ocr/start | jq`

- Scanned PDF (Textract if OCR_PROVIDER=aws-textract): `curl -sS -F "file=@backend/test-files/test-scanned-document.pdf" http://localhost:5050/api/ocr/start | jq`.
- Then run: `curl -sS http://localhost:5050/api/ocr/status/$jobId | jq` (replace `$jobId` with the value returned by the previous call).

#### Response Status and Semantics

The OCR API provides clear status updates and response formats to help clients handle job progress and results.

- **Status values:** Textract may return one of the following statuses:
  - `IN_PROGRESS`
  - `SUCCEEDED`
  - `PARTIAL_SUCCESS`
  - `FAILED`
- For `PARTIAL_SUCCESS`, the response includes extracted text and sets `success: true`. The `status` field will indicate `PARTIAL_SUCCESS`.
- Clients should check both the `success` and `status` fields to determine the outcome.
- While a job is processing (`IN_PROGRESS`), the API responds with **HTTP 202 Accepted** and includes a `Retry-After` header to guide polling intervals (recommend 2–5 seconds with jitter).



##### Response Format

```ts
type OcrStatus = 'IN_PROGRESS' | 'SUCCEEDED' | 'PARTIAL_SUCCESS' | 'FAILED';
type OcrMethod = 'Direct extraction' | 'OCR (Textract)' | 'OCR (Local)';

interface OcrResponse {
  success: boolean;            // true for SUCCEEDED and PARTIAL_SUCCESS
  status?: OcrStatus;          // absent for direct-extraction immediate responses
  method: OcrMethod;           // includes provider detail for OCR
  requiresOCR: boolean;        // false for direct extraction path
  totalPages: number;          // number of pages processed
  text: Array<{ page: number; text: string }>;
  queued?: boolean;            // true only on initial 202 Accepted from /start
  jobId?: string;              // present when queued or IN_PROGRESS
  s3Key?: string;              // present when queued (Textract input location)
  retryAfter?: number;         // optional echo of Retry-After header (seconds)
  warnings?: string[];         // non-fatal issues (e.g., "OCR failed on page 3")
  errorCode?: string;          // e.g., 'ERR_PDF_TOO_LARGE' on immediate failures
  errorMessage?: string;       // human-readable error summary (generic in prod)
}
```

**Notes:**
- **HTTP semantics:** queued/running responses return **202** with `Location: /api/ocr/status/:id` and a `Retry-After` value (typically 2–5 seconds). Completed jobs return **200**.
- **Partial success:** `status: 'PARTIAL_SUCCESS'` still sets `success: true`; clients should check `status` for messaging.
- **Errors:** oversized uploads return **413** with `{ errorCode: 'ERR_PDF_TOO_LARGE' }`.
- **Header precedence:** if `retryAfter` is present in the body, treat it as informational only; the `Retry-After` header is authoritative.

#### Tunable Parameters

The following constants are defined in `textExtraction.service.js` for easy adjustment. Defaults are chosen to balance accuracy, performance, and resource usage:

- **`MIN_TEXT_LENGTH = 20`**  
  Minimum number of characters required for direct text extraction to be considered valid. Prevents false positives from empty or near-empty results.

- **`MAX_PDF_SIZE = 50 * 1024 * 1024` (50 MB)**  
  Maximum PDF size allowed. Requests over this limit are rejected with HTTP 413 to avoid memory/CPU overload.

- **`TEXTRACT_MAX_RESULTS = 1000`**  
  Maximum number of blocks requested per Textract call. Reduces round‑trips while staying within API constraints.

- **`TEXTRACT_PAGE_GUARD = 1000`**  
  Safety cap on Textract pagination iterations. Prevents infinite loops if AWS returns unexpected tokens.

- **`PDF2PIC_DENSITY = 150`**  
  DPI for converting PDFs to images for Local OCR. Higher density improves recognition accuracy but increases memory/CPU usage.


---

### Local OCR (Tesseract.js)

Local OCR uses **Tesseract.js** as a fallback OCR provider, primarily for local development, bypassing AWS, or use on dedicated servers. This method is **resource intensive** and not recommended for serverless or low-memory environments.

#### How It Works

- Processes PDF pages **one by one** to reduce memory spikes (does not load the entire document at once).
- Upload files the same way as with Textract: use `multipart/form-data` with the field name `file`.

#### Enabling Local OCR

Set the following environment variable:

```env
OCR_PROVIDER=local-tesseract
```

You can also control the OCR language(s) with `OCR_LANGS` (default: `eng`). Example:

```env
OCR_LANGS=eng+spa
```

#### Language Data Requirements

- **Offline environments:** Tesseract.js tries to fetch language data on first use. If outbound network access is blocked, pre-provision the required `*.traineddata` files and configure Tesseract.js to use them.
- This repo tracks `eng.traineddata` with Git LFS. After cloning, run:

  ```bash
  git lfs install
  git lfs pull
  ```

- For additional languages, download the corresponding `*.traineddata` files and point Tesseract.js to their directory in your service configuration.

---

### Setting Up AWS

#### 1. Create an S3 bucket

Textract works on documents in S3.

1.  Go to the AWS Management Console -> S3 (tip: use the search bar).
2.  Click “Create bucket”.
3.  Choose a globally unique name, e.g., `ai-e-reader-ocr`.
    - Region: use a common region (e.g., `us-east-1`). Ensure the bucket region matches your `AWS_REGION` environment variable.
    - Block Public Access: leave ON.
    - Default settings are fine otherwise.
4.  Click “Create bucket”.
    - (Recommended) Create a lifecycle rule to auto-expire objects under the `uploads/ocr/` prefix after N days to control storage usage.


#### 2. Create an IAM user for your app

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

#### 3. Collect your environment values

You’ll need:

```env
AWS_ACCESS_KEY_ID -> from CSV
AWS_SECRET_ACCESS_KEY -> from CSV
AWS_REGION -> e.g. us-east-1
AWS_S3_BUCKET_NAME -> the bucket you created
```

#### 4. Enable Textract

Textract requires an active AWS account (not just the free tier). Be sure billing is enabled.

1.  Navigate to AWS -> Textract (Tip: use the search bar)
2.  Follow prompts to enable subscription

#### Security and data handling

- Do not commit `.env` files or credentials. Use environment variables or a secrets manager in production.
- Enable default encryption on your S3 bucket,
- Keep lifecycle rules to auto-expire objects under `uploads/ocr/` to reduce data exposure.
- Be mindful of PII/PHI: only upload what you need, and document retention policies for your org.
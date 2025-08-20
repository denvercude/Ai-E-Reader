## OCR with AWS Textract

This project uses **AWS Textract** for OCR (Optical Character Recognition).

### Notes
- Textract is used instead of Tesseract because Vercel's serverless environment cannot reliably run heavy OCR workloads.
- Jobs are asynchronous: you upload a PDF with `/api/ocr/start`, then poll `/api/ocr/status/:jobId` for results.
- Direct text extraction still uses `pdfjs-dist`; Textract is only used as a fallback for scanned/image-based PDFs.
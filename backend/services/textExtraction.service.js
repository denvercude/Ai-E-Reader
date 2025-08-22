import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import os from 'os';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fromPath } from 'pdf2pic';
import Tesseract from 'tesseract.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { TextractClient, StartDocumentTextDetectionCommand, GetDocumentTextDetectionCommand } from '@aws-sdk/client-textract';

// Keep logs quiet in production
const isDev = (process.env.NODE_ENV !== 'production');
// Languages for Tesseract.js (e.g., "eng", "eng+spa"). Defaults to English.
const OCR_LANGS = process.env.OCR_LANGS || 'eng';

// === Tunable Parameters ===
// Threshold for considering direct extraction meaningful
const MIN_TEXT_LENGTH = 20;
// Guardrail against oversized PDFs (50 MB)
const MAX_PDF_SIZE = 50 * 1024 * 1024;
// Textract: request up to this many blocks per page to reduce API round-trips
const TEXTRACT_MAX_RESULTS = 1000;
// Textract: hard cap on pagination iterations to avoid pathological loops
const TEXTRACT_PAGE_GUARD = 1000;
// pdf2pic: DPI for image conversion; higher improves Local OCR accuracy but costs time/memory
const PDF2PIC_DENSITY = 150;

// AWS clients & config
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET || '';

const s3 = new S3Client({ region: AWS_REGION });
const textract = new TextractClient({ region: AWS_REGION });

// Helper to generate a unique S3 key for uploaded PDFs
const uniqueS3Key = (prefix = 'uploads/ocr') =>
  `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;

// Upload the original PDF buffer to S3 so Textract can process it asynchronously
async function uploadPdfToS3(buffer) {
  if (!AWS_S3_BUCKET) throw new Error('Missing AWS_S3_BUCKET_NAME env for Textract OCR.');
  const Key = uniqueS3Key();
  await s3.send(new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key,
    Body: buffer,
    ContentType: 'application/pdf',
    ServerSideEncryption: 'AES256',
  }));
  return Key;
}

// Start Textract text detection job
async function startTextractJob(s3Key) {
  const resp = await textract.send(new StartDocumentTextDetectionCommand({
    DocumentLocation: { S3Object: { Bucket: AWS_S3_BUCKET, Name: s3Key } }
  }));
  return resp.JobId;
}

// Poll Textract for results and format into your standard { page, text }[]
export async function getTextractResult(jobId) {
  let nextToken = undefined;
  const pagesMap = new Map(); // pageNumber -> array of lines
  let jobStatus = 'IN_PROGRESS';
  let documentPages = 0;

  let pageCountGuard = 0;
  // This loop returns when Textract stops paging results.
  while (true) {
    const resp = await textract.send(new GetDocumentTextDetectionCommand({
      JobId: jobId,
      NextToken: nextToken,
      // Request up to TEXTRACT_MAX_RESULTS blocks per call for efficiency
      MaxResults: TEXTRACT_MAX_RESULTS
    }));

    jobStatus = resp.JobStatus;
    if (resp.DocumentMetadata && typeof resp.DocumentMetadata.Pages === 'number') {
      documentPages = resp.DocumentMetadata.Pages;
    }

    if (resp.Blocks) {
      for (const b of resp.Blocks) {
        if (b.BlockType === 'LINE') {
          const page = b.Page || 1;
          const arr = pagesMap.get(page) || [];
          arr.push(b.Text || '');
          pagesMap.set(page, arr);
        }
      }
    }

    if (!resp.NextToken) break;
    nextToken = resp.NextToken;
    if (++pageCountGuard > TEXTRACT_PAGE_GUARD) { // hard cap to avoid pathological loops
      break;
    }
  }

  const pages = Array.from(pagesMap.keys()).sort((a,b)=>a-b)
    .map(p => ({ page: p, text: (pagesMap.get(p) || []).join(' ').trim() }));

  // PARTIAL_SUCCESS: allow partial results for client use
  const succeeded = (jobStatus === 'SUCCEEDED' || jobStatus === 'PARTIAL_SUCCESS');

  return {
    success: succeeded,
    requiresOCR: true,
    method: 'OCR (Textract)',
    text: pages,
    totalPages: documentPages || pages.length,
    status: jobStatus
  };
}

// Utility function to save a PDF buffer to a temporary file
const writeTempFile = (buffer, filename) => {
    // Sanitize filename and prevent traversal; fall back to generated name if invalid
    const candidate = path.basename(filename);
    const safeName = /^[a-zA-Z0-9._-]+$/.test(candidate) ? candidate : `tmp-${Date.now()}.pdf`;
    const filePath = path.join(os.tmpdir(), safeName);
    fs.writeFileSync(filePath, buffer);
    return filePath;
};

// Main function to extract text from PDF, OCR fallback if necessary
export async function extractTextFromPdf(buffer) {
    // Initialize result object to hold extraction outcomes and metadata
    const result = {
        success: false,
        text: [],
        totalPages: 0,
        requiresOCR: false,
        method: '',
    };

    // Validate input type: must be a Buffer containing PDF binary data
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('extractTextFromPdf expects a Buffer. Got type: ' + typeof buffer);
    }
    // Security/validation: limit PDF size to prevent excessive memory usage or DoS
    if (buffer.length > MAX_PDF_SIZE) {
        const err = new Error(
            `PDF size (${(buffer.length / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of ${(MAX_PDF_SIZE / 1024 / 1024).toFixed(2)} MB`
        );
        err.code = 'ERR_PDF_TOO_LARGE';
        throw err;
    }

    // Read OCR provider at runtime so .env is available even if this module is imported before dotenv loads
    const ocrProvider = (process.env.OCR_PROVIDER || '').toLowerCase();
    if (isDev) console.log('[OCR_PROVIDER]', ocrProvider || '(unset)');

    // Attempt direct text extraction using pdfjsLib
    try {
        // Load PDF document from buffer using pdfjsLib
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pages = [];

        // Iterate through each page to extract text content
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Concatenate text strings from page items
            const pageText = textContent.items.map(item => item.str).join(' ');
            pages.push({ page: i, text: pageText.trim() });
        }

        // Combine all page texts to check overall content length
        const combinedText = pages.map(p => p.text).join(' ').trim();

        // If extracted text is sufficiently long, consider extraction successful
        const minLen = MIN_TEXT_LENGTH;
        if (combinedText.length > minLen) {
            result.success = true;
            result.text = pages;
            result.totalPages = numPages;
            result.requiresOCR = false;
            result.method = 'Direct extraction';
            return result; // Return early since direct extraction succeeded
        }
    } catch (err) {
        // Log warning but do not throw; fallback to OCR if direct extraction fails
        console.warn('Direct text extraction failed:', err.message);
    }

    // If direct extraction failed or text was too short, proceed to OCR fallback

    // Two OCR paths:
    // 1) If configured for serverless/cloud, use AWS Textract processing.
    // 2) Otherwise, fallback to local Tesseract OCR with pdf2pic conversion.
    try {
        result.requiresOCR = true;
        result.method = 'OCR (Local)'; // default, overridden if Textract path used

        // If configured for serverless: prefer AWS Textract (async) and return a queued job
        if (ocrProvider === 'aws-textract') {
            try {
                const s3Key = await uploadPdfToS3(buffer);
                const jobId = await startTextractJob(s3Key);
                return {
                    success: false,
                    requiresOCR: true,
                    method: 'OCR (Textract)',
                    text: [],
                    totalPages: 0,
                    queued: true,
                    jobId,
                    s3Key,
                    statusCode: 202 // signal that the job has been accepted
                };
            } catch (cloudErr) {
                if (isDev) console.warn('Textract start failed:', cloudErr.message);
                // If running in cloud-only mode, do not silently fall back to local OCR
                if ((process.env.CLOUD_OCR_ONLY || '').toLowerCase() === 'true') {
                    throw new Error(`Textract failed to start: ${cloudErr.message}`);
                }
                // Otherwise, fall through to local OCR for developer convenience
            }
        }

        // Local Tesseract OCR fallback with pdf2pic image conversion
        const tempFile = writeTempFile(buffer, `ocr-temp-${Date.now()}.pdf`);
        const tempImages = [];

        try {
            // Convert PDF pages to images using pdf2pic
            const convert = fromPath(tempFile, {
                density: PDF2PIC_DENSITY, // Image resolution for better OCR accuracy
                saveFilename: 'ocr-image',
                savePath: os.tmpdir(), // Save images in OS temp directory
                format: 'png' // Use PNG format for lossless images
            });
            // Try to determine page count via pdfjs; if available, do page-by-page conversion to reduce peak memory.
            let pageCount;
            try {
                const infoTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
                const pdfInfo = await infoTask.promise;
                pageCount = pdfInfo.numPages;
            } catch { /* ignore and fall back to bulk */ }

            if (pageCount && typeof convert.convert === 'function') {
                // Page-by-page: convert and OCR each page, cleaning up the image immediately
                result.totalPages = pageCount;
                for (let p = 1; p <= pageCount; p++) {
                    try {
                        const img = await convert.convert(p);
                        const imgPath = img?.path || img; // pdf2pic returns an object with .path
                        const ocrResult = await Tesseract.recognize(imgPath, OCR_LANGS);
                        result.text.push({ page: p, text: ocrResult.data.text.trim() });
                        // Clean up this page image as soon as we’re done
                        if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                    } catch (err) {
                        console.warn(`OCR failed on page ${p}:`, err.message);
                        result.text.push({ page: p, text: '[OCR failed]' });
                    }
                }
            } else {
                // Fallback: bulk convert all pages, then OCR (older pdf2pic or when page count unavailable)
                const pages = await convert.bulk(-1);
                tempImages.push(...pages);
                result.totalPages = pages.length;
                for (const [i, page] of pages.entries()) {
                    try {
                        const ocrResult = await Tesseract.recognize(page.path, OCR_LANGS);
                        result.text.push({ page: i + 1, text: ocrResult.data.text.trim() });
                    } catch (err) {
                        console.warn(`OCR failed on page ${i + 1}:`, err.message);
                        result.text.push({ page: i + 1, text: '[OCR failed]' });
                    }
                }
            }
            // Mark overall OCR process as successful and method as (Local)
            result.success = true;
            result.method = 'OCR (Local)';

        } finally {
            // Cleanup temporary files asynchronously to avoid blocking event loop
            try { await fs.promises.unlink(tempFile); } catch {}
            await Promise.allSettled(
              tempImages.map(p => fs.promises.unlink(p.path).catch(() => {}))
            );
        }
    } catch (ocrErr) {
        // Log any errors encountered during OCR processing
        console.error('OCR failed:', ocrErr.message);
    }

    // Return the result object, indicating success or failure and any extracted text
    return result;
}

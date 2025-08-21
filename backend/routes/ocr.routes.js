import express from 'express';
import multer from 'multer';
import { startOcr, getOcrStatus } from '../controllers/ocr.controller.js';

// Create an isolated router instance for OCR endpoints
const router = express.Router();

// Use in-memory storage so the uploaded PDF is available in req.file.buffer.
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /ocr/start
 * Upload a PDF and trigger OCR.
 * - Content-Type: multipart/form-data, field name: `file`
 * - Returns queued job info (Textract) or direct text (local)
 * Example:
 *   curl -F "file=@backend/test-files/test-text-document.pdf" http://localhost:5050/api/ocr/start
 */
router.post('/ocr/start', upload.single('file'), startOcr);

/**
 * GET /ocr/status/:id
 * Poll status of an OCR job by JobId.
 * - Path param: `id` (Textract JobId)
 * - Returns { success, status, text, totalPages, requiresOCR, method }
 * Example:
 *   GET /api/ocr/status/abcdef123...
 */
router.get('/ocr/status/:id', getOcrStatus);

export default router;
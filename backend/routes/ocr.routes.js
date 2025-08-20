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
 * - multipart/form-data, field `file`
 * - Returns queued job info (Textract) or direct text (local)
 */
router.post('/ocr/start', upload.single('file'), startOcr);

/**
 * GET /ocr/status
 * Poll status of an OCR job by JobId.
 * - id (query param)
 * - Returns { success, status, text, totalPages }
 */
router.get('/ocr/status', getOcrStatus);

export default router;
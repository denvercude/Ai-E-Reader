import { extractTextFromPdf, getTextractResult } from '../services/textExtraction.service.js';

// Handles the initiation of OCR processing on a PDF file.
export async function startOcr(req, res) {
  try {

    // only supports multipart upload (field: 'file')
    const buffer = req.file?.buffer;
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return res.status(400).json({
        error: 'No PDF file provided. Upload using multipart/form-data with field "file".'
      });
    }

    // Call the service function to extract text from the PDF buffer.
    const out = await extractTextFromPdf(buffer);

    // Respond with the extracted text data or queued job metadata.
    if (out && out.queued && out.jobId) {
      res.set('Location', `/api/ocr/status/${out.jobId}`);
      res.set('Retry-After', '2'); // hint poll cadence (seconds)
      return res.status(202).json(out);
    }
    return res.status(200).json(out);
  } catch (err) {
    // Log the error and return a 500 response with the error message.
    console.error('startOcr error:', err);
    const status = err.code === 'ERR_PDF_TOO_LARGE' ? 413 : 500;
    const message = err.code === 'ERR_PDF_TOO_LARGE' ? 'PDF too large' : 'Unexpected server error';
    return res.status(status).json({ error: message, code: err.code });
  }
}

// Handles requests to retrieve the status or result of an OCR job.
export async function getOcrStatus(req, res) {
  try {
    const { id } = req.params;

    // Validate that the job ID is provided in the path parameters.
    if (!id) return res.status(400).json({ error: 'Missing jobId (/ocr/status/:id)' });

    // Ask the service for the current status/result and return it as-is
    const out = await getTextractResult(id);
    res.set('Cache-Control', 'no-store');
    const code = out?.status === 'IN_PROGRESS' ? 202 : 200;
    if (code === 202) {
      res.set('Retry-After', '2');
    }
    return res.status(code).json(out);
  } catch (err) {
    // Log the error and return a 500 response with the error message.
    console.error('getOcrStatus error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
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

    // Respond with the extracted text data.
    return res.status(200).json(out);
  } catch (err) {
    // Log the error and return a 500 response with the error message.
    console.error('startOcr error:', err);
    return res.status(500).json({ error: err.message });
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
    return res.status(200).json(out);
  } catch (err) {
    // Log the error and return a 500 response with the error message.
    console.error('getOcrStatus error:', err);
    return res.status(500).json({ error: err.message });
  }
}
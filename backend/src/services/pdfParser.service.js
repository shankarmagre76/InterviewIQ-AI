import { createRequire } from 'module';
import fs from 'fs';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : (pdfParseModule.default || pdfParseModule);

/**
 * PDF Text Extraction Service
 * Dedicated service for parsing, extracting, normalizing, and validating text content from PDF documents.
 */
class PdfParserService {
  /**
   * Normalize extracted PDF text content for downstream AI LLM processing.
   * Performs line-break standardization, control character stripping,
   * horizontal space collapsing, and paragraph formatting.
   *
   * @param {string} rawText - Raw uncleaned text string extracted from PDF
   * @returns {string} Clean, normalized text string
   */
  normalizeText(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return '';
    }

    return (
      rawText
        // Step 1: Standardize Windows (\r\n) and Mac (\r) line breaks to standard Unix (\n)
        .replace(/\r\n|\r/g, '\n')
        // Step 2: Remove non-printable control characters (excluding newline \n and tab \t)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        // Step 3: Split into lines, trim horizontal whitespace from each line, and filter out noise
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
        // Step 4: Collapse 3 or more consecutive blank line breaks down to 2 newlines (paragraph boundary)
        .replace(/\n{3,}/g, '\n\n')
        // Step 5: Trim leading and trailing whitespace from the final document
        .trim()
    );
  }

  /**
   * Extract text and metadata from a PDF file Buffer.
   *
   * @param {Buffer} pdfBuffer - Binary PDF file buffer
   * @param {object} [options={}] - Optional pdf-parse library options
   * @returns {Promise<{ text: string, pageCount: number, wordCount: number, characterCount: number, info: object }>}
   */
  async extractTextFromBuffer(pdfBuffer, options = {}) {
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw ApiError.badRequest('Invalid input. A valid PDF file buffer is required for text extraction.');
    }

    let parsedData;
    try {
      parsedData = await pdfParse(pdfBuffer, options);
    } catch (error) {
      logger.error(`PDF parsing failed: ${error.message}`);
      throw ApiError.badRequest(
        'Failed to parse PDF document. The file may be encrypted, corrupted, or invalid.'
      );
    }

    if (!parsedData) {
      throw ApiError.internal('PDF parser returned an empty response.');
    }

    const rawText = parsedData.text || '';
    const normalizedText = this.normalizeText(rawText);

    // Empty or Scanned PDF Detection Rule:
    // If the normalized text length is less than 30 chars or contains fewer than 15 alphanumeric chars,
    // the document is likely a scanned image PDF (OCR required) or an empty document.
    const alphanumericMatches = normalizedText.match(/[a-zA-Z0-9]/g) || [];
    if (normalizedText.length < 30 || alphanumericMatches.length < 15) {
      logger.warn('Empty or scanned PDF detected during text extraction.');
      throw ApiError.badRequest(
        'Scanned image or unreadable PDF detected. No extractable text found. Please upload a text-based PDF document.'
      );
    }

    const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
    const characterCount = normalizedText.length;
    const pageCount = parsedData.numpages || 1;

    logger.info(
      `Successfully extracted ${wordCount} words (${characterCount} chars) across ${pageCount} page(s).`
    );

    return {
      text: normalizedText,
      pageCount,
      wordCount,
      characterCount,
      info: parsedData.info || {},
    };
  }

  /**
   * Fetch a remote PDF from a Cloudinary or HTTPS URL and extract its text content.
   *
   * @param {string} pdfUrl - Public HTTPS URL of the PDF document
   * @returns {Promise<{ text: string, pageCount: number, wordCount: number, characterCount: number, info: object }>}
   */
  async extractTextFromUrl(pdfUrl) {
    if (!pdfUrl || typeof pdfUrl !== 'string' || !pdfUrl.match(/^https?:\/\/.+/)) {
      throw ApiError.badRequest('A valid HTTPS PDF URL is required for remote text extraction.');
    }

    let response;
    try {
      response = await fetch(pdfUrl);
    } catch (fetchError) {
      logger.error(`Failed to fetch PDF from URL (${pdfUrl}): ${fetchError.message}`);
      throw ApiError.badRequest(`Failed to download PDF document from URL: ${fetchError.message}`);
    }

    if (!response.ok) {
      throw ApiError.badRequest(
        `Failed to download PDF document. Storage server returned status ${response.status}.`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    return await this.extractTextFromBuffer(pdfBuffer);
  }

  /**
   * Read a local PDF file from disk and extract its text content.
   *
   * @param {string} filePath - Absolute or relative local file path
   * @returns {Promise<{ text: string, pageCount: number, wordCount: number, characterCount: number, info: object }>}
   */
  async extractTextFromLocalPath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw ApiError.badRequest('A valid local file path is required.');
    }

    let pdfBuffer;
    try {
      pdfBuffer = await fs.promises.readFile(filePath);
    } catch (readError) {
      logger.error(`Failed to read local PDF file (${filePath}): ${readError.message}`);
      throw ApiError.badRequest(`Local PDF file not found or unreadable: ${readError.message}`);
    }

    return await this.extractTextFromBuffer(pdfBuffer);
  }
}

export default new PdfParserService();
export { PdfParserService };

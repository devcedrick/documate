import mammoth from 'mammoth';
const SmartParser = require('pdf-parse-new/lib/SmartPDFParser');

// Custom error class for parsing errors
export class ParserError extends Error {
  code: string;
  fileType: string;
  
  constructor(message: string, code: string, fileType: string) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.fileType = fileType;
  }
}

type ParsedContent = {
  text: string;
  metadata?: Record<string, any>;
};

export async function parseFile(fileBuffer: Buffer, mimeType: string): Promise<ParsedContent> {
  console.log(`[Parser] Starting to parse file of type: ${mimeType}`);
  
  if (!fileBuffer || fileBuffer.length === 0) {
    console.error('[Parser] Error: Empty file buffer');
    throw new ParserError('File is empty or corrupted', 'EMPTY_FILE', mimeType);
  }

  console.log(`[Parser] File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);

  try {
    switch (mimeType) {
      case 'application/pdf':
        return await parsePDF(fileBuffer);
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // .docx
        return await parseDOCX(fileBuffer);
        
      case 'text/plain':
        return parseTXT(fileBuffer);
        
      case 'application/msword': // .doc
        console.error('[Parser] Legacy .doc format not supported');
        throw new ParserError(
          'Legacy .doc files are not supported. Please convert to .docx format.',
          'UNSUPPORTED_FORMAT',
          mimeType
        );

      default:
        console.error(`[Parser] Unsupported file type: ${mimeType}`);
        throw new ParserError(
          `Unsupported file type: ${mimeType}. Please upload PDF, DOCX, or TXT files.`,
          'UNSUPPORTED_FORMAT',
          mimeType
        );
    }
  } catch (err: any) {
    // Re-throw ParserErrors as-is
    if (err instanceof ParserError) {
      throw err;
    }
    
    // Wrap other errors
    console.error(`[Parser] Unexpected error parsing ${mimeType}:`, err);
    throw new ParserError(
      `Failed to parse file: ${err.message || 'Unknown error'}`,
      'PARSE_FAILED',
      mimeType
    );
  }
}


async function parsePDF(buffer: Buffer): Promise<ParsedContent> {
  console.log('[Parser] Parsing PDF...');
  
  try {
    const parser = new SmartParser();
    const data = await parser.parse(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      console.warn('[Parser] PDF parsed but contains no extractable text');
      throw new ParserError(
        'PDF appears to be empty or contains only images. Text extraction failed.',
        'NO_TEXT_CONTENT',
        'application/pdf'
      );
    }
    
    console.log(`[Parser] PDF parsed successfully: ${data.numpages} pages, ${data.text.length} chars`);
    return {
      text: data.text,
      metadata: { pages: data.numpages, info: data.info }
    };
  } catch (err: any) {
    if (err instanceof ParserError) throw err;
    
    console.error('[Parser] PDF parsing error:', err);
    throw new ParserError(
      'Failed to parse PDF. The file may be corrupted or password-protected.',
      'PDF_PARSE_FAILED',
      'application/pdf'
    );
  }
}

async function parseDOCX(buffer: Buffer): Promise<ParsedContent> {
  console.log('[Parser] Parsing DOCX...');
  
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length === 0) {
      console.warn('[Parser] DOCX parsed but contains no text');
      throw new ParserError(
        'Document appears to be empty or contains only images.',
        'NO_TEXT_CONTENT',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    }
    
    if (result.messages && result.messages.length > 0) {
      console.log('[Parser] DOCX parsing warnings:', result.messages);
    }
    
    console.log(`[Parser] DOCX parsed successfully: ${result.value.length} chars`);
    return {
      text: result.value,
      metadata: { messages: result.messages }
    };
  } catch (err: any) {
    if (err instanceof ParserError) throw err;
    
    console.error('[Parser] DOCX parsing error:', err);
    throw new ParserError(
      'Failed to parse DOCX. The file may be corrupted.',
      'DOCX_PARSE_FAILED',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }
}

function parseTXT(buffer: Buffer): ParsedContent {
  console.log('[Parser] Parsing TXT...');
  
  const text = buffer.toString('utf-8');
  
  if (!text || text.trim().length === 0) {
    console.warn('[Parser] TXT file is empty');
    throw new ParserError(
      'Text file is empty.',
      'NO_TEXT_CONTENT',
      'text/plain'
    );
  }
  
  console.log(`[Parser] TXT parsed successfully: ${text.length} chars`);
  return {
    text: text
  };
}
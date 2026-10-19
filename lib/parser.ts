import mammoth from 'mammoth';
const SmartParser = require('pdf-parse-new/lib/SmartPDFParser');

type ParsedContent = {
  text: string;
  metadata?: Record<string, any>;
};

export async function parseFile(fileBuffer: Buffer, mimeType: string): Promise<ParsedContent> {
  switch (mimeType) {
    case 'application/pdf':
      return await parsePDF(fileBuffer);
      
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // .docx
      return await parseDOCX(fileBuffer);
      
    case 'text/plain':
      return parseTXT(fileBuffer);
      
    case 'application/msword': // .doc
      throw new Error("Legacy .doc files are not supported in serverless. Please convert to .docx");

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}


async function parsePDF(buffer: Buffer): Promise<ParsedContent> {
  const parser = new SmartParser();
  const data = await parser.parse(buffer);
  return {
    text: data.text,
    metadata: { pages: data.numpages, info: data.info }
  };
}

async function parseDOCX(buffer: Buffer): Promise<ParsedContent> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    metadata: { messages: result.messages }
  };
}

function parseTXT(buffer: Buffer): ParsedContent {
  return {
    text: buffer.toString('utf-8')
  };
}
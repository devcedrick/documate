interface ChunkConfig {
  size: number; // size = no. of characters
  overlap: number;
}

export type TextChunk = {
  content: string;
  charCount: number;
};


// 1 Token ≈ 4 Characters.
const CHUNK_CONFIG: Record<string, ChunkConfig> = {
  student:   { size: 4000, overlap: 400 },
  legal:     { size: 6000, overlap: 600 },
  research:  { size: 5000, overlap: 500 },
  technical: { size: 4500, overlap: 450 }, 
  general:   { size: 3000, overlap: 300 },
};

export function chunkText(text: string, useCase: string = 'general'): TextChunk[] {
  const config = CHUNK_CONFIG[useCase] || CHUNK_CONFIG['general'];
  const separators = ["\n\n", "\n", ". ", "? ", "! ", " ", ""];
  
  const chunks = recursiveSplit(text, separators, config.size, config.overlap);
  
  return chunks.filter(chunk => chunk.content.trim().length > 0);
}

function recursiveSplit(
  text: string, 
  separators: string[], 
  chunkSize: number, 
  chunkOverlap: number
): TextChunk[] {
  const finalChunks: TextChunk[] = [];
  let separator = separators[0];
  let nextSeparators = separators.slice(1);

  let usedSeparator = "";
  for (const s of separators) {
    if (text.includes(s)) {
      usedSeparator = s;
      separator = s;
      nextSeparators = separators.slice(separators.indexOf(s) + 1);
      break;
    }
  }

  // Split the text
  const splits = text.split(separator);
  let currentChunk: string[] = [];
  let currentLen = 0;

  for (const split of splits) {
    const splitLen = split.length;
    
    if (splitLen > chunkSize) {
      if (currentChunk.length > 0) {
        const joined = currentChunk.join(usedSeparator || "");
        finalChunks.push({ content: joined, charCount: joined.length });
        currentChunk = [];
        currentLen = 0;
      }
      // Recursively split this giant segment
      const subChunks = recursiveSplit(split, nextSeparators, chunkSize, chunkOverlap);
      finalChunks.push(...subChunks);
      continue;
    }

    // Accumulate chunks until we hit the size limit
    if (currentLen + splitLen + (usedSeparator.length) > chunkSize) {
      const joined = currentChunk.join(usedSeparator || "");
      finalChunks.push({ content: joined, charCount: joined.length });
      
      const overlapBuffer = [];
      let overlapLen = 0;
      for (let i = currentChunk.length - 1; i >= 0; i--) {
        if (overlapLen < chunkOverlap) {
          overlapBuffer.unshift(currentChunk[i]);
          overlapLen += currentChunk[i].length;
        } else {
          break;
        }
      }
      currentChunk = overlapBuffer;
      currentLen = overlapLen;
    }

    currentChunk.push(split);
    currentLen += splitLen + (usedSeparator ? usedSeparator.length : 0);
  }

  // Push the final remaining text
  if (currentChunk.length > 0) {
    const joined = currentChunk.join(usedSeparator || "");
    finalChunks.push({ content: joined, charCount: joined.length });
  }

  return finalChunks;
}

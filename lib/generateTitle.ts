import { generateText } from 'ai';
import { google } from "@ai-sdk/google";

export async function generateTitle(content: string): Promise<string> {
  let title
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `Generate a concise title (max 5 words) for a document with the following content:\n\n${content}. Return only a plain text title without any additional formatting.`,
    })

    console.log("Generated Title:", text);
    title = text
  } catch (err) {
    console.error("Title generation failed:", err);
  }

  return title || 'Untitled Document';
}

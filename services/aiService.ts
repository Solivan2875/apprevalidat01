import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

// Per guidelines, initialize with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Calls the Gemini API to get a response for a given chat history.
 */
export async function callAI(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  try {
    // Per guidelines, convert chat history to Gemini's format.
    // System message is handled by systemInstruction. 'assistant' role maps to 'model'.
    const contents = messages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));

    // Per guidelines, select model based on task type. This is a basic text task.
    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    // Per guidelines, access text directly from response.text
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a user-friendly error message.
    return "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.";
  }
}

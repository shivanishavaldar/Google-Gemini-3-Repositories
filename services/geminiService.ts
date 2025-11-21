import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeAbstract = async (abstract: string): Promise<string> => {
  try {
    // Using gemini-2.5-flash for speed and efficiency on text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following scientific abstract into 3 concise bullet points suitable for a quick overview. Use plain language where possible.\n\nAbstract:\n${abstract}`,
    });

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Error summarizing abstract:", error);
    throw new Error("Failed to generate summary.");
  }
};

export const explainJargon = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Identify the top 3 most complex technical terms in this text and briefly explain them for a general audience:\n\n"${text}"`,
    });
    return response.text || "No explanations available.";
  } catch (error) {
    console.error("Error explaining jargon:", error);
    throw new Error("Failed to explain terms.");
  }
};

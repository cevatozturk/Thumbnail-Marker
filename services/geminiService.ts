
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ImageSize, AspectRatio } from "../types";

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
  async generateSEOAndPrompt(title: string, description: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a YouTube thumbnail SEO strategy for a video titled "${title}" with description "${description}". 
      Return 3-4 punchy English "hook" phrases (short, high-impact) and a detailed image prompt. 
      The image prompt should describe the visual scene but EXCLUDE the text itself.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategy: { type: Type.STRING },
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
            hooks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Short, high-impact English text phrases."
            },
            imagePrompt: { type: Type.STRING, description: "Detailed visual scene description without text instructions." }
          },
          required: ["suggestedTitle", "keywords", "strategy", "colors", "hooks", "imagePrompt"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  async generateThumbnailImage(basePrompt: string, hookText: string, videoTitle: string, ratio: AspectRatio) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const finalPrompt = `Create a professional YouTube thumbnail.
Visual Composition: ${basePrompt}.
Required Text Overlays:
1. Primary Hook: "${hookText.toUpperCase()}" (Must be large and bold)
2. Supporting Title: "${videoTitle}"
Style: Vibrant, high-contrast, professional YouTube aesthetic. Use modern English typography.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: ratio
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("AI did not provide a response. This may be due to safety filters.");
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("AI returned empty content.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image generation failed.");
  },

  async editThumbnail(base64Image: string, instruction: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png',
            },
          },
          { text: instruction },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Editing failed.");
  },

  async analyzeThumbnail(base64Image: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png',
            },
          },
          { text: "Analyze this YouTube thumbnail for CTR potential. Provide structured data for an infographic dashboard. All analysis must be in English." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER, description: "Total CTR score out of 10" },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER, description: "Percentage from 0 to 100" }
                }
              }
            },
            colorPsychology: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  color: { type: Type.STRING, description: "Hex code or name" },
                  emotion: { type: Type.STRING }
                }
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            eyeTrackingDescription: { type: Type.STRING, description: "Short description of the visual hierarchy" }
          },
          required: ["overallScore", "metrics", "strengths", "weaknesses", "actionPlan"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  async *chatAssistantStream(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an expert YouTube growth consultant. Help users with video strategy, trends, and thumbnail design in English. Provide insights in a structured but conversational way."
      },
    });
    
    for await (const chunk of responseStream) {
      yield {
        text: chunk.text,
        grounding: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    }
  },

  async textToSpeech(text: string, voiceName: string, styleInstruction: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `${styleInstruction}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS failed");
    return base64Audio;
  }
};

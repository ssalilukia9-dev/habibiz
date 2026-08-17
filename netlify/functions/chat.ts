import { Handler } from '@netlify/functions';
import { GoogleGenAI } from "@google/genai";

export const handler: Handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { contents, systemInstruction } = JSON.parse(event.body || '{}');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "GEMINI_API_KEY is not configured on Netlify. Please add it to your Site Settings > Environment Variables." })
      };
    }

    const client = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'sanctuary-netlify-deploy',
        }
      }
    });
    
    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction
      }
    });

    const text = response.text || "I apologize, I couldn't process that.";
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text })
    };
  } catch (error: any) {
    console.error("Netlify Function AI Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to communicate with AI", 
        details: error?.message 
      })
    };
  }
};

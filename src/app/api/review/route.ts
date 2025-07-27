import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
    const body = await request.json();
    const prompt = body.prompt;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINIE_API_KEY as string });

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt parameter is missing' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        systemInstruction: "You are a code reviewer AI. Provide constructive feedback, identify potential bugs, suggest improvements, and explain best practices. Focus on readability, efficiency, and maintainability.",
        contents: prompt,
    });


    return new Response(JSON.stringify({ response: response.text }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}
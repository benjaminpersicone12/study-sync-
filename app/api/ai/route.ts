import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages, subject, mode } = await request.json();
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "AI is not connected yet. Add your Gemini API key in Vercel Environment Variables." }, { status: 503 });
    const ai = new GoogleGenAI({ apiKey: key });
    const history = Array.isArray(messages) ? messages : [];
    const prompt = history.map((m: {role:string; content:string}) => `${m.role === "assistant" ? "Tutor" : "Student"}: ${m.content}`).join("\n\n");
    const context = subject ? `The student is studying ${subject}.` : "You are the student's general study companion.";
    const task = mode === "quiz" ? "Create a short age-appropriate quiz based only on the topic the student gives. Include answers separately at the end." : "Explain clearly, encourage learning, and guide the student step by step without simply doing all their work.";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${context} ${task}\n\nConversation:\n${prompt}`
    });
    return NextResponse.json({ reply: response.text || "I couldn't generate a response. Please try again." });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

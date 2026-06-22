// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use flash — fast, free tier, plenty capable for summaries
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

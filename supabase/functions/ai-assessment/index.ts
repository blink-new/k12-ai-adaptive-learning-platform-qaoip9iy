import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { question, answer, type } = await req.json();
    if (!question || !answer) {
      return new Response(JSON.stringify({ error: "Missing question or answer" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prompt Gemini to grade and give feedback
    const prompt =
      type === 'mcq'
        ? `You are an expert K-12 teacher. Grade the following multiple choice answer. Question: "${question}" Student's answer: "${answer}". Reply with {"score": 0 or 1, "feedback": "..."}`
        : `You are an expert K-12 teacher. Grade the following open-ended answer. Question: "${question}" Student's answer: "${answer}". Reply with {"score": 0-100, "feedback": "..."}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
      },
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse the JSON from Gemini's response
    let result = { score: null, feedback: "No feedback." };
    try {
      result = JSON.parse(text);
    } catch (e) {
      result.feedback = text;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI Assessment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

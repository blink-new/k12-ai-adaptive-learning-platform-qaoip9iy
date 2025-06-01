import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    const { student_id, question_id, score, feedback, current_topic, progress } = await req.json();

    if (!student_id || !question_id || score === undefined || !current_topic || !progress) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert assessment result
    const { error: insertError } = await supabase.from('assessments').insert([{ student_id, question_id, score, feedback }]);
    if (insertError) {
      console.error('Error inserting assessment:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Upsert learning path progress
    const { error: upsertError } = await supabase.from('learning_paths').upsert([{ student_id, current_topic, progress, updated_at: new Date().toISOString() }], { onConflict: ['student_id'] });
    if (upsertError) {
      console.error('Error upserting learning path:', upsertError);
      return new Response(JSON.stringify({ error: upsertError.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error in save-assessment function:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

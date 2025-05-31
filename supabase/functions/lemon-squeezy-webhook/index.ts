import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

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
    const body = await req.json();
    // Example: LemonSqueezy sends event type and subscription info
    const eventType = body.meta?.event_name;
    const parentId = body.data?.attributes?.custom_data?.parent_id;
    const subscriptionStatus = body.data?.attributes?.status;
    const subscriptionId = body.data?.id;
    const planType = body.data?.attributes?.variant_name;
    const price = body.data?.attributes?.total;

    if (!parentId || !eventType) {
      return new Response(JSON.stringify({ error: "Missing parentId or eventType" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle subscription created/updated/canceled
    if (eventType === "subscription_created" || eventType === "subscription_updated") {
      // Update parent subscription status
      await supabase.from("parents").update({
        subscription_status: subscriptionStatus === "active" ? "paid" : "free"
      }).eq("id", parentId);
      // Optionally, insert/update subscriptions table
      await supabase.from("subscriptions").upsert({
        id: subscriptionId,
        parent_id: parentId,
        plan_type: planType,
        price: price,
        active: subscriptionStatus === "active"
      });
    }
    if (eventType === "subscription_cancelled") {
      await supabase.from("parents").update({
        subscription_status: "free"
      }).eq("id", parentId);
      await supabase.from("subscriptions").update({
        active: false
      }).eq("id", subscriptionId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const lemonSqueezyApiKey = Deno.env.get("LEMON_SQUEEZY_API_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { customerId } = await req.json();
    if (!customerId) {
      return new Response(JSON.stringify({ error: "Missing customerId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Call LemonSqueezy API to create a customer portal session
    const portalRes = await fetch("https://api.lemonsqueezy.com/v1/customer_portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lemonSqueezyApiKey}`,
      },
      body: JSON.stringify({
        customer_id: customerId
      }),
    });

    if (!portalRes.ok) {
      const errorData = await portalRes.json();
      return new Response(JSON.stringify({ error: errorData }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const portalData = await portalRes.json();
    return new Response(JSON.stringify({ url: portalData.data.attributes.url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

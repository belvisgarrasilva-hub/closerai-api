import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ⚠️ IMPORTANTE: NO SQL EXEC aquí (Supabase no lo permite directo)
// Solo verificamos existencia real

export async function GET() {
  try {
    const status = {
      leads: "unknown",
      messages: "unknown"
    };

    // 🔥 CHECK leads
    const leads = await supabase
      .from("leads")
      .select("id")
      .limit(1);

    status.leads = leads.error ? "missing" : "ok";

    // 🔥 CHECK messages
    const messages = await supabase
      .from("messages")
      .select("id")
      .limit(1);

    status.messages = messages.error ? "missing" : "ok";

    return Response.json({
      ok: true,
      status
    });

  } catch (err) {
    return Response.json({
      ok: false,
      error: err.message
    }, { status: 500 });
  }
}

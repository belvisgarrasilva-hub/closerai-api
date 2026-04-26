import { getAIAnalysis } from "../lib/openai.js";
import { scoreLead } from "../lib/scoring.js";
import { createClient } from "@supabase/supabase-js";

// 🔥 CLIENTE GLOBAL (mejor performance en Vercel)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const {
      customerMessage,
      phone,
      name,
      businessType = "general",
      conversation = ""
    } = req.body;

    if (!customerMessage) {
      return res.status(400).json({ error: "Falta mensaje" });
    }

    // 🔹 IA / fallback
    const ai = await getAIAnalysis({
      message: "",
      customerMessage,
      businessType,
      conversation
    });

    // 🔹 Score
    const score = scoreLead(ai.intent, ai.urgency);

    // 🔥 NUEVO: STAGE (embudo de ventas)
    const stage = ai.stage || "NEW";

    // 🔹 Conversión real
    const converted = ["compro", "quiero", "dale", "ok", "listo"]
      .some(k => customerMessage.toLowerCase().includes(k));

    const timestamp = new Date().toISOString();

    // 🔹 Upsert lead (CRM base)
    if (phone) {
      await supabase.from("leads").upsert([
        {
          phone,
          name: name || "Sin nombre",
          intent: ai.intent,
          score,
          last_message: customerMessage,
          businessType,
          updated_at: timestamp
        }
      ], { onConflict: "phone" });
    }

    // 🔹 Log mensaje (FUNDAMENTAL PARA DASHBOARD)
    await supabase.from("messages").insert([
      {
        phone: phone || "unknown",
        message: customerMessage,
        reply: ai.reply,
        intent: ai.intent,
        stage, // 🔥 NUEVO
        source: ai.source,
        converted,
        businessType,
        created_at: timestamp
      }
    ]);

    // 🔹 Métricas (embudo + ventas)
    await supabase.from("metrics").insert([
      {
        event: converted ? "conversion" : "message",
        businessType,
        created_at: timestamp
      }
    ]);

    return res.status(200).json({
      reply: ai.reply,
      intent: ai.intent,
      stage, // 🔥 IMPORTANTE PARA FRONT
      score,
      converted,
      source: ai.source
    });

  } catch (err) {
    console.error("ERROR processMessage:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}

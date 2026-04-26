import { getAIAnalysis } from "../lib/openai.js";
import { scoreLead } from "../lib/scoring.js";
import { createClient } from "@supabase/supabase-js";

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

    // 🔹 Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // 🔹 IA
    const ai = await getAIAnalysis({
      message: "",
      customerMessage,
      businessType,
      conversation
    });

    // 🔹 Score
    const score = scoreLead(ai.intent, ai.urgency);

    // 🔹 Conversión
    const converted = ["compro", "quiero", "dale", "ok", "listo"]
      .some(k => customerMessage.toLowerCase().includes(k));

    // 🔹 Upsert lead (sin duplicados)
    if (phone) {
      await supabase
        .from("leads")
        .upsert([
          {
            phone,
            name: name || "Sin nombre",
            intent: ai.intent,
            score,
            last_message: customerMessage,
            businessType
          }
        ], { onConflict: "phone" });
    }

    // 🔹 Log mensaje
    await supabase.from("messages").insert([
      {
        phone: phone || "unknown",
        message: customerMessage,
        reply: ai.reply,
        intent: ai.intent,
        source: ai.source,
        converted,
        businessType
      }
    ]);

    // 🔹 Métrica
    await supabase.from("metrics").insert([
      {
        event: converted ? "conversion" : "message"
      }
    ]);

    return res.status(200).json({
      reply: ai.reply,
      intent: ai.intent,
      score,
      converted,
      source: ai.source
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}

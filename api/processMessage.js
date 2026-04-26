import { getAIAnalysis } from "../lib/openai.js";
import { scoreLead } from "../lib/scoring.js";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    // 🔹 Validación básica
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { customerMessage, phone, name, businessType = "general" } = req.body;

    if (!customerMessage) {
      return res.status(400).json({ error: "Falta customerMessage" });
    }

    // 🔹 Supabase (instancia segura para Vercel)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // 🔹 1. IA / fallback
    const ai = await getAIAnalysis({
      message: "",
      customerMessage,
      businessType
    });

    // 🔹 2. Score
    const score = scoreLead(ai.intent, ai.urgency);

    // 🔹 3. Detectar conversión
    const conversionKeywords = ["compro", "quiero", "dale", "ok", "listo"];
    const converted = conversionKeywords.some(k =>
      customerMessage.toLowerCase().includes(k)
    );

    // 🔹 4. Guardar / actualizar lead
    if (phone) {
      await supabase.from("leads").insert([
        {
          phone,
          name: name || "Sin nombre",
          intent: ai.intent,
          score,
          last_message: customerMessage
        }
      ]);
    }

    // 🔹 5. Log mensaje (historial)
    await supabase.from("messages").insert([
      {
        phone: phone || "unknown",
        message: customerMessage,
        reply: ai.reply,
        intent: ai.intent,
        source: ai.source,
        converted
      }
    ]);

    // 🔹 6. Métrica simple
    await supabase.from("metrics").insert([
      {
        event: converted ? "conversion" : "message",
      }
    ]);

    // 🔹 Respuesta final
    return res.status(200).json({
      reply: ai.reply,
      intent: ai.intent,
      score,
      converted,
      source: ai.source || "fallback"
    });

  } catch (err) {
    console.error("PROCESS MESSAGE ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}

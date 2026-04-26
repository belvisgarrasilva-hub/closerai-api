import * as openaiModule from "../lib/openai.js";
import { scoreLead } from "../lib/scoring.js";
import { createClient } from "@supabase/supabase-js";

// 🔥 FIX ESM SAFE IMPORT
const { getAIAnalysis } = openaiModule;

// 🔥 CLIENTE GLOBAL (Vercel optimized)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 💰 Revenue estimado simple (base SaaS)
function estimateRevenue(intent, score) {
  if (intent === "compra") return 100;
  if (intent === "interes" && score > 70) return 40;
  if (intent === "interes") return 20;
  return 0;
}

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
    } = req.body || {};

    if (!customerMessage) {
      return res.status(400).json({ error: "Falta mensaje" });
    }

    // 🔥 IA + fallback seguro
    let ai;

    try {
      ai = await getAIAnalysis({
        message: "",
        customerMessage,
        businessType,
        conversation
      });
    } catch (err) {
      console.log("AI ERROR FALLBACK:", err.message);

      ai = {
        intent: "frio",
        urgency: 30,
        reply: "Hola 👋 ¿en qué puedo ayudarte?",
        stage: "NEW",
        source: "fallback-safe"
      };
    }

    // 🔹 Score
    const score = scoreLead(ai.intent, ai.urgency);

    // 🔥 Stage seguro
    const stage = ai.stage || "NEW";

    // 🔥 CONVERSIÓN
    const converted = ["compro", "quiero", "dale", "ok", "listo"].some(k =>
      customerMessage.toLowerCase().includes(k)
    );

    const timestamp = new Date().toISOString();

    // 💰 REVENUE ESTIMADO
    const revenue = estimateRevenue(ai.intent, score);

    // 🔥 LEAD CALIENTE
    const isHot = score >= 80 || ai.intent === "compra";

    // 🔥 BUSINESS ID (multi-tenant SaaS base)
    const business_id = businessType;

    // 🔥 UPSERT LEADS (CRM principal)
    if (phone) {
      const { error: leadError } = await supabase.from("leads").upsert(
        [
          {
            phone,
            name: name || "Sin nombre",
            intent: ai.intent,
            score,
            last_message: customerMessage,
            businessType,
            business_id,
            revenue,
            is_hot: isHot,
            updated_at: timestamp
          }
        ],
        { onConflict: "phone" }
      );

      if (leadError) {
        console.log("LEAD ERROR:", leadError.message);
      }
    }

    // 🔥 LOG MESSAGES (dashboard + analytics)
    const { error: msgError } = await supabase.from("messages").insert([
      {
        phone: phone || "unknown",
        message: customerMessage,
        reply: ai.reply,
        intent: ai.intent,
        stage,
        score,
        source: ai.source,
        converted,
        businessType,
        business_id,
        revenue_estimate: revenue,
        created_at: timestamp
      }
    ]);

    if (msgError) {
      console.log("MESSAGE ERROR:", msgError.message);
    }

    // 🔥 METRICS (embudo + conversion tracking)
    const { error: metricError } = await supabase.from("metrics").insert([
      {
        event: converted ? "conversion" : "message",
        businessType,
        business_id,
        created_at: timestamp
      }
    ]);

    if (metricError) {
      console.log("METRICS ERROR:", metricError.message);
    }

    // 🔥 RESPONSE FINAL (frontend + WhatsApp ready)
    return res.status(200).json({
      reply: ai.reply,
      intent: ai.intent,
      stage,
      score,
      converted,
      revenue,
      isHot,
      businessType,
      source: ai.source
    });

  } catch (err) {
    console.error("CRITICAL ERROR processMessage:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}

import { getAIAnalysis } from "../lib/openai.js";
import { scoreLead } from "../lib/scoring.js";

export default async function handler(req, res) {
  const { customerMessage, phone, name } = req.body;

  // 1. IA / fallback
  const ai = await getAIAnalysis({
    message: "",
    customerMessage
  });

  // 2. Score
  const score = scoreLead(ai.intent, ai.urgency);

  // 3. Detectar conversión
  const conversionKeywords = ["compro", "quiero", "dale", "ok"];
  const converted = conversionKeywords.some(k =>
    customerMessage.toLowerCase().includes(k)
  );

  // 4. Guardar lead
  // (podés reutilizar tu upsertLead)

  // 5. Log mensaje
  // (logMessage)

  return res.status(200).json({
    reply: ai.reply,
    intent: ai.intent,
    score,
    converted,
    source: ai.source || "fallback"
  });
}

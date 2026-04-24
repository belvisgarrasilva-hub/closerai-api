import { getAIAnalysis } from "../lib/openai.js";
import { scoreLead } from "../lib/scoring.js";

export default async function handler(req, res) {
  try {
    const { message, customerMessage, conversation } = req.body;

    const ai = await getAIAnalysis({
      message,
      customerMessage,
      conversation
    });

    const score = scoreLead(ai.intent, ai.urgency);

    return res.status(200).json({
      intent: ai.intent,
      score,
      suggestion: ai.reply,
      urgency: ai.urgency
    });

  } catch (err) {
    return res.status(500).json({ error: "analyze failed" });
  }
}

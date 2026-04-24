import { getAIAnalysis } from "../lib/openai.js";

export default async function handler(req, res) {
  const { customerMessage, intent, score } = req.body;

  const ai = await getAIAnalysis({
    customerMessage,
    message: ""
  });

  return res.status(200).json({
    message: ai.reply
  });
}

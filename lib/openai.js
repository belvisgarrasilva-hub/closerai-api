import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAIAnalysis({ message, customerMessage, conversation }) {
  try {
    const prompt = `
Sos un closer de ventas experto en WhatsApp.

Analizá esta conversación:

Cliente: "${customerMessage}"
Vendedor: "${message}"

Clasificá:
- intención: compra | interes | duda | frio
- urgencia: número del 1 al 100

Generá:
- mejor respuesta para cerrar la venta

Respondé SOLO en JSON válido así:
{
  "intent": "...",
  "urgency": 50,
  "reply": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;

    return JSON.parse(result);

  } catch (error) {
    console.error("OpenAI error:", error);

    return {
      intent: "interes",
      urgency: 50,
      reply: "Gracias por tu mensaje 🙌 te cuento más detalles..."
    };
  }
}

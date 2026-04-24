export async function getAIAnalysis({ message, customerMessage, conversation }) {

  const prompt = `
Sos un closer de ventas experto en WhatsApp.

Analizá:

Cliente: "${customerMessage}"
Vendedor: "${message}"

Clasificá:
- intención: compra | interes | duda | frío
- urgencia: 1 a 100

Generá:
- mejor respuesta para cerrar venta
`;

  // MOCK (después conectás OpenAI real)
  return {
    intent: "interes",
    urgency: 70,
    reply: "Genial 🙌 te cuento cómo funciona..."
  };
}

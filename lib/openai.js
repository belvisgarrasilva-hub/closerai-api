import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 Estilos por tipo de negocio
const styles = {
  comida: "😋",
  tecnologia: "🔧",
  ropa: "👕",
  general: "💬"
};

// 🔹 Fallback inteligente (modo vendedor real)
function fallbackAI(customerMessage = "", businessType = "general") {
  const msg = customerMessage.toLowerCase();

  let intent = "frio";
  let urgency = 30;
  let reply = "";

  const emoji = styles[businessType] || "💬";

  // 🔥 COMPRA → CERRAR
  if (
    msg.includes("quiero") ||
    msg.includes("compro") ||
    msg.includes("dale") ||
    msg.includes("lo llevo")
  ) {
    intent = "compra";
    urgency = 95;

    reply = `${emoji} 🚀 ¡Perfecto! Lo coordinamos ahora mismo.\n\n¿Preferís envío o retiro?`;
  }

  // 🔥 PRECIO → NO INFORMAR, VENDER
  else if (msg.includes("precio") || msg.includes("cuánto")) {
    intent = "interes";
    urgency = 70;

    reply = `${emoji} 🙌 Es uno de los más elegidos por la calidad.\n\n¿Querés que te muestre opciones y cómo recibirlo hoy mismo?`;
  }

  // 🔥 DUDA / OBJECIÓN
  else if (
    msg.includes("caro") ||
    msg.includes("mucho") ||
    msg.includes("no sé") ||
    msg.includes("duda")
  ) {
    intent = "duda";
    urgency = 50;

    reply = `${emoji} 👍 Te entiendo. Igual la mayoría lo elige por el resultado que da.\n\n¿Querés que te muestre opciones más accesibles?`;
  }

  // 🔥 INFO → GENERAR DESEO
  else if (msg.includes("info") || msg.includes("cómo funciona")) {
    intent = "interes";
    urgency = 60;

    reply = `${emoji} 🔥 Es súper simple y ya lo están usando muchos clientes.\n\n¿Querés que te muestre ejemplos reales?`;
  }

  // 🔥 DESINTERÉS
  else if (msg.includes("no gracias") || msg.includes("después")) {
    intent = "frio";
    urgency = 10;

    reply = `${emoji} 😊 Perfecto, cuando quieras lo retomamos.\n\n¿Te aviso si sale alguna promo?`;
  }

  // 🔹 FRÍO → ABRIR CONVERSACIÓN
  else {
    intent = "frio";
    urgency = 30;

    reply = `${emoji} 😊 ¡Hola! Contame qué estás buscando y te ayudo rápido.`;
  }

  return {
    intent,
    urgency,
    reply,
    source: "fallback"
  };
}

// 🔹 IA optimizada para cerrar ventas
export async function getAIAnalysis({
  message,
  customerMessage,
  businessType = "general",
  conversation = ""
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Sos un vendedor experto en cerrar ventas por WhatsApp para un negocio tipo ${businessType}.

Tu objetivo es llevar al cliente a la compra lo más rápido posible.

Reglas:
- Respuestas cortas (máx 4 líneas)
- Tono humano, cercano y directo
- Siempre terminar con una pregunta
- Nunca des solo información, siempre empujá a avanzar

Estrategia:
- Precio → responder + valor + invitar a avanzar
- Interés → llevar a cierre
- Dudas → reducir fricción (confianza, opciones)
- Frío → hacer una pregunta simple para activar

Prohibido:
- Respuestas genéricas
- Explicaciones largas
- Sonar como soporte técnico

Actuá como un vendedor real.
`
        },
        {
          role: "user",
          content: `
Historial:
${conversation || "Sin historial"}

Cliente: ${customerMessage}
`
        }
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    return {
      intent: "interes", // después podemos mejorarlo con IA real
      urgency: 60,
      reply,
      source: "openai"
    };

  } catch (error) {
    console.log("⚠️ Fallback:", error.message);

    return fallbackAI(customerMessage, businessType);
  }
}

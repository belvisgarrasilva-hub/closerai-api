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

// 🔹 Fallback inteligente (mejorado + vendedor)
function fallbackAI(customerMessage = "", businessType = "general") {
  const msg = customerMessage.toLowerCase();

  let intent = "frio";
  let urgency = 30;
  let reply = "";

  const emoji = styles[businessType] || "💬";

  // 🔥 INTENCIÓN: PRECIO
  if (msg.includes("precio") || msg.includes("cuánto")) {
    intent = "interes";
    urgency = 70;
    reply = `${emoji} ¡Buenísima consulta! 🙌 Este es uno de los productos más elegidos.\n\n¿Querés que te pase opciones y cómo recibirlo hoy mismo?`;
  }

  // 🔥 INTENCIÓN: COMPRA
  else if (msg.includes("quiero") || msg.includes("compro")) {
    intent = "compra";
    urgency = 95;
    reply = `${emoji} ¡Perfecto! 🚀 Lo coordinamos ahora mismo.\n\n¿Preferís envío o retiro?`;
  }

  // 🔥 INTENCIÓN: INFO
  else if (msg.includes("info") || msg.includes("cómo funciona")) {
    intent = "interes";
    urgency = 60;
    reply = `${emoji} Te explico rápido 👇\n\nEs súper simple y ya lo están usando muchos clientes.\n\n¿Querés que te muestre ejemplos reales?`;
  }

  // 🔥 OBJECIÓN: PRECIO ALTO
  else if (msg.includes("caro") || msg.includes("mucho")) {
    intent = "duda";
    urgency = 50;
    reply = `${emoji} Entiendo 👍 Igual la mayoría lo elige por la relación calidad/precio.\n\n¿Querés que te muestre opciones más económicas?`;
  }

  // 🔥 DESINTERÉS
  else if (msg.includes("no gracias") || msg.includes("después")) {
    intent = "frio";
    urgency = 10;
    reply = `${emoji} Perfecto 😊 Quedo a disposición si más adelante querés retomar.`;
  }

  // 🔹 DEFAULT (abre conversación)
  else {
    reply = `${emoji} ¡Hola! 😊 Contame qué estás buscando y te ayudo rápido.`;
  }

  return {
    intent,
    urgency,
    reply,
    source: "fallback"
  };
}

// 🔹 IA + fallback automático
export async function getAIAnalysis({
  message,
  customerMessage,
  businessType = "general"
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Sos un closer experto en ventas por WhatsApp. Respondé de forma breve, clara y orientada a cerrar ventas. Adaptate a un negocio tipo: ${businessType}.`
        },
        {
          role: "user",
          content: `Cliente: ${customerMessage}\nVendedor: ${message}`
        }
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    return {
      intent: "interes", // podés mejorar esto después
      urgency: 60,
      reply,
      source: "openai"
    };

  } catch (error) {
    console.log("⚠️ Usando fallback AI:", error.message);

    return fallbackAI(customerMessage, businessType);
  }
}

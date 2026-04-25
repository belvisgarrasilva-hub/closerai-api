import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 Fallback inteligente (sin IA)
function fallbackAI(customerMessage = "") {
  const msg = customerMessage.toLowerCase();

  let intent = "frio";
  let urgency = 30;
  let reply = "Gracias por tu mensaje 🙌 ¿En qué puedo ayudarte?";

  if (msg.includes("precio") || msg.includes("cuánto")) {
    intent = "interes";
    urgency = 60;
    reply = "¡Genial! 🙌 Te cuento el precio y las opciones disponibles. ¿Querés que te pase más detalles?";
  }

  if (msg.includes("quiero") || msg.includes("compro")) {
    intent = "compra";
    urgency = 90;
    reply = "¡Perfecto! 🚀 Te ayudo a avanzar con la compra. ¿Preferís que te pase el link de pago o coordinar por WhatsApp?";
  }

  if (msg.includes("info") || msg.includes("cómo funciona")) {
    intent = "interes";
    urgency = 50;
    reply = "Claro 🙌 te explico cómo funciona paso a paso para que veas si encaja con lo que necesitás.";
  }

  if (msg.includes("no gracias") || msg.includes("después")) {
    intent = "frio";
    urgency = 10;
    reply = "Perfecto 😊 quedo a disposición si más adelante querés retomar.";
  }

  return { intent, urgency, reply };
}

export async function getAIAnalysis({ message, customerMessage }) {
  try {
    // 🔹 Intentar IA real
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sos un closer experto en ventas por WhatsApp."
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
      intent: "interes",
      urgency: 60,
      reply
    };

  } catch (error) {
    console.log("⚠️ Usando fallback AI:", error.message);

    // 🔥 fallback automático
    return fallbackAI(customerMessage);
  }
}

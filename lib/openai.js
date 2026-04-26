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

// 🔹 Fallback inteligente (vende incluso sin IA)
function fallbackAI(customerMessage = "", businessType = "general") {
  const msg = customerMessage.toLowerCase();

  let intent = "frio";
  let urgency = 30;
  let reply = "";

  const emoji = styles[businessType] || "💬";

  if (msg.includes("precio") || msg.includes("cuánto")) {
    intent = "interes";
    urgency = 70;
    reply = `${emoji} ¡Buenísima consulta! 🙌 Este es uno de los más elegidos.\n\n¿Querés que te pase opciones y cómo recibirlo hoy?`;
  } 
  else if (msg.includes("quiero") || msg.includes("compro")) {
    intent = "compra";
    urgency = 95;
    reply = `${emoji} ¡Perfecto! 🚀 Lo coordinamos ahora mismo.\n\n¿Preferís envío o retiro?`;
  } 
  else if (msg.includes("info") || msg.includes("cómo funciona")) {
    intent = "interes";
    urgency = 60;
    reply = `${emoji} Te explico rápido 👇\n\nEs súper simple y ya lo están usando muchos clientes.\n\n¿Querés ver ejemplos?`;
  } 
  else if (msg.includes("caro") || msg.includes("mucho")) {
    intent = "duda";
    urgency = 50;
    reply = `${emoji} Entiendo 👍 Igual la mayoría lo elige por la relación calidad/precio.\n\n¿Querés ver opciones más económicas?`;
  } 
  else if (msg.includes("no gracias") || msg.includes("después")) {
    intent = "frio";
    urgency = 10;
    reply = `${emoji} Perfecto 😊 Quedo a disposición si querés retomarlo después.`;
  } 
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

// 🔹 IA + prompt vendedor real
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

Tu objetivo es convertir conversaciones en ventas.

Reglas:
- Respuestas cortas (máx 4 líneas)
- Tono humano y cercano
- Siempre terminar con una pregunta
- Enfocarte en beneficios

Estrategia:
- Precio → valor + avanzar
- Interés → cerrar
- Dudas → reducir fricción
- Frío → reactivar

Nunca respondas de forma genérica.
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
      intent: "interes",
      urgency: 60,
      reply,
      source: "openai"
    };

  } catch (error) {
    console.log("⚠️ Fallback:", error.message);

    return fallbackAI(customerMessage, businessType);
  }
}

function fallbackAI(customerMessage = "", businessType = "general") {
  const msg = customerMessage.toLowerCase();

  let intent = "frio";
  let urgency = 30;
  let stage = "NEW";
  let reply = "";

  const isPrice = msg.includes("precio") || msg.includes("cuánto");
  const isBuy = msg.includes("quiero") || msg.includes("compro") || msg.includes("dale") || msg.includes("lo llevo");
  const isInfo = msg.includes("info") || msg.includes("cómo funciona");
  const isObjection = msg.includes("caro") || msg.includes("mucho") || msg.includes("no sé") || msg.includes("duda");
  const isUrgent = msg.includes("ahora") || msg.includes("hoy");

  // 🔥 COMPRA (CIERRE)
  if (isBuy || isUrgent) {
    intent = "compra";
    urgency = 95;
    stage = "LISTO PARA COMPRA";

    reply =
      "🚀 Perfecto, lo hacemos ahora mismo.\n\n" +
      "¿Preferís envío o retiro?";
  }

  // 🔥 PRECIO (INTERÉS + ENGANCHE)
  else if (isPrice) {
    intent = "interes";
    urgency = 70;
    stage = "INTERES";

    reply =
      "🙌 Es una de las mejores opciones por calidad y resultados.\n\n" +
      "¿Querés que te recomiende la mejor opción según lo que buscás?";
  }

  // 🔥 OBJECIÓN (RECUPERAR VENTA)
  else if (isObjection) {
    intent = "duda";
    urgency = 50;
    stage = "CONSIDERANDO";

    reply =
      "👍 Te entiendo, es normal tener esa duda.\n\n" +
      "La mayoría lo elige porque realmente ve resultados.\n\n" +
      "¿Querés que te muestre opciones más accesibles?";
  }

  // 🔥 INFO (EDUCAR + PROGRESAR)
  else if (isInfo) {
    intent = "interes";
    urgency = 60;
    stage = "INTERES";

    reply =
      "🔥 Te explico rápido: es muy simple y ya lo están usando muchos clientes.\n\n" +
      "¿Querés ver un ejemplo real aplicado a tu caso?";
  }

  // 🔥 FRÍO (ACTIVAR CONVERSACIÓN)
  else {
    intent = "frio";
    urgency = 30;
    stage = "NEW";

    reply =
      "💬 ¡Hola! Contame qué estás buscando y te ayudo a elegir la mejor opción.";
  }

  return {
    intent,
    urgency,
    stage,
    reply,
    source: "fallback"
  };
}

export function scoreLead(intent, urgency) {
  let base = 0;

  if (intent === "compra") base = 90;
  if (intent === "interes") base = 60;
  if (intent === "duda") base = 40;
  if (intent === "frio") base = 10;

  return Math.min(100, base + urgency * 0.3);
}

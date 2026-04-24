export default async function handler(req, res) {
  const { original, suggestion } = req.body;

  const variant = Math.random() > 0.5 ? "A" : "B";

  return res.status(200).json({
    testId: crypto.randomUUID(),
    variant,
    message: variant === "A" ? original : suggestion
  });
}

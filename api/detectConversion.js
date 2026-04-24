export default async function handler(req, res) {
  const { customerMessage } = req.body;

  const keywords = ["compro", "quiero", "dale", "ok", "listo"];

  const conversion = keywords.some(k =>
    customerMessage.toLowerCase().includes(k)
  );

  return res.status(200).json({ conversion });
}

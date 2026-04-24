export default async function handler(req, res) {
  try {
    console.log("BODY:", req.body);

    return res.status(200).json({
      ok: true,
      body: req.body
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}

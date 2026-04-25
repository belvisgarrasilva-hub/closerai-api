import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const { event } = req.body || {};

    if (!event) {
      return res.status(400).json({
        ok: false,
        error: "event is required"
      });
    }

    const { data, error } = await supabase
      .from("metrics")
      .insert([{ event }])
      .select();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      message: "Métrica guardada",
      data
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}

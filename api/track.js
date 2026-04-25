import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { event } = req.body;

    const { data, error } = await supabase
      .from("metrics")
      .insert([{ event }]);

    if (error) throw error;

    res.status(200).json({ ok: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  try {
    const data = req.body;

    const { error } = await supabase
      .from("leads")
      .upsert([data], { onConflict: "phone" });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
}

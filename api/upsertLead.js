import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  const data = req.body;

  await supabase
    .from("leads")
    .upsert([data], { onConflict: "phone" });

  res.status(200).json({ ok: true });
}

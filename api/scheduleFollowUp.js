import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  const { phone, sequence } = req.body;

  await supabase.from("followups").insert([
    { phone, sequence }
  ]);

  res.status(200).json({ ok: true });
}

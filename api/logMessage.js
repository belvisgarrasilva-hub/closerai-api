import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  await supabase.from("messages").insert([req.body]);

  res.status(200).json({ ok: true });
}

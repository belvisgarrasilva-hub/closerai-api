import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("score", { ascending: false });

  res.status(200).json(data);
}

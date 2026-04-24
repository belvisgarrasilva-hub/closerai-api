import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    console.log("BODY:", req.body);

    const { phone, name, intent, score, last_message } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone requerido" });
    }

    const { data, error } = await supabase
      .from("leads")
      .insert([
        { phone, name, intent, score, last_message }
      ])
      .select();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}

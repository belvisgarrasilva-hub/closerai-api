import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    console.log("BODY:", req.body);

    const { phone, name, intent, score, last_message } = req.body;

    const { data, error } = await supabase
      .from("leads")
      .insert([
        { phone, name, intent, score, last_message }
      ])
      .select();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return res.status(500).json({
        error: error.message,
        details: error
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
}

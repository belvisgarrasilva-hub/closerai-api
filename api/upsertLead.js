import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    const { phone, name, intent, score, last_message } = req.body;

    const { data, error } = await supabase
      .from("leads")
      .upsert([
        { phone, name, intent, score, last_message }
      ]);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}

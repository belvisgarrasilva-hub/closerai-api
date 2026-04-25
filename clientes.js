import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {

  // 🔹 GET → obtener clientes (leads)
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  // 🔹 POST → crear cliente
  if (req.method === "POST") {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        error: "Faltan datos"
      });
    }

    const { data, error } = await supabase
      .from("leads")
      .insert([{ name, phone }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  // 🔹 Método no permitido
  return res.status(405).json({
    error: "Method not allowed"
  });
}

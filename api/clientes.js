import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {

  // 🔹 CORS (clave para Vercel + frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🔹 GET → obtener clientes
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  // 🔹 POST → crear cliente
  if (req.method === "POST") {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Falta el nombre"
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

  return res.status(405).json({ error: "Method not allowed" });
}

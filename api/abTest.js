import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // 🔹 Test rápido para saber si el deploy está activo
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'API funcionando',
      hasEnv: {
        url: !!process.env.SUPABASE_URL,
        key: !!process.env.SUPABASE_ANON_KEY
      }
    });
  }

  // 🔹 Validar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 🔹 Validar variables de entorno
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({
        error: 'Faltan variables de entorno',
        details: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
        }
      });
    }

    // 🔹 Crear cliente Supabase dentro del handler (más seguro en serverless)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // 🔹 Parsear body correctamente
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const { original, suggestion } = body;

    // 🔹 Validación
    if (!original || !suggestion) {
      return res.status(400).json({
        error: 'Faltan datos',
        received: body
      });
    }

    // 🔹 Generar datos
    const testId = Date.now().toString(); // más compatible que crypto.randomUUID()
    const variant = Math.random() > 0.5 ? "A" : "B";
    const message = variant === "A" ? original

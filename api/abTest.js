import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    // 🔹 Test rápido (GET)
    if (req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        env: {
          url: !!process.env.SUPABASE_URL,
          key: !!process.env.SUPABASE_ANON_KEY
        }
      });
    }

    // 🔹 Solo POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 🔹 Validar env
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({
        error: 'Faltan variables de entorno'
      });
    }

    // 🔹 Crear cliente dentro del handler (clave en Vercel)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // 🔹 Body seguro
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { original, suggestion } = body;

    if (!original || !suggestion) {
      return res.status(400).json({
        error: 'Faltan datos',
        body
      });
    }

    // 🔹 Evitamos crypto.randomUUID (puede romper)
    const testId = Date.now().toString();
    const variant = Math.random() > 0.5 ? "A" : "B";
    const message = variant === "A" ? original : suggestion;

    // 🔹 Insert
    const { data, error } = await supabase
      .from('ab_tests')
      .insert([
        {
          test_id: testId,
          variant,
          original,
          suggestion
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    return res.status(200).json({
      ok: true,
      testId,
      variant,
      message,
      data
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

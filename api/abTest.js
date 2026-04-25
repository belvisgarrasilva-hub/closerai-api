import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // Validar método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Asegurar que el body esté bien parseado
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const { original, suggestion } = body;

    // Validación de datos
    if (!original || !suggestion) {
      return res.status(400).json({ error: 'Faltan datos: original y suggestion son requeridos' });
    }

    const testId = crypto.randomUUID();
    const variant = Math.random() > 0.5 ? "A" : "B";
    const message = variant === "A" ? original : suggestion;

    // Insertar en Supabase
    const { error } = await supabase.from('ab_tests').insert({
      test_id: testId,
      variant,
      original,
      suggestion
    });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Error guardando en base de datos' });
    }

    // Respuesta final
    return res.status(200).json({
      testId,
      variant,
      message
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

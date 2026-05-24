import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase no configurado - usando fallback en memoria')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Funciones para prospectos
export async function saveProspectoSupabase(prospecto: any) {
  if (!supabase) {
    console.warn('Supabase no disponible')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('prospectos_externos')
      .insert([prospecto])
      .select()

    if (error) {
      console.error('Error guardando en Supabase:', error)
      return null
    }
    return data?.[0]
  } catch (err) {
    console.error('Error en saveProspectoSupabase:', err)
    return null
  }
}

export async function getProspectosSupabase() {
  if (!supabase) {
    console.warn('Supabase no disponible')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('prospectos_externos')
      .select('*')
      .order('fecha_registro', { ascending: false })

    if (error) {
      console.error('Error obteniendo prospectos de Supabase:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Error en getProspectosSupabase:', err)
    return []
  }
}

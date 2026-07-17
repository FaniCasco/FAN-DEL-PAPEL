import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseStorageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET?.trim() || 'product-images'

const urlIsPresent = typeof supabaseUrl === 'string' && supabaseUrl.trim().length > 0
const keyIsPresent = typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim().length > 0

let supabase = null
let supabaseConfigError = null

if (urlIsPresent && keyIsPresent) {
  try {
    supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
  } catch (error) {
    supabaseConfigError = error
  }
} else {
  supabaseConfigError = new Error('Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
}

export { supabase, supabaseConfigError, supabaseStorageBucket }

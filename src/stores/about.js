import { defineStore } from 'pinia'
// FIX: saveAboutContent ahora usa upsert con onConflict('id') y mantiene fallback opcional
import { ref } from 'vue'
import { supabase, supabaseConfigError } from '@/lib/supabase'

export const useAboutStore = defineStore('about', () => {
  const hero = ref({
    title: 'Fan del Papel',
    subtitle: 'Encuadernación artesanal hecha con amor',
    image: '',
  })
  
  const sections = ref([
    {
      id: 'default-1',
      type: 'text',
      content: 'Soy un apasionado de la encuadernación. Cada libreta está hecha a mano con dedicación y cuidado en los detalles.',
      order: 0
    }
  ])

  const isLoading = ref(false)
  const error = ref(null)

  const defaultHero = {
    title: 'Fan del Papel',
    subtitle: 'Encuadernación artesanal hecha con amor',
    image: '',
  }

  const defaultSections = [
    {
      id: 'default-1',
      type: 'text',
      content: 'Soy un apasionado de la encuadernación. Cada libreta está hecha a mano con dedicación y cuidado en los detalles.',
      order: 0
    }
  ]

  async function fetchAboutContent() {
    isLoading.value = true
    error.value = null
    try {
      if (supabase) {
        const { data, error: sbError } = await supabase
          .from('about_content')
          .select('*')
          .single()

        if (sbError && sbError.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          throw sbError
        }

        if (data) {
          hero.value = data.hero || defaultHero
          sections.value = data.sections || defaultSections
        } else {
          // No data in Supabase – fallback to local storage
          loadFromLocal()
        }
      } else if (supabaseConfigError) {
        console.error('Supabase config error:', supabaseConfigError)
        loadFromLocal()
      } else {
        // Supabase client not configured – fallback to local storage
        loadFromLocal()
      }
    } catch (err) {
      console.error('SUPABASE ERROR:', err)
      // Keep fallback to local storage on any error
      loadFromLocal()
      error.value = err.message || 'Error al cargar contenido'
    } finally {
      isLoading.value = false
    }
  }

  function loadFromLocal() {
    try {
      const localData = localStorage.getItem('about_content')
      if (localData) {
        const parsed = JSON.parse(localData)
        hero.value = parsed.hero || defaultHero
        sections.value = parsed.sections || defaultSections
      } else {
        hero.value = { ...defaultHero }
        sections.value = [...defaultSections]
      }
    } catch (err) {
      console.error('Error loading from localStorage', err)
      hero.value = { ...defaultHero }
      sections.value = [...defaultSections]
    }
  }

async function saveAboutContent(newData) {
  try {
    if (!supabase) {
      if (supabaseConfigError) {
        console.error('Supabase config error:', supabaseConfigError)
        throw supabaseConfigError
      }
      throw new Error('Supabase no configurado')
    }

    // Upsert using the primary key "id". Guarantees INSERT on first run and UPDATE thereafter.
    const { data, error: sbError } = await supabase
      .from('about_content')
      .upsert({ id: 1, hero: newData.hero, sections: newData.sections }, { onConflict: 'id', returning: 'representation' })
      .select()

    if (sbError) {
        console.error('❌ Supabase upsert error details:', sbError)
        throw sbError
      }
      hero.value = newData.hero
      sections.value = newData.sections
      return { ok: true }
  } catch (err) {
    console.error('❌ Error al guardar en Supabase', err)
    return { ok: false, error: err?.message || 'Error al guardar' }
  }
}

  return {
    hero,
    sections,
    isLoading,
    error,
    fetchAboutContent,
    saveAboutContent
  }
})

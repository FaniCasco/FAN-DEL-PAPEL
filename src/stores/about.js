import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

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

        if (sbError && sbError.code !== 'PGRST116') { // PGRST116 is no rows returned
          throw sbError
        }

        if (data) {
          hero.value = data.hero || defaultHero
          sections.value = data.sections || defaultSections
        } else {
          // Fallback to local storage if no data in supabase
          loadFromLocal()
        }
      } else {
         loadFromLocal()
      }
    } catch (err) {
      console.warn('Error fetching about content from Supabase, falling back to local.', err)
      error.value = err.message
      loadFromLocal()
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
      if (supabase) {
        const { data, error: sbError } = await supabase
          .from('about_content')
          .upsert({ id: 1, hero: newData.hero, sections: newData.sections })
          .select()

        if (sbError) throw sbError
        hero.value = newData.hero
        sections.value = newData.sections
        return { ok: true }
      } else {
        throw new Error('Supabase no configurado')
      }
    } catch (err) {
      console.warn('Fallo al guardar en Supabase, guardando localmente', err)
      try {
        localStorage.setItem('about_content', JSON.stringify(newData))
        hero.value = newData.hero
        sections.value = newData.sections
        return { ok: true, fallback: true }
      } catch (localErr) {
        console.error('Fallo al guardar en localStorage', localErr)
        return { ok: false, error: 'No se pudo guardar la información' }
      }
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

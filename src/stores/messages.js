import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([])
  const isLoading = ref(false)

  const unreadCount = computed(() => messages.value.filter((m) => !m.is_read).length)

  // Try to load from localStorage first
  const localData = localStorage.getItem('fan_del_papel_messages')
  if (localData) {
    try {
      messages.value = JSON.parse(localData)
    } catch (e) {
      console.error('Failed to parse local messages', e)
    }
  }

  function saveToLocal() {
    localStorage.setItem('fan_del_papel_messages', JSON.stringify(messages.value))
  }

  async function fetchMessages() {
    isLoading.value = true
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }
        if (data) {
          messages.value = data
          saveToLocal()
        }
      }
    } catch (error) {
      console.warn('Supabase fetch failed, falling back to local storage:', error.message)
      // Local storage is already loaded
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(payload) {
    const newMessage = {
      ...payload,
      id: crypto.randomUUID(),
      is_read: false,
      created_at: new Date().toISOString()
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('contact_messages')
          .insert([{
            name: payload.name,
            phone: payload.phone,
            message: payload.message,
            is_read: false
          }])
          .select()
          .single()

        if (error) throw error
        if (data) {
          messages.value.unshift(data)
          saveToLocal()
          return { ok: true }
        }
      }
    } catch (error) {
      console.warn('Supabase insert failed, using fallback:', error.message)
      messages.value.unshift(newMessage)
      saveToLocal()
    }
    return { ok: true }
  }

  async function markAsRead(id) {
    const msg = messages.value.find((m) => m.id === id)
    if (!msg) return

    msg.is_read = true
    saveToLocal()

    try {
      if (supabase) {
        await supabase
          .from('contact_messages')
          .update({ is_read: true })
          .eq('id', id)
      }
    } catch (error) {
      console.warn('Supabase update failed:', error.message)
    }
  }

  async function deleteMessage(id) {
    messages.value = messages.value.filter((m) => m.id !== id)
    saveToLocal()

    try {
      if (supabase) {
        await supabase
          .from('contact_messages')
          .delete()
          .eq('id', id)
      }
    } catch (error) {
      console.warn('Supabase delete failed:', error.message)
    }
  }

  return {
    messages,
    isLoading,
    unreadCount,
    fetchMessages,
    sendMessage,
    markAsRead,
    deleteMessage
  }
})

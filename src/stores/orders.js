import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase, supabaseConfigError } from '@/lib/supabase'

const normalizeText = (value = '') => String(value ?? '').trim()

const normalizeOrderItem = (item = {}) => ({
  id: item.id,
  nombre: normalizeText(item.nombre),
  categoria: normalizeText(item.categoria),
  subcategoria: normalizeText(item.subcategoria),
  precio: Number(item.precio) || 0,
  quantity: Number(item.quantity) || 1,
})

const normalizeOrder = (row = {}) => ({
  id: Number(row.id),
  nombreApellido: normalizeText(row.nombre_apellido),
  telefono: normalizeText(row.telefono),
  formaPago: normalizeText(row.forma_pago),
  items: Array.isArray(row.items) ? row.items.map(normalizeOrderItem) : [],
  total: Number(row.total) || 0,
  pagado: Boolean(row.pagado),
  notas: normalizeText(row.notas),
  createdAt: row.created_at || null,
  updatedAt: row.updated_at || null,
})

const buildOrderRow = (payload = {}) => ({
  nombre_apellido: normalizeText(payload.nombreApellido),
  telefono: normalizeText(payload.telefono),
  forma_pago: normalizeText(payload.formaPago),
  items: Array.isArray(payload.items) ? payload.items.map(normalizeOrderItem) : [],
  total: Number(payload.total) || 0,
  pagado: Boolean(payload.pagado),
  notas: normalizeText(payload.notas),
  updated_at: new Date().toISOString(),
})

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const isLoaded = ref(false)

  let loadPromise = null

  const buildSupabaseError = (fallbackMessage) =>
    supabaseConfigError || new Error(fallbackMessage)

  const sortedOrders = computed(() =>
    [...orders.value].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
  )

  async function loadOrders() {
    if (loadPromise) return loadPromise

    loadPromise = (async () => {
      if (!supabase) {
        isLoaded.value = true
        return { ok: false, error: buildSupabaseError('Supabase no esta configurado') }
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        isLoaded.value = true
        return { ok: false, error }
      }

      orders.value = Array.isArray(data) ? data.map((row) => normalizeOrder(row)) : []
      isLoaded.value = true
      return { ok: true, count: orders.value.length }
    })().finally(() => {
      loadPromise = null
    })

    return loadPromise
  }

  async function addOrder(payload = {}) {
    if (!supabase) {
      return { order: null, ok: false, error: buildSupabaseError('Supabase no esta configurado') }
    }

    const row = buildOrderRow(payload)
    const { data, error } = await supabase.from('orders').insert([row]).select('*').single()

    if (error) {
      return { order: null, ok: false, error }
    }

    const newOrder = normalizeOrder(data)
    orders.value.unshift(newOrder)
    return { order: newOrder, ok: true }
  }

  async function updateOrder(id, updates = {}) {
    const numericId = Number(id)
    const index = orders.value.findIndex((order) => order.id === numericId)
    if (index === -1) return { order: null, ok: false, error: new Error('Pedido no encontrado') }

    if (!supabase) {
      return {
        order: orders.value[index],
        ok: false,
        error: buildSupabaseError('Supabase no esta configurado'),
      }
    }

    const current = orders.value[index]
    const row = buildOrderRow({ ...current, ...updates })
    const { data, error } = await supabase
      .from('orders')
      .update(row)
      .eq('id', numericId)
      .select('*')
      .single()

    if (error) {
      return { order: current, ok: false, error }
    }

    const nextOrder = normalizeOrder(data)
    orders.value.splice(index, 1, nextOrder)
    return { order: nextOrder, ok: true }
  }

  async function removeOrder(id) {
    const numericId = Number(id)
    const index = orders.value.findIndex((order) => order.id === numericId)
    if (index === -1) return { ok: false, error: new Error('Pedido no encontrado') }

    if (!supabase) {
      return { ok: false, error: buildSupabaseError('Supabase no esta configurado') }
    }

    const current = orders.value[index]
    const { error } = await supabase.from('orders').delete().eq('id', numericId)

    if (error) {
      return { ok: false, error }
    }

    orders.value = orders.value.filter((order) => order.id !== numericId)
    return { ok: true, order: current }
  }

  async function togglePagado(id, pagado) {
    return updateOrder(id, { pagado })
  }

  return {
    orders,
    sortedOrders,
    isLoaded,
    loadOrders,
    addOrder,
    updateOrder,
    removeOrder,
    togglePagado,
  }
})

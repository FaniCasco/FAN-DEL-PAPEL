<script setup>
import { computed, ref, watch } from 'vue'
import { useOrdersStore } from '@/stores/orders'

const props = defineProps({
  active: {
    type: Boolean,
    default: true,
  },
})

const ordersStore = useOrdersStore()

const selectedOrder = ref(null)
const editingOrder = ref(null)
const editForm = ref({
  nombreApellido: '',
  telefono: '',
  formaPago: 'efectivo',
  notas: '',
  pagado: false,
})
const error = ref('')

const orders = computed(() => ordersStore.sortedOrders)

watch(
  () => props.active,
  (isActive) => {
    if (isActive) ordersStore.loadOrders()
  },
  { immediate: true }
)

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function paymentLabel(value) {
  return value === 'transferencia' ? 'Transferencia' : 'Efectivo'
}

function viewOrder(order) {
  selectedOrder.value = order
  editingOrder.value = null
}

function startEdit(order) {
  editingOrder.value = order
  selectedOrder.value = null
  editForm.value = {
    nombreApellido: order.nombreApellido,
    telefono: order.telefono,
    formaPago: order.formaPago,
    notas: order.notas,
    pagado: order.pagado,
  }
}

function closePanels() {
  selectedOrder.value = null
  editingOrder.value = null
}

async function saveEdit() {
  if (!editingOrder.value) return
  error.value = ''

  const result = await ordersStore.updateOrder(editingOrder.value.id, {
    nombreApellido: editForm.value.nombreApellido,
    telefono: editForm.value.telefono,
    formaPago: editForm.value.formaPago,
    notas: editForm.value.notas,
    pagado: editForm.value.pagado,
  })

  if (!result.ok) {
    error.value = result.error?.message || 'No se pudo actualizar el pedido.'
    return
  }

  closePanels()
}

async function deleteOrder(order) {
  if (!confirm(`¿Eliminar el pedido de ${order.nombreApellido}?`)) return
  const result = await ordersStore.removeOrder(order.id)
  if (!result.ok) {
    error.value = result.error?.message || 'No se pudo eliminar el pedido.'
    return
  }
  closePanels()
}

async function handleTogglePagado(order, event) {
  const pagado = event.target.checked
  const result = await ordersStore.togglePagado(order.id, pagado)
  if (!result.ok) {
    error.value = result.error?.message || 'No se pudo actualizar el estado de pago.'
    event.target.checked = !pagado
  }
}
</script>

<template>
  <section class="orders-panel">
    <div class="orders-header">
      <h2>Pedidos</h2>
      <button type="button" class="ghost" @click="ordersStore.loadOrders()">Actualizar</button>
    </div>

    <div v-if="!orders.length" class="empty-state">
      <p>Todavía no hay pedidos registrados.</p>
    </div>

    <div v-else class="orders-table-wrap">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Pago</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ order.nombreApellido }}</td>
            <td>{{ order.telefono }}</td>
            <td>{{ paymentLabel(order.formaPago) }}</td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>
              <label class="payment-switch" :class="{ paid: order.pagado }" :title="order.pagado ? 'Pagado' : 'Adeuda'">
                <input
                  type="checkbox"
                  :checked="order.pagado"
                  @change="handleTogglePagado(order, $event)"
                />
                <span class="switch-label">{{ order.pagado ? 'Pagado' : 'Adeuda' }}</span>
              </label>
            </td>
            <td class="actions-cell">
              <button type="button" class="ghost small" @click="viewOrder(order)">Ver</button>
              <button type="button" class="ghost small" @click="startEdit(order)">Editar</button>
              <button type="button" class="danger small" @click="deleteOrder(order)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedOrder" class="order-detail">
      <div class="detail-header">
        <h3>Pedido #{{ selectedOrder.id }}</h3>
        <button type="button" class="ghost small" @click="closePanels">Cerrar</button>
      </div>
      <p><strong>Cliente:</strong> {{ selectedOrder.nombreApellido }}</p>
      <p><strong>Teléfono:</strong> {{ selectedOrder.telefono }}</p>
      <p><strong>Forma de pago:</strong> {{ paymentLabel(selectedOrder.formaPago) }}</p>
      <p><strong>Estado:</strong> {{ selectedOrder.pagado ? 'Pagado' : 'Adeuda' }}</p>
      <p v-if="selectedOrder.notas"><strong>Notas:</strong> {{ selectedOrder.notas }}</p>
      <ul class="items-list">
        <li v-for="item in selectedOrder.items" :key="`${item.id}-${item.nombre}`">
          {{ item.nombre }} x{{ item.quantity }} — {{ formatPrice(item.precio * item.quantity) }}
        </li>
      </ul>
      <p class="detail-total"><strong>Total:</strong> {{ formatPrice(selectedOrder.total) }}</p>
    </div>

    <div v-if="editingOrder" class="order-edit">
      <div class="detail-header">
        <h3>Editar pedido #{{ editingOrder.id }}</h3>
        <button type="button" class="ghost small" @click="closePanels">Cancelar</button>
      </div>
      <div class="edit-grid">
        <label>
          Nombre y apellido
          <input v-model="editForm.nombreApellido" type="text" />
        </label>
        <label>
          Teléfono
          <input v-model="editForm.telefono" type="tel" />
        </label>
        <label>
          Forma de pago
          <select v-model="editForm.formaPago">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </label>
        <label class="checkbox">
          <input v-model="editForm.pagado" type="checkbox" />
          Pagado
        </label>
        <label class="full-width">
          Notas
          <textarea v-model="editForm.notas" rows="3" />
        </label>
      </div>
      <button type="button" class="primary" @click="saveEdit">Guardar cambios</button>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>
  </section>
</template>

<style scoped>
.orders-panel {
  display: grid;
  gap: 1.25rem;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.orders-header h2 {
  margin: 0;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.orders-table-wrap {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.orders-table th,
.orders-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 0.92rem;
}

.orders-table th {
  background: var(--color-bg-secondary);
  font-weight: 700;
}

.payment-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-full);
  background: rgba(179, 58, 58, 0.1);
  border: 1px solid rgba(179, 58, 58, 0.2);
}

.payment-switch.paid {
  background: rgba(46, 125, 50, 0.1);
  border-color: rgba(46, 125, 50, 0.25);
}

.payment-switch.paid .switch-label {
  color: #2e7d32;
}

.switch-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #b33a3a;
}

.actions-cell {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.order-detail,
.order-edit {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: grid;
  gap: 0.75rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.detail-header h3 {
  margin: 0;
}

.items-list {
  margin: 0;
  padding-left: 1.25rem;
}

.detail-total {
  margin: 0;
  font-size: 1.1rem;
}

.edit-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
}

.edit-grid label {
  display: grid;
  gap: 0.4rem;
  font-weight: 600;
}

.edit-grid input,
.edit-grid select,
.edit-grid textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-sizing: border-box;
}

.full-width {
  grid-column: 1 / -1;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

button {
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
}

.primary { background: var(--color-primary); color: white; }
.ghost { background: white; color: var(--color-text); border: 1px solid var(--color-border); }
.danger { background: #b33a3a; color: white; }
.small { padding: 0.4rem 0.65rem; font-size: 0.85rem; }

.form-error {
  margin: 0;
  color: #b33a3a;
}

@media (max-width: 900px) {
  .edit-grid {
    grid-template-columns: 1fr;
  }

  .orders-table th:nth-child(3),
  .orders-table td:nth-child(3) {
    display: none;
  }
}
</style>

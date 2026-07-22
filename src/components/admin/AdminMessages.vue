<script setup>
import { onMounted } from 'vue'
import { useMessagesStore } from '@/stores/messages'

const messagesStore = useMessagesStore()

onMounted(() => {
  messagesStore.fetchMessages()
})

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleMarkRead(id) {
  messagesStore.markAsRead(id)
}

function handleDelete(id) {
  if (confirm('¿Querés eliminar este mensaje?')) {
    messagesStore.deleteMessage(id)
  }
}

function handleWhatsAppReply(msg) {
  if (!msg.phone) return
  const cleanPhone = msg.phone.replace(/\D/g, '')
  const summary = msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message
  const text = encodeURIComponent(`Hola ${msg.name}, ¡gracias por escribirnos en Fan del Papel! Con respecto a tu consulta: "${summary}"`)
  const url = `https://wa.me/${cleanPhone}?text=${text}`
  window.open(url, '_blank')
  
  if (!msg.is_read) {
    handleMarkRead(msg.id)
  }
}
</script>

<template>
  <div class="admin-messages">
    <h2>Mensajes y Consultas</h2>
    
    <div v-if="messagesStore.isLoading" class="loading">Cargando mensajes...</div>
    <div v-else-if="messagesStore.messages.length === 0" class="empty">No hay mensajes.</div>
    
    <div v-else class="messages-list">
      <div 
        v-for="msg in messagesStore.messages" 
        :key="msg.id" 
        class="message-card"
        :class="{ unread: !msg.is_read }"
      >
        <div class="message-header">
          <div class="message-meta">
            <strong>{{ msg.name }}</strong>
            <span class="phone-text">WhatsApp: {{ msg.phone }}</span>
            <span class="date">{{ formatDate(msg.created_at) }}</span>
          </div>
          <span v-if="!msg.is_read" class="badge">Nuevo</span>
        </div>
        
        <p class="message-content">{{ msg.message }}</p>
        
        <div class="message-actions">
          <button 
            type="button" 
            class="whatsapp-btn small" 
            @click="handleWhatsAppReply(msg)"
          >
            Responder por WhatsApp
          </button>
          <button 
            v-if="!msg.is_read"
            type="button" 
            class="primary small" 
            @click="handleMarkRead(msg.id)"
          >
            Marcar como leído
          </button>
          <button 
            type="button" 
            class="danger small" 
            @click="handleDelete(msg.id)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-messages {
  max-width: 800px;
}
.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.message-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}
.message-card.unread {
  border-color: var(--color-primary);
  background: white;
}
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.message-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.message-meta strong {
  font-size: 1.1rem;
}
.phone-text {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.whatsapp-btn {
  background: #25D366;
  color: white;
  border: none;
  font-weight: bold;
}
.whatsapp-btn:hover {
  background: #128C7E;
}
.date {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.badge {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: bold;
}
.message-content {
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
.message-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>

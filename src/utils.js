import { reactive } from 'vue'

// ── Notificaciones toast ──────────────────────────────────────
export const toasts = reactive([])

export function toast(mensaje, tipo = 'ok') {
  const id = Date.now()
  toasts.push({ id, mensaje, tipo })
  setTimeout(() => {
    const i = toasts.findIndex(t => t.id === id)
    if (i !== -1) toasts.splice(i, 1)
  }, 3500)
}

// ── Estados de la cita ────────────────────────────────────────
export const ESTADOS = [
  { valor: 0, texto: 'Pendiente',  clase: 'badge-pendiente'  },
  { valor: 1, texto: 'Confirmada', clase: 'badge-confirmada' },
  { valor: 2, texto: 'Cancelada',  clase: 'badge-cancelada'  },
  { valor: 3, texto: 'Completada', clase: 'badge-completada' },
  { valor: 4, texto: 'No Asistió', clase: 'badge-noasistio'  },
]

export function getEstado(valor) {
  return ESTADOS.find(e => e.valor === Number(valor)) || ESTADOS[0]
}

// ── Formato de fechas ─────────────────────────────────────────
export function formatFechaHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// Extrae "2026-06-07" de un ISO string
export function soloFecha(iso) {
  return iso ? iso.substring(0, 10) : ''
}

// Extrae "09:00" de un ISO string
export function soloHora(iso) {
  if (!iso) return ''
  return new Date(iso).toTimeString().substring(0, 5)
}

// Une "2026-06-07" + "09:00" → "2026-06-07T09:00:00"
export function combinaFechaHora(fecha, hora) {
  return `${fecha}T${hora}:00`
}

// ── Validaciones ──────────────────────────────────────────────

// La fecha no puede ser en el pasado (para citas)
export function fechaNoPassada(f) {
  if (!f) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return new Date(f) >= hoy
}

// La fecha no puede ser futura (para evoluciones)
export function fechaNoFutura(f) {
  if (!f) return false
  return new Date(f) <= new Date()
}

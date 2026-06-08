<template>
  <div class="pagina">

    <!-- Spinner -->
    <div v-if="cargando" class="spinner-fondo">
      <div class="spinner"></div>
    </div>

    <!-- Encabezado -->
    <div class="encabezado">
      <div>
        <h1>Historial Clínico</h1>
        <p class="muted">Evoluciones por paciente</p>
      </div>
      <button v-if="historiaId" class="btn btn-primario" @click="abrirModal">
        + Agregar Evolución
      </button>
    </div>

    <!-- Selector de paciente -->
    <div class="selector-paciente">
      <div class="campo">
        <label>Selecciona un Paciente</label>
        <select class="input" @change="seleccionar">
          <option value="">-- Elige un paciente --</option>
          <option v-for="h in historias" :key="h.id" :value="h.id">
            {{ h.nombrePaciente || 'Paciente #' + h.idPaciente }}
          </option>
        </select>
      </div>
    </div>

    <!-- Evoluciones -->
    <div v-if="historiaId">
      <div v-if="evoluciones.length">
        <div v-for="e in evoluciones" :key="e.id" class="evolucion">
          <div class="evolucion-fecha">{{ formatFecha(e.fecha) }}</div>
          <div class="evolucion-grid">
            <div class="evolucion-campo">
              <label>Diagnóstico</label>
              <p>{{ e.diagnostico }}</p>
            </div>
            <div class="evolucion-campo">
              <label>Tratamiento</label>
              <p>{{ e.tratamiento }}</p>
            </div>
            <div v-if="e.notas" class="evolucion-campo" style="grid-column: 1 / -1">
              <label>Notas adicionales</label>
              <p>{{ e.notas }}</p>
            </div>
          </div>
          <div class="evolucion-doctor">
            {{ e.nombreDoctor }}{{ e.nombreEspecialidad ? ' · ' + e.nombreEspecialidad : '' }}
          </div>
        </div>
      </div>
      <div v-else class="tabla-wrap">
        <div class="vacio">
          <h3>Sin evoluciones</h3>
          <p>Este paciente no tiene evoluciones registradas.</p>
        </div>
      </div>
    </div>

    <!-- Modal nueva evolución -->
    <div v-if="modal.abierto" class="modal-fondo" @click.self="cerrarModal">
      <div class="modal-caja">
        <div class="modal-cabecera">
          <h2>Nueva Evolución</h2>
          <button class="btn-cerrar" @click="cerrarModal">×</button>
        </div>
        <div class="modal-cuerpo">
          <div v-if="modal.error" class="error-general">{{ modal.error }}</div>

          <div class="campo">
            <label>Doctor *</label>
            <select class="input" v-model="modal.idDoctor">
              <option value="">-- Selecciona --</option>
              <option v-for="d in doctores" :key="d.id" :value="d.id">
                {{ d.nombre || d.nombreCompleto }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Fecha *</label>
            <input type="date" class="input" v-model="modal.fecha" />
            <div v-if="modal.errFecha" class="error-campo">{{ modal.errFecha }}</div>
          </div>

          <div class="campo">
            <label>Diagnóstico *</label>
            <textarea class="input" v-model="modal.diagnostico" rows="3"
              placeholder="Describe el diagnóstico..."></textarea>
            <div v-if="modal.errDiag" class="error-campo">{{ modal.errDiag }}</div>
          </div>

          <div class="campo">
            <label>Tratamiento *</label>
            <textarea class="input" v-model="modal.tratamiento" rows="3"
              placeholder="Describe el tratamiento..."></textarea>
            <div v-if="modal.errTrat" class="error-campo">{{ modal.errTrat }}</div>
          </div>

          <div class="campo">
            <label>Notas adicionales (opcional)</label>
            <textarea class="input" v-model="modal.notas" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-pie">
          <button class="btn btn-secundario" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primario"   @click="guardarEvolucion">Guardar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getHistorias, getEvoluciones, getDoctores, postEvolucion } from '../api.js'
import { toast, formatFecha, fechaNoFutura } from '../utils.js'

// ── Datos ────────────────────────────────────────────────────
const historias    = ref([])
const doctores     = ref([])
const evoluciones  = ref([])
const historiaId   = ref(null)
const cargando     = ref(false)

// ── Modal ────────────────────────────────────────────────────
const modal = reactive({
  abierto: false, error: '',
  errFecha: '', errDiag: '', errTrat: '',
  idDoctor: '', fecha: new Date().toISOString().substring(0, 10),
  diagnostico: '', tratamiento: '', notas: ''
})

function abrirModal() {
  Object.assign(modal, {
    abierto: true, error: '',
    errFecha: '', errDiag: '', errTrat: '',
    idDoctor: '', fecha: new Date().toISOString().substring(0, 10),
    diagnostico: '', tratamiento: '', notas: ''
  })
}

function cerrarModal() { modal.abierto = false }

// ── Carga inicial ─────────────────────────────────────────────
onMounted(async () => {
  cargando.value = true
  try {
    const [rHist, rDoc] = await Promise.all([getHistorias(), getDoctores()])
    historias.value = rHist.data.datos || []
    doctores.value  = rDoc.data.datos  || []
  } catch {
    toast('Error al cargar los datos.', 'error')
  } finally {
    cargando.value = false
  }
})

// ── Seleccionar paciente ──────────────────────────────────────
async function seleccionar(e) {
  const id = Number(e.target.value)
  historiaId.value  = id || null
  evoluciones.value = []
  if (!id) return

  cargando.value = true
  try {
    const res = await getEvoluciones(id)
    // H3: ordenar por fecha descendente
    evoluciones.value = (res.data.datos || []).sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )
  } catch {
    toast('Error al cargar el historial.', 'error')
  } finally {
    cargando.value = false
  }
}

// ── Guardar evolución ─────────────────────────────────────────
async function guardarEvolucion() {
  modal.error = ''; modal.errFecha = ''; modal.errDiag = ''; modal.errTrat = ''
  let hayError = false

  if (!modal.idDoctor) {
    modal.error = 'Selecciona un doctor.'
    return
  }
  // H6: fecha no futura
  if (!modal.fecha || !fechaNoFutura(modal.fecha)) {
    modal.errFecha = 'La fecha no puede ser futura.'
    hayError = true
  }
  if (!modal.diagnostico.trim()) {
    modal.errDiag = 'El diagnóstico es requerido.'
    hayError = true
  }
  if (!modal.tratamiento.trim()) {
    modal.errTrat = 'El tratamiento es requerido.'
    hayError = true
  }
  if (hayError) return

  const datos = {
    idHistoriaClinica: historiaId.value,
    idDoctor:          Number(modal.idDoctor),
    fecha:             modal.fecha,
    diagnostico:       modal.diagnostico.trim(),
    tratamiento:       modal.tratamiento.trim(),
    notas:             modal.notas.trim() || null,
    activo:            true,
  }

  cargando.value = true
  try {
    const res = await postEvolucion(datos)
    if (res.data.exitoso) {
      toast('Evolución registrada', 'ok')
      cerrarModal()
      const r = await getEvoluciones(historiaId.value)
      evoluciones.value = (r.data.datos || []).sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      )
    } else {
      modal.error = res.data.mensaje || 'No se pudo guardar.'
    }
  } catch (e) {
    modal.error = e.response?.data?.mensaje || 'Error al guardar.'
  } finally {
    cargando.value = false
  }
}
</script>

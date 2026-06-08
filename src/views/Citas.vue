<template>
  <div class="pagina">

    
    <div v-if="cargando" class="spinner-fondo">
      <div class="spinner"></div>
    </div>

    
    <div class="encabezado">
      <div>
        <h1>Citas Médicas</h1>
        <p class="muted">Gestión completa de citas</p>
      </div>
      <button class="btn btn-primario" @click="abrirCrear">+ Nueva Cita</button>
    </div>

    
    <div class="filtros">
      <div class="filtro-item">
        <label>Fecha</label>
        <input type="date" class="input" v-model="filtros.fecha" />
      </div>
      <div class="filtro-item">
        <label>Estado</label>
        <select class="input" v-model="filtros.estado">
          <option value="">Todos</option>
          <option v-for="e in ESTADOS" :key="e.valor" :value="e.valor">{{ e.texto }}</option>
        </select>
      </div>
      <div class="filtro-item">
        <label>Paciente</label>
        <select class="input" v-model="filtros.paciente">
          <option value="">Todos</option>
          <option v-for="p in pacientes" :key="p.id" :value="p.id">
            {{ p.nombres }} {{ p.apellidos }}
          </option>
        </select>
      </div>
      <button class="btn btn-secundario btn-chico" style="align-self:flex-end" @click="limpiarFiltros">
        Limpiar
      </button>
    </div>

    
    <div class="tabla-wrap">
      <table v-if="citasFiltradas.length">
        <thead>
          <tr>
            <th>#</th>
            <th>Paciente</th>
            <th>Doctor</th>
            <th>Fecha y Hora</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in citasFiltradas" :key="c.id">
            <td class="muted">#{{ c.id }}</td>
            <td class="negrita">{{ c.nombrePaciente }}</td>
            <td>{{ c.nombreDoctor }}</td>
            <td>{{ formatFechaHora(c.fechaHora) }}</td>
            <td>{{ c.motivo?.length > 35 ? c.motivo.substring(0, 35) + '…' : c.motivo }}</td>
            <td>
              <span :class="'badge ' + getEstado(c.estado).clase">
                {{ getEstado(c.estado).texto }}
              </span>
            </td>
            <td>
              <div class="acciones">
                <button class="btn btn-secundario btn-chico" @click="abrirEditar(c)">Editar</button>
                <button v-if="c.estado !== 2" class="btn btn-peligro btn-chico" @click="pedirConfirmar(c.id)">
                  Cancelar
                </button>
                <span v-else class="muted" style="font-size:0.8rem">Cancelada</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="vacio">
        <h3>Sin citas</h3>
        <p>No hay citas con los filtros actuales.</p>
      </div>
    </div>

    
    <div v-if="modal.abierto" class="modal-fondo" @click.self="cerrarModal">
      <div class="modal-caja">
        <div class="modal-cabecera">
          <h2>{{ modal.modo === 'crear' ? 'Nueva Cita' : 'Editar Cita' }}</h2>
          <button class="btn-cerrar" @click="cerrarModal">×</button>
        </div>
        <div class="modal-cuerpo">
          <div v-if="modal.error" class="error-general">{{ modal.error }}</div>

          <div class="campo">
            <label>Paciente *</label>
            <select class="input" v-model="modal.idPaciente">
              <option value="">-- Selecciona --</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">
                {{ p.nombres }} {{ p.apellidos }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label>Doctor *</label>
            <select class="input" v-model="modal.idDoctor">
              <option value="">-- Selecciona --</option>
              <option v-for="d in doctores" :key="d.id" :value="d.id">
                {{ d.nombre || d.nombreCompleto }}
              </option>
            </select>
          </div>

          <div class="campo-fila">
            <div class="campo">
              <label>Fecha *</label>
              <input type="date" class="input" v-model="modal.fecha" />
              <div v-if="modal.errFecha" class="error-campo">{{ modal.errFecha }}</div>
            </div>
            <div class="campo">
              <label>Hora *</label>
              <input type="time" class="input" v-model="modal.hora" />
            </div>
          </div>

          <div class="campo">
            <label>Motivo * (mín. 5 caracteres)</label>
            <textarea class="input" v-model="modal.motivo" rows="3"></textarea>
            <div v-if="modal.errMotivo" class="error-campo">{{ modal.errMotivo }}</div>
          </div>

          <div class="campo">
            <label>Estado</label>
            <select class="input" v-model="modal.estado">
              <option v-for="e in ESTADOS" :key="e.valor" :value="e.valor">{{ e.texto }}</option>
            </select>
          </div>

          <div class="campo">
            <label>Notas (opcional)</label>
            <textarea class="input" v-model="modal.notas" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-pie">
          <button class="btn btn-secundario" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primario" @click="guardarCita">Guardar</button>
        </div>
      </div>
    </div>

    
    <div v-if="confirm.abierto" class="confirm-fondo" @click.self="cerrarConfirm">
      <div class="confirm-caja">
        <h3>Cancelar esta cita</h3>
        <p>La cita pasará a estado "Cancelada". Esta acción no se puede deshacer.</p>
        <div class="confirm-acciones">
          <button class="btn btn-secundario" @click="cerrarConfirm">No</button>
          <button class="btn btn-peligro"    @click="cancelarCita">Sí, cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getCitas, postCita, putCita, deleteCita, getPacientes, getDoctores } from '../api.js'
import { toast, ESTADOS, getEstado, formatFechaHora, soloFecha, soloHora, combinaFechaHora, fechaNoPassada } from '../utils.js'

const citas     = ref([])
const pacientes = ref([])
const doctores  = ref([])
const cargando  = ref(false)

const filtros = reactive({ fecha: '', estado: '', paciente: '' })

const citasFiltradas = computed(() => {
  return citas.value.filter(c => {
    if (filtros.fecha    && soloFecha(c.fechaHora)    !== filtros.fecha)              return false
    if (filtros.estado   !== '' && String(c.estado)   !== String(filtros.estado))    return false
    if (filtros.paciente && String(c.idPaciente)       !== String(filtros.paciente)) return false
    return true
  })
})

function limpiarFiltros() {
  filtros.fecha = ''; filtros.estado = ''; filtros.paciente = ''
}

const modal = reactive({
  abierto: false, modo: 'crear', id: null,
  error: '', errFecha: '', errMotivo: '',
  idPaciente: '', idDoctor: '', fecha: '', hora: '09:00',
  motivo: '', estado: 0, notas: ''
})

function abrirCrear() {
  Object.assign(modal, {
    abierto: true, modo: 'crear', id: null,
    error: '', errFecha: '', errMotivo: '',
    idPaciente: '', idDoctor: '', fecha: '', hora: '09:00',
    motivo: '', estado: 0, notas: ''
  })
}

function abrirEditar(c) {
  Object.assign(modal, {
    abierto: true, modo: 'editar', id: c.id,
    error: '', errFecha: '', errMotivo: '',
    idPaciente: c.idPaciente, idDoctor: c.idDoctor,
    fecha: soloFecha(c.fechaHora), hora: soloHora(c.fechaHora),
    motivo: c.motivo, estado: c.estado, notas: c.notas || ''
  })
}

function cerrarModal() { modal.abierto = false }

const confirm = reactive({ abierto: false, id: null })

function pedirConfirmar(id) { confirm.id = id; confirm.abierto = true }
function cerrarConfirm()    { confirm.abierto = false; confirm.id = null }

onMounted(async () => {
  cargando.value = true
  try {
    const [rCitas, rPac, rDoc] = await Promise.all([getCitas(), getPacientes(), getDoctores()])
    citas.value     = rCitas.data.datos || []
    pacientes.value = rPac.data.datos   || []
    doctores.value  = rDoc.data.datos   || []
  } catch {
    toast('Error al cargar los datos', 'error')
  } finally {
    cargando.value = false
  }
})

async function guardarCita() {
  modal.error = ''; modal.errFecha = ''; modal.errMotivo = ''
  let hayError = false

  if (!modal.idPaciente || !modal.idDoctor) {
    modal.error = 'Selecciona un paciente y un doctor.'
    return
  }
  if (!modal.fecha || !modal.hora) {
    modal.errFecha = 'La fecha y hora son requeridas.'
    hayError = true
  } else if (modal.modo === 'crear' && !fechaNoPassada(modal.fecha)) {
    modal.errFecha = 'La fecha no puede ser en el pasado.'
    hayError = true
  }
  if (!modal.motivo || modal.motivo.trim().length < 5) {
    modal.errMotivo = 'El motivo debe tener al menos 5 caracteres.'
    hayError = true
  }
  if (hayError) return

  
  const duplicado = citas.value.find(c =>
    String(c.idPaciente) === String(modal.idPaciente) &&
    soloFecha(c.fechaHora) === modal.fecha &&
    soloHora(c.fechaHora)  === modal.hora &&
    c.estado !== 2 &&
    (modal.modo === 'crear' || c.id !== modal.id)
  )
  if (duplicado) {
    modal.error = `El paciente ya tiene una cita el ${formatFechaHora(duplicado.fechaHora)}.`
    return
  }

  const datos = {
    idPaciente: Number(modal.idPaciente),
    idDoctor:   Number(modal.idDoctor),
    fechaHora:  combinaFechaHora(modal.fecha, modal.hora),
    motivo:     modal.motivo.trim(),
    notas:      modal.notas.trim() || null,
    estado:     Number(modal.estado),
  }

  cargando.value = true
  try {
    let res
    if (modal.modo === 'crear') {
      res = await postCita(datos)
    } else {
      res = await putCita(modal.id, { id: modal.id, ...datos })
    }

    if (res.data.exitoso) {
      toast(modal.modo === 'crear' ? 'Cita creada' : 'Cita actualizada', 'ok')
      cerrarModal()
      citas.value = (await getCitas()).data.datos || []
    } else {
      modal.error = res.data.mensaje || 'No se pudo guardar.'
    }
  } catch (e) {
    modal.error = e.response?.data?.mensaje || 'Error al guardar.'
  } finally {
    cargando.value = false
  }
}

async function cancelarCita() {
  const id = confirm.id
  cerrarConfirm()
  cargando.value = true
  try {
    const res = await deleteCita(id)
    if (res.data.exitoso) {
      toast('Cita cancelada', 'ok')
      citas.value = (await getCitas()).data.datos || []
    } else {
      toast(res.data.mensaje || 'No se pudo cancelar.', 'error')
    }
  } catch {
    toast('Error al cancelar.', 'error')
  } finally {
    cargando.value = false
  }
}
</script>

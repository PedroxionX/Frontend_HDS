import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

export const getCitas       = ()         => http.get('/citas')
export const postCita       = (data)     => http.post('/citas', data)
export const putCita        = (id, data) => http.put(`/citas/${id}`, data)
export const deleteCita     = (id)       => http.delete(`/citas/${id}`)

export const getPacientes   = ()         => http.get('/pacientes')
export const getDoctores    = ()         => http.get('/doctores')

export const getHistorias   = ()         => http.get('/historias-clinicas/activas')
export const getEvoluciones = (id)       => http.get(`/evoluciones/por-historia/${id}`)
export const postEvolucion  = (data)     => http.post('/evoluciones', data)

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Citas from './views/Citas.vue'
import Historial from './views/Historial.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'activo',
  routes: [
    { path: '/',          component: Home      },
    { path: '/citas',     component: Citas     },
    { path: '/historial', component: Historial },
  ]
})

createApp(App).use(router).mount('#app')

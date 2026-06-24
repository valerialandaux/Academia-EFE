import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('[Academia EFE]', err, info)
}

app.use(router)
app.mount('#app')

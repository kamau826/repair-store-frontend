import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia'

import ElementPlus  from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlucsIconsVue from '@element-plus/icons-vue'

const app=createApp(App) 

//register all element plus icons globally
for (const[key,component] of Object.entries(ElementPlucsIconsVue)){
    app.component(key,component)
}
app.use(createPinia())
app.use(router) 
app.use(ElementPlus)

app.mount('#app')
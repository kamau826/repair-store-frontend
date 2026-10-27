<template>
  <el-container class="h-screen bg-gray-50">
    <!-- sidebar -->
    <el-aside width="250px" class="bg-gray-800 text-white flex flex-col">
      <div
        class="h-16 flex items-center justify-center border-b border-gray-700 text-xl font-bold"
      >
        Repair CRM
      </div>
      <el-menu
        active-text-color="#409eff"
        background-color="#1f2937"
        text-color="#fff"
        class="border-none flex-grow"
        router
        :default-active="$route.path"
      >
      <el-menu-item index="/">
      <el-icon><Menu /></el-icon>
      <span>Dashboard</span>
      </el-menu-item>

        <el-menu-item index="/tickets">
          <el-icon><Document /></el-icon>
          <span>Repair Tickets</span>
        </el-menu-item>

        <el-menu-item index="/Material-requests">
          <el-icon><Box /></el-icon>
          <span>Material Reqs</span>
        </el-menu-item>
         <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <span>Inventory</span>
        </el-menu-item>
       
       
        <el-menu-item index="/roles">
         <el-icon><Key /></el-icon>
          <span>Roles</span>
        </el-menu-item>
          <el-menu-item index="/facilities">
          <el-icon><House /></el-icon>
          <span>Facilities</span>
        </el-menu-item>
      
      </el-menu>
    </el-aside>

    <!-- main content area -->
     <el-container>
        <!-- Header -->
         <el-header class="bg-white shadow-sm flex items-center justify-between px-6 border-b border-gray-200">
         <div class="text-gray-700 font-semibold text-lg">
            {{ currentRouteName }}
         </div>
         <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600" >
                Welcome,{{ authStore.fullName }}
            </span>
         </div>
         <div>
            <el-button type="danger" plain size="small" @click="handleLogout">Logout</el-button>
         </div>
         </el-header>
         <!-- content -->
          <el-main class="p-6">
           <router-view />
          </el-main>
     </el-container>
  </el-container>
</template>

<script setup>
import { computed, onUnmounted } from 'vue';
import { useRoute,useRouter } from 'vue-router';
import {Menu,Document,Box} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth';

const route=useRoute()
const router=useRouter()
const authStore=useAuthStore()

const currentRouteName=computed(()=>route.name)

onUnmounted(async()=>{
    if(!authStore.staff){
        await authStore.fetchCurrentUser()
    }
})

const handleLogout=async()=>{
    await authStore.logout()
    router.push('/login')
}
</script>

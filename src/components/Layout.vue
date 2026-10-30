<template>
  <el-container class="h-screen bg-gray-50 overflow-hidden">
    
    <!-- DESKTOP SIDEBAR  -->
    <el-aside width="250px" class="hidden md:flex bg-gray-800 text-white flex-col transition-all duration-300">
      <div class="h-16 flex items-center justify-center border-b border-gray-700 text-xl font-bold">
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

    <!-- MOBILE SIDEBAR DRAWER (Visible only when hamburger is clicked) -->
    <el-drawer
      v-model="mobileMenuOpen"
      direction="ltr"
      size="250px"
      :with-header="false"
      class="bg-gray-800"
    >
      <div class="h-16 flex items-center justify-center border-b border-gray-700 text-xl font-bold text-white bg-gray-800">
        Repair CRM
      </div>
      <el-menu
        active-text-color="#409eff"
        background-color="#1f2937"
        text-color="#fff"
        class="border-none flex-grow"
        router
        :default-active="$route.path"
        @select="mobileMenuOpen = false" 
      >
        <el-menu-item index="/">
          <el-icon><Expand /></el-icon>
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
    </el-drawer>

    <!-- MAIN CONTENT AREA -->
    <el-container class="flex flex-col h-screen overflow-hidden">
      
      <!-- RESPONSIVE HEADER -->
      <el-header class="bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 border-b border-gray-200">
        <!-- Left Side: Hamburger & Title -->
        <div class="flex items-center gap-3">
          <el-icon 
            class="md:hidden text-gray-700 text-2xl cursor-pointer" 
            @click="mobileMenuOpen = true"
          >
            <Expand />
          </el-icon>
          <div class="text-gray-700 font-semibold text-base sm:text-lg truncate">
            {{ currentRouteName }}
          </div>
        </div>
        
        <!-- Right Side: Welcome & Logout -->
        <div class="flex items-center gap-3">
          <!-- Hidden on mobile phones (sm and below) -->
          <span class="text-sm text-gray-600 hidden sm:block truncate max-w-[200px]">
            Welcome, {{ authStore.fullName }}
          </span>
          <el-button type="danger" plain size="small" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>

      <!-- CONTENT VIEWPORT -->
      <el-main class="p-4 sm:p-6 overflow-x-hidden overflow-y-auto bg-gray-50">
        <router-view />
      </el-main>

    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import {useRoute,useRouter} from 'vue-router'
import { Menu, Document, Box, Key, House, Expand } from '@element-plus/icons-vue';
import { useAuthStore } from '../stores/auth';

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State to control the mobile drawer
const mobileMenuOpen = ref(false)

const currentRouteName = computed(() => route.name)

onUnmounted(async () => {
  if (!authStore.staff) {
    await authStore.fetchCurrentUser()
  }
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style>
/* Optional: Ensures the drawer menu inherits the dark background properly */
.el-drawer__body {
  padding: 0 !important;
  background-color: #1f2937;
}
</style>
<template>
  <div class="p-3 sm:p-6">
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Dashboard Overview</h1>
    
    <!-- Summary Cards (1 col mobile, 2 col tablet, 4 col desktop) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      <!-- Open Tickets -->
      <el-card shadow="hover" class="border-l-4 border-l-blue-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500 font-semibold uppercase">Open Tickets</p>
            <h2 class="text-3xl font-bold text-gray-800 mt-1">{{ stats.openTickets }}</h2>
          </div>
          <el-icon class="text-4xl text-blue-100"><Document /></el-icon>
        </div>
      </el-card>

      <!-- Completed Tickets -->
      <el-card shadow="hover" class="border-l-4 border-l-green-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500 font-semibold uppercase">Completed</p>
            <h2 class="text-3xl font-bold text-gray-800 mt-1">{{ stats.completedTickets }}</h2>
          </div>
          <el-icon class="text-4xl text-green-100"><Select /></el-icon>
        </div>
      </el-card>

      <!-- Pending Material Reqs -->
      <el-card shadow="hover" class="border-l-4 border-l-yellow-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500 font-semibold uppercase">Pending Reqs</p>
            <h2 class="text-3xl font-bold text-gray-800 mt-1">{{ stats.pendingRequests }}</h2>
          </div>
          <el-icon class="text-4xl text-yellow-100"><Box /></el-icon>
        </div>
      </el-card>

      <!-- Estimated Revenue -->
      <el-card shadow="hover" class="border-l-4 border-l-purple-500">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500 font-semibold uppercase">Revenue (KES)</p>
            <h2 class="text-3xl font-bold text-gray-800 mt-1">{{ Number(stats.totalRevenue).toLocaleString() }}</h2>
          </div>
          <el-icon class="text-4xl text-purple-100"><Money /></el-icon>
        </div>
      </el-card>
      
    </div>

    <!-- Recent Tickets Table -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-800">Recent Tickets</h3>
        <el-button link type="primary" @click="$router.push('/tickets')">View All</el-button>
      </div>
      
      <el-table :data="recentTickets" v-loading="loading" stripe style="width: 100%" size="small">
        <el-table-column prop="ticket_number" label="Ticket No." min-width="140" />
        <el-table-column prop="device_model" label="Device" min-width="150" show-overflow-tooltip />
        <el-table-column label="Status" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : scope.row.status === 'closed' ? 'info' : 'primary'">
              {{ scope.row.status || 'open' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="90" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="$router.push(`/tickets/${scope.row.ticket_id}`)">View</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { Document, Select, Box, Money } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(true)

const stats = ref({
  openTickets: 0,
  completedTickets: 0,
  pendingRequests: 0,
  totalRevenue: 0
})

const recentTickets = ref([])

const fetchDashboardData = async () => {
  loading.value = true
  try {
    // You can replace these with a single optimized backend endpoint later (e.g., /api/dashboard/stats)
    // For now, making parallel requests to your existing endpoints to calculate the stats
    const [ticketsRes, requestsRes] = await Promise.all([
      api.get('/api/tickets'),
      api.get('/api/inventory/requests/pending') // Adjust this URL to match your material requests route
    ])

    const allTickets = ticketsRes.data || []
    
    // Calculate stats
    stats.value.openTickets = allTickets.filter(t => t.status !== 'closed' && t.status !== 'completed').length
    stats.value.completedTickets = allTickets.filter(t => t.status === 'completed' || t.status === 'closed').length
    stats.value.pendingRequests = requestsRes.data ? requestsRes.data.length : 0
    
    // Sum up the estimated or total cost of closed/completed tickets
    stats.value.totalRevenue = allTickets
      .filter(t => t.status === 'closed')
      .reduce((sum, ticket) => sum + Number(ticket.estimated_cost || 0), 0)

    // Grab the 5 most recently created tickets
    recentTickets.value = allTickets.slice(0, 5)

  } catch (error) {
    console.error("Error loading dashboard data", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
<template>
  <!-- Reduced padding on mobile (p-3) vs desktop (sm:p-6) -->
  <div class="p-3 sm:p-6">
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Material Requests Queue</h1>
    
    <!-- Table Container -->
    <el-card shadow="never" class="border-none sm:border-solid">
      <!-- Added width and height properties so the table handles its own scrolling on mobile -->
      <el-table 
        :data="requests" 
        v-loading="loading" 
        stripe 
        border 
        empty-text="No pending requests."
        style="width: 100%"
        height="calc(100vh - 180px)"
      >
        <el-table-column prop="ticket_number" label="Ticket #" width="180" />
        <el-table-column prop="part_number" label="Part Number" width="150" />
        
        <!-- Added min-width so the name doesn't wrap aggressively on small screens -->
        <el-table-column prop="part_name" label="Part Name" min-width="200" />
        
        <el-table-column prop="quantity_requested" label="Qty" width="80" align="center" />
        
        <el-table-column label="Status" width="120" align="center">
          <template #default="scope">
            <el-tag type="warning">Pending</el-tag>
          </template>
        </el-table-column>
        
        <!-- Added fixed="right" to pin the action button -->
        <el-table-column label="Actions" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="operateRequest(scope.row.request_id)">
              Operate
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const requests = ref([])
const loading = ref(false)

const fetchRequests = async () => {
  loading.value = true
  try {
    // Adjust this route to match whatever you named getPendingRequests in your backend
    const response = await api.get('/api/inventory/requests/pending') 
    requests.value = response.data.requests || response.data
  } catch (error) {
    ElMessage.error("Failed to load material requests.")
  } finally {
    loading.value = false
  }
}

const operateRequest = (id) => {
  router.push(`/material-requests/${id}`)
}

onMounted(() => {
  fetchRequests()
})
</script>
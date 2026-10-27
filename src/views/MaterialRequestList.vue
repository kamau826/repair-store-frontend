<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Material Requests Queue</h1>
    
    <el-card shadow="never" class="border">
      <el-table :data="requests" v-loading="loading" stripe border empty-text="No pending requests.">
        <el-table-column prop="ticket_number" label="Ticket #" width="180" />
        <el-table-column prop="part_number" label="Part Number" width="150" />
        <el-table-column prop="part_name" label="Part Name" />
        <el-table-column prop="quantity_requested" label="Qty" width="80" align="center" />
        <el-table-column label="Status" width="120" align="center">
          <template #default="scope">
            <el-tag type="warning">Pending</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
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
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Process Material Request</h1>
      <el-button @click="$router.push('/material-requests')">Back to Queue</el-button>
    </div>

    <el-card shadow="never" class="border" v-loading="loading">
      <div v-if="request">
        <!-- Ticket Information -->
        <h3 class="text-lg font-bold mb-4 border-b pb-2">Ticket Details</h3>
        <el-descriptions border :column="2" class="mb-8">
          <el-descriptions-item label="Ticket #">{{ request.ticket_number }}</el-descriptions-item>
          <el-descriptions-item label="Device Model">{{ request.device_model }}</el-descriptions-item>
          <el-descriptions-item label="Fault" :span="2">{{ request.fault_description }}</el-descriptions-item>
        </el-descriptions>

        <!-- Material Information -->
        <h3 class="text-lg font-bold mb-4 border-b pb-2">Required Material</h3>
        <el-descriptions border :column="2" class="mb-8">
          <el-descriptions-item label="Part Name">{{ request.part_name }}</el-descriptions-item>
          <el-descriptions-item label="Part Number">{{ request.part_number }}</el-descriptions-item>
          <el-descriptions-item label="Qty Requested">
            <span class="font-bold text-blue-600">{{ request.quantity_requested }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Bin Location">
            <el-tag type="danger" effect="dark" size="large">{{ request.bin_code }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Current Stock">
            <span :class="request.available_stock >= request.quantity_requested ? 'text-green-600' : 'text-red-600'">
              {{ request.available_stock }} available
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="request.status === 'Issued' ? 'success' : 'warning'">{{ request.status }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Actions -->
        <div class="flex justify-end gap-4" v-if="request.status !== 'Issued'">
          <el-button type="danger" plain @click="rejectRequest">Reject Request</el-button>
          <el-button 
            type="success" 
            size="large" 
            @click="submitIssueMaterial" 
            :loading="issuing"
            :disabled="request.available_stock < request.quantity_requested"
          >
            Confirm & Issue Part
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api/axios'

const route = useRoute()
const router = useRouter()
const requestId = route.params.id

const request = ref(null)
const loading = ref(false)
const issuing = ref(false)

const fetchRequestDetails = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/inventory/request/${requestId}`)
    request.value = response.data
  } catch (error) {
    ElMessage.error("Failed to load request details.")
    router.push('/material-requests')
  } finally {
    loading.value = false
  }
}

const submitIssueMaterial = async () => {
  issuing.value = true
  try {
    // This matches the issueMaterial transaction controller from your backend
    await api.patch(`/api/inventory/requests/${requestId}/issue`)
    ElMessage.success("Material issued and inventory updated successfully.")
    router.push('/material-requests')
  } catch (error) {
    ElMessage.error(error.response?.data?.error || "Failed to issue material.")
  } finally {
    issuing.value = false
  }
}

const rejectRequest = () => {
  ElMessage.info("Reject logic to be implemented.")
  // Implement patch to change status to 'Rejected' if needed
}

onMounted(() => {
  fetchRequestDetails()
})
</script>
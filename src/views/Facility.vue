<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Facility Management</h2>
      <el-button type="primary" @click="openAddDialog">Add New Facility</el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="facilities" v-loading="loading" border style="width: 100%">
        <el-table-column prop="facility_id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="Facility Name" width="200" />
        <el-table-column prop="location" label="Location" width="180" />
        <el-table-column prop="type" label="Type" width="150" />
        <el-table-column prop="manager_name" label="Manager">
          <template #default="scope">
            <el-tag v-if="!scope.row.manager_name" type="info" size="small">Unassigned</el-tag>
            <span v-else>{{ scope.row.manager_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
          <template #default="scope">
            <!-- We will build this management page next -->
            <el-button size="small" type="primary" plain @click="goToManage(scope.row.facility_id)">
              Manage
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add Dialog -->
    <el-dialog
      title="Add New Facility"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" ref="facilityFormRef" label-position="top">
        <el-form-item 
          label="Facility Name" 
          prop="name" 
          :rules="[{ required: true, message: 'Facility name is required', trigger: 'blur' }]"
        >
          <el-input v-model="form.name" placeholder="e.g., Downtown Repair Hub" />
        </el-form-item>
        
        <el-form-item label="Location" prop="location">
          <el-input v-model="form.location" placeholder="e.g., Nairobi Central" />
        </el-form-item>

        <el-form-item label="Type" prop="type">
          <el-input v-model="form.type" placeholder="e.g., Storefront, Warehouse" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            Save
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api/axios'

const router = useRouter()
const facilities = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const facilityFormRef = ref(null)

const form = ref({
  name: '',
  location: '',
  type: ''
})

const fetchFacilities = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/facilities')
    facilities.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load facilities')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  form.value = { name: '', location: '', type: '' }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!facilityFormRef.value) return
  
  await facilityFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await api.post('/api/facilities', form.value)
        ElMessage.success('Facility created successfully')
        dialogVisible.value = false
        await fetchFacilities()
      } catch (error) {
        ElMessage.error(error.response?.data?.error || 'Error saving facility')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const resetForm = () => {
  if (facilityFormRef.value) {
    facilityFormRef.value.resetFields()
  }
}

const goToManage = (id) => {
  router.push(`/facilities/${id}/manage`)
}

onMounted(() => {
  fetchFacilities()
})
</script>
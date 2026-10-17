<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Role Management</h2>
      <el-button type="primary" @click="openAddDialog">Add New Role</el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="roles" v-loading="loading" border style="width: 100%">
        <el-table-column prop="role_id" label="ID" width="80" align="center" />
        <el-table-column prop="role_name" label="Role Name" width="200" />
        <el-table-column prop="description" label="Description" />
        <el-table-column label="Actions" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">
              Edit
            </el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row.role_id)">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="isEditing ? 'Edit Role' : 'Add New Role'"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" ref="roleFormRef" label-position="top">
        <el-form-item 
          label="Role Name" 
          prop="role_name" 
          :rules="[{ required: true, message: 'Role name is required', trigger: 'blur' }]"
        >
          <el-input v-model="form.role_name" placeholder="e.g., Technician" />
        </el-form-item>
        
        <el-form-item label="Description" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            rows="3" 
            placeholder="Describe the role responsibilities..." 
          />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api/axios'

const roles = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const roleFormRef = ref(null)

const form = ref({

  role_name: '',
  description: ''
})

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/roles')
    roles.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load roles')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEditing.value = false
  form.value = { role_id: null, role_name: '', description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEditing.value = true
  // Copy row data to avoid mutating the table directly before save
  form.value = { ...row }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEditing.value) {
          await api.put(`/api/roles/${form.value.role_id}`, form.value)
          ElMessage.success('Role updated successfully')
        } else {
          await api.post('/api/roles', form.value
         )
          ElMessage.success('Role created successfully')
        }
        dialogVisible.value = false
        await fetchRoles()
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Error saving role')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = async (role_id) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this role? This cannot be undone.',
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    await api.delete(`/api/roles/${role_id}`)
    ElMessage.success('Role deleted successfully')
    await fetchRoles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || 'Error deleting role')
    }
  }
}

const resetForm = () => {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
}

onMounted(() => {
  fetchRoles()
})
</script>
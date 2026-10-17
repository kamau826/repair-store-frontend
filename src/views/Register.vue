<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <el-card class="w-full max-w-md p-4 shadow-lg rounded-xl">
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">
        Register New Staff
      </h2>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <div class="flex gap-4">
          <el-form-item label="First Name" prop="first_name" class="w-1/2">
            <el-input 
              v-model="form.firstName" 
              placeholder="John" 
              size="large" 
              clearable 
            />
          </el-form-item>

          <el-form-item label="Last Name" prop="last_name" class="w-1/2">
            <el-input 
              v-model="form.lastName" 
              placeholder="Doe" 
              size="large" 
              clearable 
            />
          </el-form-item>
        </div>

        <el-form-item label="Email Address" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="staff@store.com" 
            size="large" 
            clearable 
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="Create a strong password" 
            size="large" 
            show-password 
          />
        </el-form-item>

        <el-button 
          type="primary" 
          size="large" 
          class="w-full mt-4" 
          :loading="loading" 
          @click="handleRegister"
        >
          Create Account
        </el-button>

        <div class="text-center mt-4 text-sm text-gray-600">
          Already have an account? 
          <router-link to="/login" class="text-blue-500 hover:underline">Sign in</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api/axios'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

const rules = {
  firstName: [
    { required: true, message: 'First name is required', trigger: 'blur' }
  ],
  lastName: [
    { required: true, message: 'Last name is required', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await api.post('/api/users/register', {
      firstName: form.firstName,
      lastName: form. lastName,
      email: form.email,
      password: form.password,
      // facility_id: 1, // Add if required by backend constraints
      // staff_number: 'STF-001' // Add if required by backend constraints
    })
    console.log(response)
    ElMessage.success('Staff account created successfully!')
    router.push('/login')
    
  } catch (err) {
    console.error(err)
    if (err.response) {
      ElMessage.error(err.response.data.message || 'Failed to register account')
    }
  } finally {
    loading.value = false
  }
}
</script>
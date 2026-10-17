<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <el-card class="w-full max-w-md p-4 shadow-lg rounded-xl">
        <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">Staff Sign</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="Email Address" prop="email">
        <el-input 
        v-model="form.email"
        placeholder="staff email"
        size="large"
        clearable
        />
        </el-form-item>
      <el-form-item label="password" prop="password">
        <el-input 
        v-model="form.password"
        type="password"
        placeholder="Enter password"
        size="large"
        show-password
        />

      </el-form-item>
      <el-button
      type="primary"
      size="large"
      class="w-full mt-4"
      :loading="loading"
      @click="handleLogin"      
      >Sign in</el-button>
    </el-form>
    </el-card>

    </div>
</template>
<script setup>
import {reactive,ref} from 'vue'
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';

const router=useRouter()
const formRef=ref(null)
const loading=ref(false)
const authStore=useAuthStore()

const form=reactive({
    email:'',
    password:''
});

const rules={
    email:[
        {required:true,message:'Please enter email',trigger:'blur'},
        {type:'email',message:'Please enter a valid email',trigger:'blur'}
    ],
    password:[
       {required:true,message:'Please enter email',trigger:'blur'}
    ]
}
const handleLogin = async () => {
  if (!formRef.value) return 
  
  try {
   
   
    await formRef.value.validate() 
    
   
    loading.value = true 
    
   
    await authStore.login({
      email:form.email,
      password:form.password
    })
   
    ElMessage.success('Login successful!')
    router.push('/') // Redirect the user to the Dashboard
    
  } catch (err) {
    // If the rules fail, or the backend rejects the password, or CORS blocks the request, it lands here.
    console.error("ERROR CAUGHT:", err)
    
    // Check if the error came from the backend server
    if (err.response) {
      ElMessage.error(err.response.data.error || 'Invalid credentials')
    } 
  } finally {
    // This runs no matter what happens, turning off the loading spinner so the form doesn't stay frozen.
    loading.value = false 
  }
}
</script>
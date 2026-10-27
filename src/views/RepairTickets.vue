<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Repair Tickets</h1>
      
      <div class="flex gap-4">
        <el-input
          v-model="searchQuery"
          placeholder="Search ticket or customer..."
          clearable
          style="width: 250px"
        />
        <el-select v-model="statusFilter" placeholder="Filter Status" clearable style="width: 150px">
          <el-option label="Open" value="open" />
          <el-option label="In Progress" value="in_progress" />
          <el-option label="Completed" value="completed" />
        </el-select>
        <el-button type="primary" @click="openNewTicketDialog">Create Ticket</el-button>
      </div>
    </div>

    <el-card shadow="hover">
      <el-table :data="filteredTickets" v-loading="loading" border style="width: 100%" height="calc(100vh - 200px)" sizw="small">
        <el-table-column prop="ticket_number" label="Ticket No." width="140" />
        
        <el-table-column label="Customer" width="180">
          <template #default="scope">
            {{ scope.row.customer_first }} {{ scope.row.customer_last }}
            <br>
            <span class="text-xs text-gray-500">{{ scope.row.customer_phone }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="device_model" label="Device Model" width="160" />
        <el-table-column prop="fault_description" label="Reported Fault" min-width="200" show-overflow-tooltip />
        
        <el-table-column label="Technician" width="150">
          <template #default="scope">
            <span v-if="scope.row.technician_id">{{ scope.row.tech_first }} {{ scope.row.tech_last }}</span>
            <span v-else class="text-gray-400 italic">Unassigned</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status || 'open' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" link 
            @click="$router.push(`/tickets/${scope.row.ticket_id}`)"
            >Manage</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Create New Ticket Dialog -->
    <el-dialog title="Create Repair Ticket" v-model="dialogVisible" width="650px">
      <el-form :model="newTicket" label-width="130px">
        <el-divider content-position="left">Customer Details</el-divider>
        <div class="flex gap-4">
          <el-form-item label="First Name" required class="flex-1">
            <el-input v-model="newTicket.firstName" />
          </el-form-item>
          <el-form-item label="Last Name" required class="flex-1">
            <el-input v-model="newTicket.lastName" />
          </el-form-item>
        </div>
        <el-form-item label="Phone Number" required>
          <el-input v-model="newTicket.phone" placeholder="e.g., 0712345678" />
        </el-form-item>

        <el-divider content-position="left">Device Details</el-divider>
        <div class="flex gap-4">
          <el-form-item label="Category" required class="flex-1">
            <el-select v-model="newTicket.category" placeholder="Select" class="w-full">
              <el-option label="TV" value="TV" />
              <el-option label="Fridge" value="Fridge" />
              <el-option label="Microwave" value="Microwave" />
              <el-option label="Washing Machine" value="Washing Machine" />
            </el-select>
          </el-form-item>
          <el-form-item label="Device Model" required class="flex-1">
            <el-input v-model="newTicket.deviceModel" />
          </el-form-item>
        </div>
        
        <el-form-item label="Serial Number">
          <el-input v-model="newTicket.serialNumber" />
        </el-form-item>

        <el-form-item label="Fault Description" required>
          <el-input v-model="newTicket.fault_description" type="textarea" rows="3" />
        </el-form-item>

        <el-form-item label="Estimated Cost">
          <el-input v-model.number="newTicket.estimatedCost" type="number">
            <template #prepend>KSh</template>
          </el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitTicket" :loading="submitLoading">Save Ticket</el-button>
      </template>
    </el-dialog>
  </div>

  <!-- New Technician Field -->
        <el-form-item label="Assign Technician">
          <el-select v-model="newTicket.technicianId" placeholder="Select a technician (Optional)" clearable class="w-full">
            <el-option 
              v-for="tech in technicianList" 
              :key="tech.staff_id" 
              :label="`${tech.first_name} ${tech.last_name}`" 
              :value="tech.staff_id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Estimated Cost">
          <el-input v-model.number="newTicket.estimatedCost" type="number">
            <template #prepend>KSh</template>
          </el-input>
        </el-form-item>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api/axios'

const ticketsList = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const technicianList=ref([])

const fetchTechnicians = async () => {
  try {
    
    const response = await api.get('/api/users/role/Technician') 
    techniciansList.value = response.data
  } catch (error) {
    console.error('Failed to load technicians:', error)
  }
}
const newTicket = ref({
  firstName: '',
  lastName: '',
  phone: '',
  category: '',
  deviceModel: '',
  serialNumber: '',
  fault_description: '',
  estimatedCost: 0
})

const filteredTickets = computed(() => {
  return ticketsList.value.filter(ticket => {
    const searchString = searchQuery.value.toLowerCase()
    const matchSearch = 
      (ticket.customer_first?.toLowerCase() || '').includes(searchString) ||
      (ticket.customer_last?.toLowerCase() || '').includes(searchString) ||
      (ticket.ticket_number?.toLowerCase() || '').includes(searchString)
      
    const matchStatus = statusFilter.value ? ticket.status === statusFilter.value : true
    return matchSearch && matchStatus
  })
})

const fetchTickets = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/tickets')
    // The backend returns { tickets: result.rows }
    ticketsList.value = response.data.tickets || []
  } catch (error) {
    ElMessage.error('Failed to load tickets.')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openNewTicketDialog = () => {
  newTicket.value = {
    firstName: '', lastName: '', phone: '', category: '',
    deviceModel: '', serialNumber: '', fault_description: '', estimatedCost: 0
  }
  dialogVisible.value = true
}

const submitTicket = async () => {
  if (!newTicket.value.firstName || !newTicket.value.phone || !newTicket.value.fault_description) {
    return ElMessage.warning('Please fill in required fields.')
  }
  
  submitLoading.value = true
  try {
    await api.post('/api/tickets', newTicket.value)
    ElMessage.success('Ticket created successfully!')
    dialogVisible.value = false
    fetchTickets() // Refresh the table
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'Failed to create ticket.')
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const getStatusType = (status) => {
  const types = { 'open': 'warning', 'in_progress': 'primary', 'completed': 'success' }
  return types[status?.toLowerCase()] || 'info'
}

onMounted(() => {
  fetchTickets()
  fetchTechnicians()
})
</script>
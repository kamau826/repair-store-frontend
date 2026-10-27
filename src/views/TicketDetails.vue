<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        Manage Ticket <span v-if="ticket">#{{ ticket.ticket_number }}</span>
      </h1>
      <el-button @click="$router.push('/tickets')">Back to List</el-button>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-if="ticket">
      
      <!-- LEFT COLUMN: Static Info -->
      <el-card shadow="never" class="col-span-1 border">
        <h3 class="font-bold text-lg mb-4 border-b pb-2">Device Details</h3>
        <div class="space-y-3">
          <p><strong>Model:</strong> {{ ticket.device_model }}</p>
          <p><strong>Fault:</strong> {{ ticket.fault_description }}</p>
          <p>
            <strong>Status:</strong> 
            <el-tag :type="ticket.status === 'completed' ? 'success' : 'warning'">
              {{ ticket.status || 'Open' }}
            </el-tag>
          </p>
          <p v-if="ticket.tech_first">
            <strong>Assigned Tech:</strong> {{ ticket.tech_first }} {{ ticket.tech_last }}
          </p>
        </div>
      </el-card>

      <!-- RIGHT COLUMN: Role-Based Workspaces -->
      <el-card shadow="never" class="col-span-1 md:col-span-2 border">
        
        <!-- Only render tabs IF the user data is fully loaded from Pinia -->
        <div v-if="isUserLoaded">
          <el-tabs v-model="activeTab">
            
            <!-- RECEPTION TAB -->
            <el-tab-pane label="Reception Controls" name="reception" v-if="canViewReception">
              <div class="space-y-6 mt-4">
                
                <div class="p-4 border rounded bg-gray-50">
                  <h4 class="font-semibold mb-3">1. Assign Technician</h4>
                  <div class="flex gap-4">
                    <el-select v-model="selectedTechnician" placeholder="Select Technician" class="flex-1">
                      <el-option 
                        v-for="tech in techniciansList" 
                        :key="tech.staff_id" 
                        :label="`${tech.first_name} ${tech.last_name}`" 
                        :value="tech.staff_id" 
                      />
                    </el-select>
                    <el-button type="primary" @click="assignTechnician" :loading="assignLoading">Assign</el-button>
                  </div>
                </div>

                <div class="p-4 border rounded bg-gray-50">
                  <h4 class="font-semibold mb-3">2. Ticket Status</h4>
                  <div class="flex gap-4">
                    <el-select v-model="ticketStatus" class="flex-1">
                      <el-option label="Open" value="open" />
                      <el-option label="In Progress" value="in_progress" />
                      <el-option label="Completed" value="completed" />
                    </el-select>
                    <el-button type="success" @click="updateStatus" :loading="statusLoading">Update</el-button>
                  </div>
                </div>

              </div>
            </el-tab-pane>

            <!-- TECHNICIAN TAB -->
            <el-tab-pane label="Technician Workspace" name="technician" v-if="canViewTechnician">
              <div class="space-y-6 mt-4">
                
                <div class="p-4 border rounded bg-gray-50">
                  <h4 class="font-semibold mb-3">1. Request Spare Parts</h4>
                  <div class="flex gap-4 mb-4">
                    <el-select v-model="materialForm.material_id" filterable placeholder="Search Inventory..." class="flex-1">
                      <el-option 
                        v-for="item in inventoryList" 
                        :key="item.material_id" 
                        :label="`${item.part_number} - ${item.part_name} (Stock: ${item.quantity})`" 
                        :value="item.material_id" 
                        :disabled="item.quantity < 1"
                      />
                    </el-select>
                    <el-input-number v-model="materialForm.quantity_requested" :min="1" :max="10" />
                    <el-button type="warning" @click="requestMaterial" :loading="requestLoading">Order Part</el-button>
                  </div>
                </div>

                <div class="p-4 border rounded bg-gray-50">
                  <h4 class="font-semibold mb-3">2. Repair Notes</h4>
                  <el-input type="textarea" v-model="diagnosisNotes" rows="3" placeholder="Enter diagnosis..." class="mb-4" />
                  <el-button type="success" class="w-full">Complete Repair</el-button>
                </div>

              </div>
            </el-tab-pane>

          </el-tabs>
        </div>
        
        <!-- Loading state while waiting for Pinia/Auth -->
        <div v-else class="py-10 text-center text-gray-500">
          Loading workspace permissions...
        </div>

      </el-card>
      <!-- storekeeper workspace -->
       <el-tab-pane label="StoreKeeper Workspace" name="storekeeper" v-if="canViewStoreKeeper" >
       <div class="space-y-6 mt-4">
        <div class="p-4 border rounded bg-gray-50">
          <h4>Pending Material Requests</h4>
          <el-table :data="ticketMaterials" border stripe empty-text="No parts requested for this ticket"  >
          <el-table-column prop="part_number" label="Part No." width="120" />
                    <el-table-column prop="quantity_requested" label="Qty" width="80" align="center" />
                    <el-table-column prop="status" label="Status" width="120">
                      <template #default="scope">
                        <el-tag :type="scope.row.status === 'Issued' ? 'success' : 'warning'">
                          {{ scope.row.status }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="Actions" align="right">
                      <template #default="scope">
                        <el-button 
                          v-if="scope.row.status !== 'Issued'"
                          type="primary" 
                          size="small" 
                          @click="issueMaterial(scope.row.request_id)"
                        >
                          Issue Part
                        </el-button>
                      </template>
                    </el-table-column>
          </el-table>
        </div>
       </div>
       </el-tab-pane>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

// --- Setup ---
const route = useRoute()
const authStore = useAuthStore()
const ticketId = route.params.id

// --- Global State ---
const ticket = ref(null)
const isUserLoaded = computed(() => !!authStore.staff)
const userRoles = computed(() => authStore.staff?.roles || [])

// --- Role Permissions ---
const canViewReception = computed(() => userRoles.value.some(r => ['Reception', 'Receptionist', 'Shop-Manager', 'Country-Manager'].includes(r)))
const canViewTechnician = computed(() => userRoles.value.some(r => ['Technician', 'Shop-Manager', 'Country-Manager'].includes(r)))

const activeTab = ref('reception')

// Watch roles to set the default tab safely
watch(userRoles, (roles) => {
  if (roles.includes('Technician')) {
    activeTab.value = 'technician'
  } else {
    activeTab.value = 'reception'
  }
}, { immediate: true })

// --- Reception State ---
const techniciansList = ref([])
const selectedTechnician = ref(null)
const ticketStatus = ref('open')
const assignLoading = ref(false)
const statusLoading = ref(false)

// --- Technician State ---
const inventoryList = ref([])
const diagnosisNotes = ref('')
const materialForm = ref({ material_id: null, quantity_requested: 1 })
const requestLoading = ref(false)

// --- API Fetches ---
const loadTicketDetails = async () => {
  try {
    const response = await api.get(`/api/tickets/${ticketId}`)
    ticket.value = response.data
    selectedTechnician.value = response.data.technician_id || null
    ticketStatus.value = response.data.status || 'open'
  } catch (error) {
    ElMessage.error("Failed to load ticket details.")
  }
}

const loadTechnicians = async () => {
  try {
    const response = await api.get('/api/users/role/Technician')
    techniciansList.value = response.data
  } catch (error) {
    console.error("Failed to load technicians list")
  }
}

const loadInventory = async () => {
  try {
    const response = await api.get('/api/inventory/') 
    inventoryList.value = response.data.inventory || response.data
  } catch (error) {
    console.error("Failed to load inventory list")
  }
}

// --- Actions ---
const assignTechnician = async () => {
  if (!selectedTechnician.value) return ElMessage.warning("Select a technician")
  assignLoading.value = true
  try {
    await api.patch(`/api/tickets/assignTechnician/${ticketId}`, { technicianId: selectedTechnician.value })
    ElMessage.success("Technician assigned")
    loadTicketDetails()
  } catch (error) {
    ElMessage.error("Error assigning technician")
  } finally {
    assignLoading.value = false
  }
}

const updateStatus = async () => {
  statusLoading.value = true
  try {
    await api.patch(`/api/tickets/updateStatus/${ticketId}`, { status: ticketStatus.value })
    ElMessage.success("Status updated")
    loadTicketDetails()
  } catch (error) {
    ElMessage.error("Error updating status")
  } finally {
    statusLoading.value = false
  }
}

const requestMaterial = async () => {
  if (!materialForm.value.material_id) return ElMessage.warning("Select a part")
  requestLoading.value = true
  try {
    await api.post(`/api/inventory/requests`, {
      ticketId: ticketId,
      materialId: materialForm.value.material_id,
      quantityRequested: materialForm.value.quantity_requested
    })
    ElMessage.success("Part requested")
    materialForm.value = { material_id: null, quantity_requested: 1 }
  } catch (error) {
    ElMessage.error("Error requesting part")
  } finally {
    requestLoading.value = false
  }
}

// --- Lifecycle ---
onMounted(() => {
  loadTicketDetails()
  // Load necessary dropdown data based on roles
  if (canViewReception.value) loadTechnicians()
  if (canViewTechnician.value) loadInventory()
})
</script>
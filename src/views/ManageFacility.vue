<template>
  <div class="p-6" v-loading="loading">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <el-button icon="Back" circle @click="router.push('/facilities')" />
        <h2 class="text-2xl font-bold text-gray-800">
          Manage Facility: {{ facility?.name || "Loading..." }}
        </h2>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Facility Details Card -->
      <el-card shadow="hover">
        <template #header>
          <div class="font-bold">Facility Details</div>
        </template>
        <div class="space-y-4">
          <div>
            <span class="font-semibold">Location:</span>
            {{ facility?.location }}
          </div>
          <div>
            <span class="font-semibold">Type:</span>
            {{ facility?.type || "N/A" }}
          </div>
          <div
            class="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-semibold mb-1">Shop Manager</div>
              <div
                v-if="facility?.manager_name"
                class="text-green-600 font-medium"
              >
                {{ facility.manager_name }}
              </div>
              <el-tag v-else type="warning">Unassigned</el-tag>
            </div>
            <el-button type="primary" plain @click="openAssignManagerDialog">
              {{ facility?.manager_name ? "Change Manager" : "Assign Manager" }}
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- Staff List Card (Placeholder for later) -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex justify-between items-center font-bold">
            <span>Assigned Staff</span>
            <el-button
              size="small"
              type="suceess"
              plain
              @click="openAssignStaffDialog"
              >Add staff</el-button
            >
          </div>
        </template>
        <el-table
          v-if="assignedStaff.length > 0"
          :data="assignedStaff"
          border
          size="small"
        >
          <el-table-column prop="first_name" label="Name">
            <template #default="scope">
              {{ scope.row.first_name }}{{ scope.row.last_name }}
            </template>
          </el-table-column>
          <el-table-column prop="roles" label="Roles">
            <template #default="scope">
              <el-tag
                v-for="role in scope.row.roles"
                :key="role"
                size="small"
                class="mr-1"
              >
                {{ role }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-else
          description="No staff assigned yet"
          :image-size="100"
        />
      </el-card>
    </div>
    <!-- Facility Stores Card  -->
    <el-card shadow="hover" class="mt-6 col-span-1 md:col-span-2">
      <template #header>
        <div class="flex justify-between items-center font-bold">
          <span>Facility Stores</span>
          <el-button
            size="small"
            type="primary"
            plain
            @click="storeDialogVisible = true"
          >
            Add Store
          </el-button>
        </div>
      </template>

      <el-table :data="stores" v-loading="loadingStores" border size="small">
        <el-table-column
          prop="store_id"
          label="Store ID"
          width="80"
          align="center"
        />
        <el-table-column prop="name" label="Store Name" />
        <el-table-column prop="storekeeper_name" label="Storekeeper">
          <template #default="scope">
            <span v-if="scope.row.storekeeper_name">{{
              scope.row.storekeeper_name
            }}</span>
            <el-tag v-else type="info" size="small">Unassigned</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" link>Manage Bins</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Assign Manager Dialog -->
    <el-dialog
      title="Assign Shop Manager"
      v-model="assignDialogVisible"
      width="400px"
    >
      <el-form label-position="top">
        <el-form-item label="Select Shop Manager">
          <el-select
            v-model="managerId"
            placeholder="Select manager to assign"
            class="w-full"
            v-loading="loadingManagers"
          >
            <el-option
              v-for="manager in availableManagers"
              :key="manager.staff_id"
              :label="`${manager.first_name}-${manager.last_name}`"
              :value="manager.staff_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            @click="submitManagerAssignment"
            :loading="assignLoading"
          >
            Assign
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <el-dialog
    title="Assign Staff Member"
    v-model="assignStaffDialogVisible"
    width="400px"
  >
    <el-form label-position="top">
      <el-form-item label="Select Staff Member">
        <el-select
          v-model="staffId"
          placeholder="Select staff to assign"
          class="w-full"
          v-loading="loadingAvailableStaff"
        >
          <el-option
            v-for="staff in availableStaff"
            :key="staff.staff_id"
            :label="`${staff.first_name}-${staff.last_name}`"
            :value="staff.staff_id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="assignStaffDialogVisible = false">Cancel</el-button>
      <el-button
        type="primary"
        @click="submitStaffAssignment"
        :loading="assignStaffLoading"
        :disabled="!staffId"
        >Assign</el-button
      >
    </template>
  </el-dialog>

  <!-- Add Store Dialog -->
  <el-dialog title="Add New Store" v-model="storeDialogVisible" width="400px">
    <el-form :model="storeForm" label-position="top">
      <el-form-item label="Store Name" required>
        <el-input
          v-model="storeForm.name"
          placeholder="e.g., Main Parts Room"
        />
      </el-form-item>
      <el-form-item label="Assign Storekeeper (Optional)">
        <!-- This reuses the staff already assigned to this facility! -->
        <el-select
          v-model="storeForm.storekeeper_id"
          placeholder="Select staff member"
          clearable
          class="w-full"
        >
          <el-option
            v-for="staff in assignedStaff"
            :key="staff.staff_id"
            :label="`${staff.first_name} ${staff.last_name}`"
            :value="staff.staff_id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="storeDialogVisible = false">Cancel</el-button>
      <el-button
        type="primary"
        @click="submitStore"
        :loading="submitStoreLoading"
        >Save</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api/axios'

const route = useRoute()
const router = useRouter()
const facilityId = route.params.id

const assignedStaff = ref([])
const availableStaff = ref([])
const assignStaffDialogVisible = ref(false)
const loadingAvailableStaff = ref(false)
const assignStaffLoading = ref(false)
const staffId = ref(null)

const stores = ref([])
const loadingStores = ref(false)
const storeDialogVisible = ref(false)
const submitStoreLoading = ref(false)
const storeForm = ref({
  name: '',
  storekeeper_id: null
})

const fetchStores = async () => {
  loadingStores.value = true
  try {
    const response = await api.get(`/api/stores/facility/${facilityId}`)
    stores.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load stores')
  } finally {
    loadingStores.value = false
  }
}

const submitStore = async() => {
  if (!storeForm.value.name) return ElMessage.warning('Store name is required'
)

  submitStoreLoading.value =
true
  try
 {
    await api.post('/api/stores'
, {
      name
: storeForm.value.name,
      facility_id
: facilityId,
      storekeeper_id
: storeForm.value.storekeeper_id
    })
    ElMessage.success(
'Store created successfully'
)
    storeDialogVisible.value =
false
    storeForm.value = {
name: '', storekeeper_id: null
 }
    await
 fetchStores()
  }
catch
 (error) {
    ElMessage.error(error.response?.data?.error ||
'Failed to create store'
)
  }
finally
 {
    submitStoreLoading.value = false
  }
}

// Fetch staff working at this facility
const fetchFacilityStaff = async () => {
  try {
    const response = await api.get(`/api/facilities/${facilityId}/staff`)
    assignedStaff.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load assigned staff')
  }
}
//  Fetch unassigned staff for the dropdown
const fetchAvailableStaff = async () => {
  loadingAvailableStaff.value = true
  try {
    const response = await api.get('/api/facilities/available-staff')
    availableStaff.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load available staff')
  } finally {
    loadingAvailableStaff.value = false
  }
}
const openAssignStaffDialog = async () => {
  staffId.value = null
  assignStaffDialogVisible.value = true
  await fetchAvailableStaff()
}
const submitStaffAssignment = async () => {
  assignStaffLoading.value = true
  try {
    await api.post(`/api/facilities/${facilityId}/assign-staff`, {
      staffId: staffId.value
    })
    ElMessage.success('Staff assigned successfully')
    assignStaffDialogVisible.value = false

    // Refresh both tables to reflect the new state
    await fetchFacilityStaff()
    await fetchAvailableStaff()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'Failed to assign staff')
  } finally {
    assignStaffLoading.value = false
  }
}
const facility = ref(null)
const loading = ref(false)
const assignDialogVisible = ref(false)
const assignLoading = ref(false)
const managerId = ref(null)

const availableManagers=ref([]);
const loadingManagers=ref(false)

const fetchAvailableManagers=async()=>{
    loadingManagers.value=true;
    try {
        const response=await api.get('/api/users/available-managers')

        availableManagers.value=response.data
         console.log("managers",availableManagers.value)
    } catch (error) {
        ElMessage.error('Failed to load managers,contact IT support')
    }finally{
        loadingManagers.value=false
    }
}
const openAssignManagerDialog=async()=>{
    managerId.value=null,
    assignDialogVisible.value=true,
    await fetchAvailableManagers()
}
const fetchFacilityDetails = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/facilities/${facilityId}`)
    facility.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load facility details')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const submitManagerAssignment = async () => {
  if (!managerId.value) {
    ElMessage.warning('Please enter a Staff ID')
    return
  }

  assignLoading.value = true
  try {
    await api.post(`/api/facilities/${facilityId}/assign-manager`, {
      managerId: managerId.value
    })
    ElMessage.success('Manager assigned successfully')
    assignDialogVisible.value = false
    managerId.value = null
    await fetchFacilityDetails()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'Failed to assign manager')
  } finally {
    assignLoading.value = false
  }
}

onMounted(() => {
  fetchFacilityDetails()
  fetchFacilityStaff()
  fetchStores()
})
</script>

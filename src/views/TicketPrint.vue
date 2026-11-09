<template>
  <div class="p-8 max-w-3xl mx-auto bg-white text-black font-sans">
    <div v-if="loading" class="text-center mt-10">Loading receipt...</div>
    
   <div v-else class="print-content">
      <!-- Header -->
      <div class="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold uppercase tracking-wide text-gray-900">Repair Ticket</h1>
          <p class="text-sm mt-1">Ticket #: <strong>{{ ticket.ticket_number }}</strong></p>
          <p class="text-sm">Date: {{ new Date(ticket.created_at).toLocaleDateString() }}</p>
        </div>
        <div class="text-right">
          <!-- Replace with your actual repair shop name -->
          <h2 class="font-bold text-xl text-gray-900">Destiny Modern Electronics</h2>
          <p class="text-sm">Luthuli avenue, Nairobi</p>
        </div>
      </div>

      <!-- Customer & Device Info Grid -->
      <div class="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 class="font-bold border-b border-gray-300 mb-2 uppercase text-xs text-gray-600">Customer Details</h3>
          <p class="text-base">{{ ticket.customer_first }} {{ ticket.customer_last }}</p>
          <p class="text-base">{{ ticket.customer_phone }}</p>
        </div>
        <div>
          <h3 class="font-bold border-b border-gray-300 mb-2 uppercase text-xs text-gray-600">Device Details</h3>
          <p class="text-base"><strong>Model:</strong> {{ ticket.device_model }}</p>
          <p class="text-base"><strong>Serial:</strong> {{ ticket.serial_number || 'N/A' }}</p>
        </div>
      </div>

      <!-- Fault Description -->
      <div class="mb-6">
        <h3 class="font-bold border-b border-gray-300 mb-2 uppercase text-xs text-gray-600">Reported Issue</h3>
        <p class="text-base whitespace-pre-wrap">{{ ticket.fault_description }}</p>
      </div>

      <!-- Repair Notes (Only shows if there are notes) -->
      <div class="mb-6" v-if="ticket.repair_notes">
        <h3 class="font-bold border-b border-gray-300 mb-2 uppercase text-xs text-gray-600">Repair Notes</h3>
        <p class="text-base whitespace-pre-wrap">{{ ticket.repair_notes }}</p>
      </div>

      <!-- Material Consumed (Only shows if materials array exists and has items) -->
      <div class="mb-8" v-if="consumedMaterials.length>0">
        <h3 class="font-bold border-b border-gray-300 mb-2 uppercase text-xs text-gray-600">Material Consumed</h3>
        <table class="w-full text-left text-sm mb-2">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-1">Part Name</th>
              <th class="py-1">Qty</th>
              <th class="py-1 text-right">Unit Price</th>
              <th class="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in consumedMaterials" :key="part.part_id" class="border-b border-gray-100">
              <td class="py-1">{{ part.part_name }}</td>
              <td class="py-1">{{ part.quantity_requested }}</td>
              <td class="py-1 text-right">{{ part.unit_price }}</td>
              <td class="py-1 text-right">{{ Number(part.unit_price) * part.quantity_requested }}</td>
            </tr>
            <tr class="py-1 text-right">{{ ticket.labor_cost }}</tr>
          </tbody>
        </table>
      </div>

      <!-- Total Charge -->
      <div class="flex justify-end mb-12">
        <div class="w-1/2 md:w-1/3">
          <div class="flex  justify-between border-t-2 border-black pt-2 text-lg font-bold">
          
            <span>Total Charge:</span>
            <!-- Fallback to estimated_cost if total_cost isn't populated yet -->
            <span>KES {{ ticket.total_cost || ticket.estimated_cost || '0' }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm border-t-2 border-black pt-4">
        <p class="font-bold">Please present this receipt when collecting your device.</p>
        <p class="text-gray-600 mt-1">Thank you for choosing Carlcare Service Limited.</p>
      </div>
    </div>
    
    <!-- On-screen controls (Hidden during physical printing) -->
    <div class="mt-8 text-center print:hidden">
      <el-button type="primary" @click="triggerPrint">Print Again</el-button>
      <el-button @click="closeTab">Close Tab</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const ticket = ref({})
const ticketId=route.params.id
const loading = ref(true)
const consumedMaterials=ref([])
const loadConsumedMaterials=async()=>{
  try {
    const response=await api.get(`/api/tickets/ticket/${ticketId}/consumed`)
    consumedMaterials.value=response.data
    // console.log('consumed materials',consumedMaterials.value.unit_price.toLocaleString())
  } catch (error) {
    ElMessage.error("failed to load consumed materials")
  }
}

const fetchTicket = async () => {
  try {
    const response = await api.get(`/api/tickets/${route.params.id}`)
    ticket.value = response.data
    
    // Automatically open the print dialog after a short delay to let the UI render
    setTimeout(() => {
      window.print()
    }, 500)
  } catch (error) {
    console.error("Error fetching ticket for print", error)
  } finally {
    loading.value = false
  }
}

const triggerPrint = () => window.print()
const closeTab = () => window.close()

onMounted(() => {
  fetchTicket()
  loadConsumedMaterials()
})
</script>

<style scoped>
/* Force clean printing without background colors or margins */
@media print {
  @page { margin: 0.5cm; }
  body { background-color: white !important; }
}
</style>
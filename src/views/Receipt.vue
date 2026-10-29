<template>
  <!-- Background is gray on screen, but white when printing -->
  <div class="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
    
    <!-- Action Buttons (Hidden during printing) -->
    <div class="max-w-3xl mx-auto mb-4 flex justify-between print:hidden">
      <el-button @click="$router.push('/dashboard')">Back to Dashboard</el-button>
      <el-button type="primary" @click="printReceipt">Print Receipt</el-button>
    </div>

    <!-- Printable Area -->
    <div id="printable-receipt" class="max-w-3xl mx-auto bg-white p-10 shadow-md print:shadow-none" v-loading="loading">
      
      <!-- Header -->
      <div class="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Lukania Repair Center</h1>
          <p class="text-gray-600 mt-1">Luthuli Avenue</p>
          <p class="text-gray-600">Nairobi, Kenya</p>
        </div>
        <div class="text-right">
          <h2 class="text-2xl font-bold text-gray-800 uppercase">Receipt</h2>
          <p class="text-gray-600 mt-1">Ticket #: <span class="font-semibold text-gray-900">{{ ticket?.ticket_number }}</span></p>
          <p class="text-gray-600">Date: {{ new Date().toLocaleDateString() }}</p>
        </div>
      </div>

      <!-- Customer & Device Info -->
     <div class="grid grid-cols-3 gap-6 mb-8">
        <div>
          <h3 class="font-bold text-gray-800 border-b pb-1 mb-2">Customer Details</h3>
          <!-- Ensure your backend GET /tickets/:id route includes these columns -->
          <p class="text-gray-700"><strong>Name:</strong> {{ ticket?.customer_first || 'N/A' }}</p>
          <p class="text-gray-700"><strong>Phone:</strong> {{ ticket?.customer_phone || 'N/A' }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-800 border-b pb-1 mb-2">Device Details</h3>
          <p class="text-gray-700"><strong>Model:</strong> {{ ticket?.device_model || 'N/A' }}</p>
          <p class="text-gray-700"><strong>Fault:</strong> {{ ticket?.fault_description || 'N/A' }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-800 border-b pb-1 mb-2">Payment Info</h3>
          <p class="text-gray-700"><strong>Method:</strong> {{ ticket?.paymentMethod || ticket?.payment_method || 'Cash' }}</p>
          <p class="text-gray-700"><strong>Status:</strong> <span class="uppercase font-bold">{{ ticket?.status }}</span></p>
        </div>
      </div>

      <!-- Itemized Table -->
      <table class="w-full text-left mb-8 border-collapse">
        <thead>
          <tr class="bg-gray-100 print:bg-gray-100 text-gray-800">
            <th class="p-3 border">Description</th>
            <th class="p-3 border text-center">Qty</th>
            <th class="p-3 border text-right">Unit Price (KES)</th>
            <th class="p-3 border text-right">Amount (KES)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in consumedMaterials" :key="item.part_number" class="border-b">
            <td class="p-3 border">{{ item.part_name }} ({{ item.part_number }})</td>
            <td class="p-3 border text-center">{{ item.quantity_requested }}</td>
            <td class="p-3 border text-right">{{ Number(item.unit_price || 0).toLocaleString() }}</td>
            <td class="p-3 border text-right">{{ (Number(item.unit_price || 0) * Number(item.quantity_requested || 0)).toLocaleString() }}</td>
          </tr>
          <tr>
            <td class="p-3 border text-gray-800">Repair Labor</td>
            <td class="p-3 border text-center">-</td>
            <td class="p-3 border text-right">-</td>
            <td class="p-3 border text-right">{{ Number(ticket?.labor_cost || 0).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <div class="flex justify-end">
        <div class="w-64">
          <div class="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-800">
            <span>Total Paid:</span>
            <span>KES {{ Number(ticket?.estimated_cost || 0).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-16 text-center text-gray-500 text-sm border-t pt-4">
        <p>Thank you for Lukania Repair Center.</p>
        
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'

const route = useRoute()
const ticketId = route.params.id

const ticket = ref(null)
const consumedMaterials = ref([])
const loading = ref(true)

const loadData = async () => {
  try {
    const [ticketRes, materialsRes] = await Promise.all([
      api.get(`/api/tickets/${ticketId}`),
      api.get(`/api/tickets/ticket/${ticketId}/consumed`)
    ])
    ticket.value = ticketRes.data
    consumedMaterials.value = materialsRes.data
  } catch (error) {
    console.error("Error loading receipt data", error)
  } finally {
    loading.value = false
  }
}

const printReceipt = () => {
  window.print()
}

onMounted(() => {
  loadData()
})
</script>
<style scoped>
@media print {
  /* Hide everything on the page */
  body * {
    visibility: hidden;
  }
  
  /* Make only the receipt and its children visible */
  #printable-receipt, #printable-receipt * {
    visibility: visible;
  }
  
  /* Move the receipt to the absolute top-left for the printer */
  #printable-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px; /* Gives a nice margin on the physical paper */
    box-shadow: none;
  }
}
</style>
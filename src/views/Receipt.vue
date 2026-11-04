<template>
  <!-- Background is gray on screen, but white when printing -->
  <div class="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
    
    <!-- Action Buttons (Hidden during printing) -->
    <div class="max-w-3xl mx-auto mb-4 flex justify-between print:hidden">
      <el-button @click="$router.push('/dashboard')">Back to Dashboard</el-button>
      <el-button type="primary" @click="printReceipt">Print Receipt</el-button>
    </div>

    <!-- Printable Area -->
    <div id="printable-receipt" class="max-w-3xl mx-auto bg-white p-10 shadow-md print:shadow-none font-sans text-gray-900" v-loading="loading">
      
      <!-- Top Header & Contact Info -->
      <div class="flex justify-between items-start mb-2">
        <div class="p-2 border border-gray-300 rounded text-sm">
          <p>Luthuli Avenue</p>
          <p>Nairobi, Kenya</p>
        </div>
        <div class="text-center flex-1">
          <h2 class="text-xl font-bold text-blue-900 italic">DESTINY</h2>
          <h1 class="text-2xl font-black text-blue-900 uppercase leading-none">Modern</h1>
          <p class="text-xs font-semibold text-blue-900 tracking-widest uppercase">Electronics Services</p>
        </div>
        <div class="text-right text-sm">
          <p>P.O. Box 5377-00100, Nairobi</p>
          <p>Tel: +254 712 005 088</p>
        </div>
      </div>

      <!-- INVOICE TITLE & NUMBER -->
      <div class="flex justify-between items-end mb-6">
        <div class="w-1/3"></div>
        <h1 class="text-4xl font-extrabold text-blue-800 tracking-widest">INVOICE</h1>
        <div class="w-1/3 text-right">
          <span class="text-red-500 font-bold text-2xl">{{ ticket?.invoice_number || ticket?.ticket_number }}</span>
        </div>
      </div>

      <!-- 3-Column Meta Information Grid -->
      <div class="grid grid-cols-3 gap-6 mb-8 text-sm">
        <!-- Column 1: Bill From -->
        <div>
          <h3 class="font-bold text-blue-900 mb-1">Bill From</h3>
          <div class="grid grid-cols-[90px_1fr] gap-y-2 items-end">
            <span>Name:</span> <span class="border-b border-gray-500">Admin</span>
            <span>Company:</span> <span class="border-b border-gray-500 text-xs">Destiny Modern Electronics</span>
            <span>Address:</span> <span class="border-b border-gray-500">Luthuli Avenue</span>
            <span>City:</span> <span class="border-b border-gray-500">Nairobi</span>
            <span>Phone:</span> <span class="border-b border-gray-500">0712005088</span>
          </div>
        </div>

        <!-- Column 2: Bill To -->
        <div>
          <h3 class="font-bold text-blue-900 mb-1">Bill To</h3>
          <div class="grid grid-cols-[90px_1fr] gap-y-2 items-end">
            <span>Name:</span> <span class="border-b border-gray-500 whitespace-nowrap overflow-hidden">{{ ticket?.customer_first }} {{ ticket?.customer_last }}</span>
            <span>Company:</span> <span class="border-b border-gray-500"></span>
            <span>Address:</span> <span class="border-b border-gray-500"></span>
            <span>City:</span> <span class="border-b border-gray-500"></span>
            <span>Phone:</span> <span class="border-b border-gray-500">{{ ticket?.customer_phone }}</span>
          </div>
        </div>

        <!-- Column 3: Invoice Info -->
        <div>
          <div class="grid grid-cols-[90px_1fr] gap-y-2 items-end mt-5">
            <span>Invoice No:</span> <span class="border-b border-gray-500">{{ ticket?.invoice_number || ticket?.ticket_number }}</span>
            <span>Date:</span> <span class="border-b border-gray-500">{{ new Date().toLocaleDateString() }}</span>
            <span>Due Date:</span> <span class="border-b border-gray-500"></span>
            <span>Device:</span> <span class="border-b border-gray-500">{{ ticket?.device_model }}</span>
          </div>
        </div>
      </div>

      <!-- Main Data Table -->
      <table class="w-full text-left text-sm border-collapse border border-blue-900 mb-2">
        <thead>
          <tr class="bg-blue-800 text-white print:bg-blue-800 print:text-white print:-webkit-print-color-adjust-exact">
            <th class="border border-blue-900 py-1 px-2 w-1/2">Description</th>
            <th class="border border-blue-900 py-1 px-2 text-center">Quantity</th>
            <th class="border border-blue-900 py-1 px-2 text-right">Price (KES)</th>
            <th class="border border-blue-900 py-1 px-2 text-right">Total (KES)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Dynamic Material Rows -->
          <tr v-for="item in consumedMaterials" :key="item.part_number">
            <td class="border border-blue-900 py-2 px-2">{{ item.part_name }} ({{ item.part_number }})</td>
            <td class="border border-blue-900 py-2 px-2 text-center">{{ item.quantity_requested }}</td>
            <td class="border border-blue-900 py-2 px-2 text-right">{{ Number(item.unit_price || 0).toLocaleString() }}</td>
            <td class="border border-blue-900 py-2 px-2 text-right">{{ (Number(item.unit_price || 0) * Number(item.quantity_requested || 0)).toLocaleString() }}</td>
          </tr>
          
          <!-- Labor Row -->
          <tr>
            <td class="border border-blue-900 py-2 px-2">Repair Labor</td>
            <td class="border border-blue-900 py-2 px-2 text-center">-</td>
            <td class="border border-blue-900 py-2 px-2 text-right">-</td>
            <td class="border border-blue-900 py-2 px-2 text-right">{{ Number(ticket?.labor_cost || 0).toLocaleString() }}</td>
          </tr>

          <!-- Empty Rows to mimic the physical book grid (adjust count as needed) -->
          <tr v-for="i in Math.max(0, 8 - (consumedMaterials?.length || 0))" :key="'empty-'+i">
            <td class="border border-blue-900 py-4 px-2"></td>
            <td class="border border-blue-900 py-4 px-2"></td>
            <td class="border border-blue-900 py-4 px-2"></td>
            <td class="border border-blue-900 py-4 px-2"></td>
          </tr>
        </tbody>
      </table>

      <!-- Totals Section -->
      <div class="flex justify-end mb-8 text-sm">
        <div class="w-1/3 min-w-[200px]">
          <div class="grid grid-cols-[1fr_auto] text-right gap-y-0">
            <div class="pr-2 py-1">Subtotal</div>
            <div class="border border-blue-900 px-2 py-1 min-w-[100px]">{{ Number(ticket?.estimated_cost || 0).toLocaleString() }}</div>
            
            <div class="pr-2 py-1">Sale Tax</div>
            <div class="border border-blue-900 px-2 py-1">0</div>
            
            <div class="pr-2 py-1">Other</div>
            <div class="border border-blue-900 px-2 py-1">0</div>
            
            <div class="pr-2 py-1 font-bold">Total</div>
            <div class="border border-blue-900 px-2 py-1 font-bold">{{ Number(ticket?.estimated_cost || 0).toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Footer Notes -->
      <div class="text-xs italic text-gray-700 mt-12">
        <p>Thank you for your business.</p>
        <p class="mt-1">Please send payment within <span class="inline-block w-8 border-b border-gray-500"></span> days of receiving this invoice.</p>
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
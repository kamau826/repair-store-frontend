<template>
  <div class="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
    
    <!-- Action Buttons (Hidden during printing) -->
    <div class="max-w-4xl mx-auto mb-4 flex justify-between print:hidden">
      <el-button @click="$router.push('/invoices')">Back to Invoices</el-button>
      <el-button type="primary" @click="printInvoice" icon="Printer">Print Invoice</el-button>
    </div>

    <!-- Printable Area -->
    <div id="printable-invoice" class="max-w-4xl mx-auto bg-white p-10 shadow-md print:shadow-none font-sans text-gray-900" v-loading="loading">
      
      <!-- Top Header & Logo -->
      <div class="flex justify-between items-start mb-8 border-b-2 border-blue-900 pb-6">
        <div class="flex items-center gap-6">
          <!-- Logo Place: Point the src to where you saved your exported JPEG logo -->
          <img 
            src="@/assets/logo.jpg" 
            alt="Destiny Modern Electronics" 
            class="h-24 w-auto object-contain mix-blend-multiply"
          />
          <div>
            <h1 class="text-2xl font-black text-blue-900 uppercase tracking-wide">Destiny Modern Electronics</h1>
            <p class="text-sm text-gray-600 mt-1">Luthuli Avenue, Nairobi, Kenya</p>
            <p class="text-sm text-gray-600">P.O. Box 5377-00100</p>
            <p class="text-sm text-gray-600">Tel: +254 712 005 088</p>
          </div>
        </div>
        <div class="text-right">
          <h2 class="text-4xl font-extrabold text-blue-900 tracking-widest uppercase">Invoice</h2>
          <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
            <span class="font-bold">Invoice No:</span> 
            <span class="text-red-600 font-bold">{{ invoiceData?.invoice_number || 'DRAFT' }}</span>
            <span class="font-bold">Date:</span> 
            <span>{{ formatDate(invoiceData?.invoice_date || new Date()) }}</span>
            <span class="font-bold">Due Date:</span> 
            <span>{{ formatDate(invoiceData?.due_date) }}</span>
          </div>
        </div>
      </div>

      <!-- Bill To Section -->
      <div class="mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 class="text-sm font-bold text-blue-900 uppercase mb-2 border-b border-gray-300 pb-1">Bill To</h3>
        <!-- Assuming your backend joins the customer data -->
        <p class="font-bold text-lg text-gray-800">{{ invoiceData?.customer_name || 'Customer Name' }}</p>
        <p class="text-gray-600">{{ invoiceData?.customer_phone || 'Phone Number' }}</p>
        <p class="text-gray-600">{{ invoiceData?.customer_address || 'Address' }}</p>
      </div>

      <!-- Main Data Table (Handling the new invoice_items array) -->
      <table class="w-full text-left text-sm border-collapse border border-blue-900 mb-6">
        <thead>
          <tr class="bg-blue-800 text-white print:bg-blue-800 print:text-white print:-webkit-print-color-adjust-exact">
            <th class="border border-blue-900 py-2 px-3 w-7/12 uppercase tracking-wide">Description</th>
            <th class="border border-blue-900 py-2 px-3 text-center uppercase tracking-wide">Qty</th>
            <th class="border border-blue-900 py-2 px-3 text-right uppercase tracking-wide">Unit Price</th>
            <th class="border border-blue-900 py-2 px-3 text-right uppercase tracking-wide">Total (KES)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Iterate directly through the structured invoice items -->
          <tr v-for="(item, index) in invoiceData?.items" :key="index" class="border-b border-blue-900">
            <td class="border border-blue-900 py-3 px-3">
              <span class="font-medium text-gray-900">{{ item.description }}</span>
              <!-- Show internal ticket reference if it's a repair item -->
              <span v-if="item.ticket_id" class="block text-xs text-gray-500 mt-0.5">Ref: Ticket #{{ item.ticket_number || item.ticket_id }}</span>
            </td>
            <td class="border border-blue-900 py-3 px-3 text-center">{{ item.quantity }}</td>
            <td class="border border-blue-900 py-3 px-3 text-right">{{ Number(item.unit_price || 0).toLocaleString() }}</td>
            <td class="border border-blue-900 py-3 px-3 text-right font-medium">{{ Number(item.amount || 0).toLocaleString() }}</td>
          </tr>
          
          <!-- Empty Rows to ensure the table maintains a good height on the printed page -->
          <tr v-for="i in Math.max(0, 5 - (invoiceData?.items?.length || 0))" :key="'empty-'+i">
            <td class="border border-blue-900 py-6 px-3"></td>
            <td class="border border-blue-900 py-6 px-3"></td>
            <td class="border border-blue-900 py-6 px-3"></td>
            <td class="border border-blue-900 py-6 px-3"></td>
          </tr>
        </tbody>
      </table>

      <!-- Totals Section -->
      <div class="flex justify-end mb-12 text-sm">
        <div class="w-1/3 min-w-[250px]">
          <div class="grid grid-cols-[1fr_auto] text-right gap-y-1">
            <div class="pr-4 py-1 text-gray-600">Subtotal:</div>
            <div class="border border-blue-900 px-3 py-1 font-medium bg-gray-50">{{ Number(invoiceData?.subtotal || 0).toLocaleString() }}</div>
            
            <div class="pr-4 py-1 text-gray-600">Tax / VAT:</div>
            <div class="border border-blue-900 px-3 py-1 font-medium bg-gray-50">{{ Number(invoiceData?.tax_amount || 0).toLocaleString() }}</div>
            
            <div class="pr-4 py-1 text-gray-600">Discount:</div>
            <div class="border border-blue-900 px-3 py-1 font-medium bg-gray-50">- {{ Number(invoiceData?.discount_amount || 0).toLocaleString() }}</div>
            
            <div class="pr-4 py-2 mt-1 font-bold text-base text-blue-900 uppercase">Grand Total:</div>
            <div class="border-2 border-blue-900 px-3 py-2 mt-1 font-bold text-base bg-blue-50 print:bg-blue-50 print:-webkit-print-color-adjust-exact">
              KES {{ Number(invoiceData?.grand_total || 0).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Notes -->
      <div class="text-sm text-gray-700 border-t-2 border-blue-900 pt-6 mt-8">
        <p class="font-bold text-blue-900 mb-2">Payment Terms & Notes:</p>
        <ul class="list-disc list-inside space-y-1 text-xs">
          <li>Please reference Invoice No. <span class="font-bold">{{ invoiceData?.invoice_number }}</span> when making payments.</li>
          <li>All payments are due by {{ formatDate(invoiceData?.due_date) }}.</li>
          <li>Goods once sold cannot be re-accepted and money once paid is non-refundable.</li>
          <li>Failure to collect items after 3 months will incur a storage fee of Kshs 100 per day.</li>
        </ul>
        <div class="mt-8 text-center italic text-blue-900 font-medium">
          Thank you for your business!
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// import api from '@/services/api';

const route = useRoute();
const loading = ref(true);
const invoiceData = ref(null);

const fetchInvoiceData = async () => {
  loading.value = true;
  try {
    const invoiceId = route.params.id;
    // Replace with your actual backend call:
    // const response = await api.get(`/invoices/${invoiceId}`);
    // invoiceData.value = response.data;
    
    // Mock data matching the new enterprise payload structure
    invoiceData.value = {
      invoice_number: 'INV-20261110-001',
      invoice_date: '2026-11-10',
      due_date: '2026-11-20',
      customer_name: 'Nairobi Tech Hub (Corporate)',
      customer_phone: '0712 345 678',
      customer_address: 'Westlands, Nairobi',
      subtotal: 14500,
      tax_amount: 0,
      discount_amount: 0,
      grand_total: 14500,
      items: [
        {
          ticket_id: 105,
          ticket_number: 'KETCT2026102600001',
          description: 'Repair: 43 inch screen - Lines on screen',
          quantity: 1,
          unit_price: 13000,
          amount: 13000
        },
        {
          ticket_id: null,
          description: 'Delivery to Westlands',
          quantity: 1,
          unit_price: 1500,
          amount: 1500
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching invoice:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const printInvoice = () => {
  window.print();
};

onMounted(() => {
  fetchInvoiceData();
});
</script>

<style scoped>
/* Optional: Ensures backgrounds and borders print correctly in Webkit browsers */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
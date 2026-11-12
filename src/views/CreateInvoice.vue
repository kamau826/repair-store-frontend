<template>
  <div class="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Create New Invoice</h1>

    <!-- 1. Invoice Details & Customer Selection -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Customer</label>
        <el-select 
          v-model="invoiceData.customer_id" 
          placeholder="Select Customer" 
          class="w-full"
          @change="fetchUnbilledTickets"
          :loading="isLoadingCustomers"
        >
          <el-option 
            v-for="customer in customersList" 
            :key="customer.customer_uuid" 
            :label="customer.first_name || customer.company_name" 
            :value="customer.customer_uuid" 
          />
        </el-select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
        <el-date-picker 
          v-model="invoiceData.due_date" 
          type="date" 
          placeholder="Select due date" 
          class="w-full"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </div>
    </div>

    <!-- 2. Repair Tickets Selection -->
    <div class="mb-8">
      <h3 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">1. Select Repair Tickets</h3>
      <el-table 
        :data="unbilledTickets" 
        @selection-change="handleTicketSelection" 
        border 
        class="w-full"
        v-loading="isLoadingTickets"
        empty-text="Select a customer to see unbilled tickets"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="ticket_number" label="Ticket #" width="150" />
        <el-table-column prop="device_model" label="Device" />
        <el-table-column prop="fault_description" label="Fault" />
        <el-table-column label="Amount (KES)" align="right" width="150">
          <template #default="scope">
            {{ Number(scope.row.estimated_cost || 0).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 3. Additional Custom Charges -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-3 border-b pb-2">
        <h3 class="text-lg font-bold text-gray-800">2. Additional Charges (e.g., Delivery, Late Fees)</h3>
        <el-button type="primary" size="small" plain @click="addCustomItem">
          + Add Custom Item
        </el-button>
      </div>
      
      <el-table :data="customItems" border class="w-full" empty-text="No additional charges">
        <el-table-column label="Description">
          <template #default="scope">
            <el-input v-model="scope.row.description" placeholder="e.g. Delivery to Westlands" />
          </template>
        </el-table-column>
        <el-table-column label="Qty" width="100">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :min="1" size="small" class="w-full" />
          </template>
        </el-table-column>
        <el-table-column label="Unit Price (KES)" width="150">
          <template #default="scope">
            <el-input v-model.number="scope.row.unit_price" type="number" />
          </template>
        </el-table-column>
        <el-table-column label="Total (KES)" align="right" width="150">
          <template #default="scope">
            {{ (scope.row.quantity * (scope.row.unit_price || 0)).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column width="80" align="center">
          <template #default="scope">
            <el-button type="danger" icon="Delete" circle @click="removeCustomItem(scope.$index)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 4. Totals & Submission -->
    <div class="flex justify-end mb-6">
      <div class="w-64 bg-gray-50 p-4 rounded border border-gray-200 text-sm">
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Subtotal:</span>
          <span class="font-bold">KES {{ subtotal.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Tax (0%):</span>
          <span>KES 0</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-gray-300 text-lg font-bold text-gray-900">
          <span>Grand Total:</span>
          <span>KES {{ subtotal.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <el-button @click="$router.push('/invoices')">Cancel</el-button>
      <el-button type="primary" :loading="isSubmitting" @click="generateInvoice">
        Generate Invoice
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

import api from '../api/axios'



const router = useRouter();

// State
const isLoadingCustomers = ref(false);
const isLoadingTickets = ref(false);
const isSubmitting = ref(false);

const customersList = ref([]);
const unbilledTickets = ref([]);
const selectedTickets = ref([]);
const customItems = ref([]);

const invoiceData = reactive({
  customer_id: null,
  due_date: new Date().toISOString().split('T')[0], // Defaults to today
});

// Initialization
onMounted(async () => {
  await fetchCustomers();
});

// Fetch all customers for the dropdown
const fetchCustomers = async () => {
  isLoadingCustomers.value = true;
  try {
    const response = await api.get('/api/customers');
    customersList.value = response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    ElMessage.error('Failed to load customers.');
  } finally {
    isLoadingCustomers.value = false;
  }
};

// Fetch tickets specific to the selected customer that haven't been billed yet
const fetchUnbilledTickets = async (customerId) => {
  selectedTickets.value = [];
  unbilledTickets.value = [];
  
  if (!customerId) return;
  
  isLoadingTickets.value = true;
  try {
    // Assuming 'Fixed' is the status indicating ready for billing, and payment_status logic is handled via invoices now
    const response = await api.get(`/api/tickets?customer_id=${customerId}&status=repaired`);
    unbilledTickets.value = response.data ||[];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    ElMessage.error('Failed to load unbilled tickets.');
  } finally {
    isLoadingTickets.value = false;
  }
};

const handleTicketSelection = (val) => {
  selectedTickets.value = val;
};

const addCustomItem = () => {
  customItems.value.push({
    description: '',
    quantity: 1,
    unit_price: 0
  });
};

const removeCustomItem = (index) => {
  customItems.value.splice(index, 1);
};

// Computed Totals
const subtotal = computed(() => {
  const ticketsTotal = selectedTickets.value.reduce((sum, ticket) => sum + Number(ticket.estimated_cost || 0), 0);
  const customTotal = customItems.value.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unit_price || 0)), 0);
  return ticketsTotal + customTotal;
});

// Submit real data to the backend
const generateInvoice = async () => {
  if (!invoiceData.customer_id) {
    return ElMessage.warning('Please select a customer.');
  }
  if (selectedTickets.value.length === 0 && customItems.value.length === 0) {
    return ElMessage.warning('You must include at least one ticket or custom charge.');
  }

  isSubmitting.value = true;

  try {
    const itemsPayload = [
      ...selectedTickets.value.map(t => ({
        ticket_id: t.ticket_id,
        description: `Repair: ${t.device_model} - ${t.fault_description} (${t.ticket_number})`,
        quantity: 1,
        unit_price: Number(t.estimated_cost),
        amount: Number(t.estimated_cost)
      })),
      ...customItems.value.map(c => ({
        ticket_id: null, // Null for non-repair fees
        description: c.description,
        quantity: Number(c.quantity),
        unit_price: Number(c.unit_price),
        amount: Number(c.quantity) * Number(c.unit_price)
      }))
    ];

    const payload = {
      customer_id: invoiceData.customer_id,
      due_date: invoiceData.due_date,
      subtotal: subtotal.value,
      tax_amount: 0,
      discount_amount: 0,
      grand_total: subtotal.value,
      items: itemsPayload
    };

    const response = await api.post('/invoices', payload);
    
    // Extract the returned UUID from the backend to load the print view
    const newInvoiceId = response.data.invoice.invoice_id;
    
    ElMessage.success('Invoice generated successfully!');
    
    // Redirect immediately to the print view using the UUID
    router.push(`/invoices/${newInvoiceId}/print`);
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    ElMessage.error(error.response?.data?.error || 'Failed to generate invoice.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
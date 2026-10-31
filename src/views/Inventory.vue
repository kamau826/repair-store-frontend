<template>
  <!-- Reduced padding on mobile (p-3) vs desktop (sm:p-6) -->
  <div class="p-3 sm:p-6">
    
    <!-- Action Bar: Stacks vertically on mobile, horizontal on lg screens -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Global Inventory</h1>
      
      <!-- Filters and Buttons: Full width on mobile, auto width on larger screens -->
      <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <el-input 
          v-model="searchQuery"
          placeholder="Search by part number or name..."
          clearable
          class="w-full sm:w-[250px]"
        />
        <el-select 
          v-model="statusFilter" 
          placeholder="Filter status" 
          clearable 
          class="w-full sm:w-[150px]"
        >
          <el-option label="Good" value="good"/>
          <el-option label="Defective" value="defective"/>
        </el-select>
        
        <el-button 
          type="primary" 
          @click="fetchInventory" 
          :loading="loading" 
          class="w-full sm:w-auto"
        >
          Refresh List
        </el-button>
      </div>
    </div>

    <!-- Table Container -->
    <el-card shadow="hover" class="border-none sm:border-solid">
      <!-- Element Plus handles horizontal scrolling automatically based on column widths -->
      <el-table
        :data="filteredInventoryList"
        v-loading="loading"
        border
        style="width: 100%"
        height="calc(100vh - 220px)"
      >
        <el-table-column prop="part_number" label="Part Number" width="150" />
        <el-table-column prop="part_name" label="Part Name" width="200" />
        <el-table-column prop="unit_price" label="Price" width="120" />
        <el-table-column
          prop="part_description"
          label="Description"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column prop="quantity" label="Qty" width="80" align="center" />
        <el-table-column prop="name" label="Store" width="150" />
        <el-table-column prop="bin_code" label="Bin Location" width="120" />
        <el-table-column label="Status" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.material_status === 'good' ? 'success' : 'danger'"
            >
              {{ scope.row.material_status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted,computed } from "vue";
import { ElMessage } from "element-plus";
import api from "../api/axios";

const inventoryList = ref([]);
const loading = ref(false);

const searchQuery=ref("")
const statusFilter=ref("")

const filteredInventoryList=computed(()=>{
  return inventoryList.value.filter((item)=>{
    const searchLower=searchQuery.value.toLowerCase()
    const matchesSearch=
    item.part_number.toLowerCase().includes(searchLower)||
    item.part_name.toLowerCase().includes(searchLower)
    
    const matchesStatus=statusFilter.value?item.material_status===statusFilter.value:true
    
    return matchesSearch && matchesStatus
  });
})


const fetchInventory = async () => {
  loading.value = true;
  try {
    const response = await api.get("/api/inventory");
    inventoryList.value = response.data;
    console.log(inventoryList.value)
  } catch (error) {
    ElMessage.error("Failed to load inventory data");
    console.error(error);
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  fetchInventory();
});
</script>

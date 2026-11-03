import { ref } from "vue";
import api from "../api/axios";

export function useTicketMaterials() {
  const consumedMaterials = ref([]);

  const fetchConsumedMaterials = async (ticketId) => {
    try {
      const response = await api.get(
        `/api/tickets/ticket/${ticketId}/consumed`);
        consumedMaterials.value=response.data 
    } catch (error) {
        console.error("Error fetching consumed materials:", error);
    }
    return {
        consumedMaterials,
        fetchConsumedMaterials
    }
  };
}

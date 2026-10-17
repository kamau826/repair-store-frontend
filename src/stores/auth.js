import {defineStore} from 'pinia'
import api from '../api/axios'

export const useAuthStore=defineStore('auth',{
    state:()=>({
        staff:null,
    }),
    getters:{
        isAuthenticated:(state)=>!!state.staff,
        fullName:(state)=>state.staff ?`${state.staff.first_name} ${state.staff.last_name}`:'staff'

    },
    actions:{
        async login(credentials){
            const response=await api.post('/api/users/login',credentials)
            //  console.log(response.data.staff.email);
            this.staff=response.data.staff
            // console.log('logged in staff',this.staff)
        },
        async fetchCurrentUser(){
            try {
                console.log("Attempting to fetch user on refresh...");
                const response=await api.get('/api/users/profile')
                this.staff=response.data.user
                console.log("Fetch successful! User is:", this.staff);
            } catch (error) {
                console.error(
                  "Fetch failed on refresh:",
                  error.response?.data || error.message,
                );
                this.staff=null
            }
        },
        async logout(){
            try {
                await api.post('api/users/logout')
            } finally{
                this.staff=null
            }
        }
    }
})
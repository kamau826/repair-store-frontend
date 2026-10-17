import axios from 'axios'

const api = axios.create({
  baseURL: "https://repair-store-backend.onrender.com",
  timeout:10000,
  withCredentials:true,
  headers:{
    'Content-Type':'application/json'
  }
});

export default api
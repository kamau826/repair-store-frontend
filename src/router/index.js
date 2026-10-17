import { createRouter,createWebHistory } from "vue-router";
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Register from "../views/Register.vue";
import Layout from "../components/Layout.vue";
import Facility from "../views/Facility.vue";
import ManageFacility from "../views/ManageFacility.vue";
import { useAuthStore } from "../stores/auth.js";
import Roles from "../views/Roles.vue";


const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: "/",

    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "", //route path
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "roles",
        name: "Roles",
        component: Roles,
      },
      {
        path: "facilities",
        name: "Facilities",
        component: Facility,
      },
      {
        path: "facilities/:id/manage",
        name: "ManageFacility",
        component:ManageFacility ,
      },
    ],
  },
];
const router=createRouter({
    history:createWebHistory(),
    routes
})
//flag to track the initial app load
let isAuthChecked=false
//guard
router.beforeEach(async(to,from,next)=>{
  const authStore=useAuthStore()
  //try fetching user from cookie first when app loads
 if(!isAuthChecked){
  await authStore.fetchCurrentUser()
  isAuthChecked=true
 }
  //route requires authentication but user not logged in
  if(to.meta.requiresAuth && !authStore.isAuthenticated){
    next({name:'Login'})
  }
  //Route for guests(login/register) but user already logged in
  else if (to.meta.requiresGuest && authStore.isAuthenticated){
    console.log('user authenticated',authStore.staff.first_name)
    next({name:'Dashboard'})
  }
  //proceed normally
  else{
    next()
  }
})



export default router
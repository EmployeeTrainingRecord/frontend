import { createRouter, createWebHistory } from "vue-router"
import login from "../components/page/login.vue"
import trainingLog from "../components/page/trainingLog.vue"
import logDetail from "../components/page/logDetail.vue"
import editLog from "../components/page/editLog.vue"
import addLog from "../components/page/addLog.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: login
    },    
    {
      path: "",
      name: "trainingLog",
      component: trainingLog
    },
    {
      path: "/log",
      name: "trainingLog",
      component: trainingLog
    },
    {
      path:"/",
      redirect:"/log"
    },
    {
      path: "/log/:logId",
      name: "logDetail",
      component: logDetail
    },
    {
      path: "/log/:logId/edit",
      name: "editLog",
      component: editLog
    },    
    {
      path: "/log/add",
      name: "addLog",
      component: addLog
    },

  ]
})

export default router

<script setup>
import { useRoute } from "vue-router"
import router from "../../router/index.js"
import { ref, onMounted } from "vue"
import changeTheme from "../component/changeTheme.vue"
const route = useRoute()
const username = ref("")
const password = ref("")
const errorResponse = ref("")
const is401 = ref("")
const login = async () => {
  if (username.value !== null && username.value.length !== 0) {
    if (password.value !== null && password.value.length !== 0) {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: `${username.value}`,
          password: `${password.value}`,
        }),
      }
      fetch(import.meta.env.VITE_BASE_URL + `/auth/login`, requestOptions)
        .then((response) => {
          console.log("fetching")
          if (response.status === 401 || response.status === 400) {
            is401.value = true
            console.log("Unauthorized: Invalid credentials")
          } else {
            return response.json()
          }
        })
        .then(async (Token) => {
          if (Token) {
            localStorage.setItem("token",Token.token)
            router.replace(`/log`)
          }
        })
    }
    else{
      errorResponse.value = "password can't empty"
    }
  } else {
    errorResponse.value = "username can't empty"
  }
}
</script>
<template>
    <changeTheme></changeTheme>
    <div class="flex justify-center flex-col">
  <h1 class="flex justify-center text-3xl text-primary p-7 ">login</h1>
  <h1 v-show="is401" class="flex justify-center text-red-700"> Invalid username or password </h1>
  <h1 v-show="errorResponse !== ''" class="flex justify-center text-red-700">{{ errorResponse }}</h1>
  <div class="flex justify-center flex-row gap-x-2">
      <h1>username : </h1>  
      <input class=" text-secondary py-2 px-8 border border-black" v-model="username"/>
  </div>
  <div class="flex justify-center flex-row p-2 gap-x-2 ">
      <h1>password : </h1>  
      <input type="password" class=" text-secondary py-2 px-8 border border-black" v-model="password"/>
  </div>
  <div class="flex justify-center">
    <button class="py-3 px-[70px] bg-blue-500 text-white rounded-xl" @click="login()">Sign in</button>
  </div>
  </div>
</template>
<style lang="css"></style>

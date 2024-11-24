<script setup>
import router from "../../router/index.js"
import { ref, onMounted, watch, computed } from "vue"
const user = ref("don't login")
const role = ref("")
const logs = ref([])
const searchInput = ref("")
const filterLogs = ref([])
const clickToHandbleLog = ref(false)
const clearInput = ref(true)
onMounted(async () => {
  let response
  if (
    localStorage.getItem("token") !== null &&
    localStorage.getItem("token").length > 0
  ) {
    const decodedToken = atob(localStorage.getItem("token").split(".")[1])
    const Jsondecode = JSON.parse(decodedToken)
    user.value = Jsondecode.name
    role.value = Jsondecode.role
    response = await fetch(import.meta.env.VITE_BASE_URL + `/log`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
  } else {
    response = await fetch(import.meta.env.VITE_BASE_URL + `/log`)
  }
  const data = await response.json()
  logs.value = data
})
function signOut() {
  localStorage.removeItem("token")
  window.location.reload()
}
function toLogDetail(logId) {
  if (
    localStorage.getItem("token") !== null &&
    localStorage.getItem("token").length > 0
  ) {
    router.replace({ name: "logDetail", params: { logId: logId } })
  } else {
    window.alert("you must login first")
    router.replace("/login")
  }
}
const selectedTheme = ref("dark")
const changeTheme = () => {
  document.documentElement.setAttribute("data-theme", selectedTheme.value)
}
const DeleteLog = async (id) => {
  if (
    localStorage.getItem("token") === null ||
    localStorage.getItem("token").length === 0
  ) {
    window.alert("you must login first")
    // router.replace("/login")
  } else {
    await fetch(`${import.meta.env.VITE_BASE_URL}/log/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
    location.reload()
  }
}
watch(searchInput, (input) => {
  if (!clickToHandbleLog.value) {
    search(input)
  } 
    clickToHandbleLog.value = false
})
const search = (input) => {
  filterLogs.value = logs.value.filter(
    (log) =>
      log.name.toLowerCase().includes(input.toLowerCase()) ||
      log.course.toLowerCase().includes(input.toLowerCase())
  )
}

function handbleLogs() {
  if (searchInput.value !== "") {
    searchInput.value = ""
    clickToHandbleLog.value = true
  } else {
    clickToHandbleLog.value = !clickToHandbleLog.value
  }
  filterLogs.value = logs.value.filter((log) =>
    log.name.toLowerCase().includes(user.value.toLowerCase())
  )
}

const displayLogs = computed(() => {
  if (searchInput.value !== "" || clickToHandbleLog.value) {
    clearInput.value = false
    return filterLogs.value
  }
  clearInput.value = true
  return logs.value
})
function editLogs(id){
  if(localStorage.getItem("token") === null ||localStorage.getItem("token").length === 0){
    window.alert("you must login first")
    return
  }
  router.replace({name: 'editLog',params: { logId: id },
})

}
</script>
<template>
  <div
    class="flex flex-row justify-between items-center p-4 bg-gray-800 text-white shadow-md rounded-t-md"
  >
    <div class="mb-4">
      <select
        class="px-3 py-2 rounded-xl border border-black text-primary"
        v-model="selectedTheme"
        @change="changeTheme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="cupcake">Cupcake</option>
        <option value="bumblebee">Bumblebee</option>
      </select>
    </div>
    <h1 class="text-3xl">Employee Training Record</h1>
    <div class="flex flex-row gap-x-4 items-center">
      <h1 v-if="user !== `don't login`" class="text-lg font-semibold">
        Welcome, {{ user }}
      </h1>
      <button
        v-if="user === `don't login`"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all"
        @click="router.replace('/login')"
      >
        Login
      </button>
      <button
        v-if="user !== `don't login`"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        @click="signOut()"
      >
        Sign Out
      </button>
    </div>
  </div>
  <div class="flex flex-row gap-x-3 w-full justify-end bg-gray-800 items-center pl-4 pr-4 pb-4 text-white shadow-md "
  >
      <button
        class="justify-end px-3 py-2 bg-orange-500 rounded-xl"
        @click="router.replace('/course')"
      >
      manage course
      </button>
      <input
        type="text"
        v-model="searchInput"
        class="justify-end w-[300px] p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
        placeholder="Search with name or course..."
      />
      <p v-if="role === ''"></p>
      <button
        class="justify-end px-3 py-2 bg-pink-500 rounded-xl"
        v-else-if="role !== '' && clearInput === false"
        @click="handbleLogs"
      >
      clear filter
      </button>
      <button
        class="px-3 py-2 bg-pink-500 rounded-xl"
        v-else-if="clearInput === true"
        @click="handbleLogs"
      >
      My Logs
    </button>
    </div>
  <div
    class="p-4 text-gray-300 rounded-b-md shadow-lg"
    :class="[
      'table-auto w-full border-collapse border text-sm',
      selectedTheme === 'light' && 'bg-white text-black',
      selectedTheme === 'dark' && 'bg-gray-900 text-gray-300',
      selectedTheme === 'cupcake' && 'bg-pink-100 text-pink-800',
      selectedTheme === 'bumblebee' && 'bg-yellow-100 text-yellow-800',
    ]"
  >
    <table
      class="table-auto border-collapse border border-gray-700 w-full text-sm"
      :class="[
        'table-auto w-full border-collapse border text-sm',
        selectedTheme === 'light' && 'bg-white text-black',
        selectedTheme === 'dark' && 'bg-gray-900 text-gray-300',
        selectedTheme === 'cupcake' && 'bg-pink-100 text-pink-800',
        selectedTheme === 'bumblebee' && 'bg-yellow-100 text-yellow-800',
      ]"
    >
      <thead>
        <tr
          class="bg-gray-700 text-white"
          :class="[
            selectedTheme === 'light' &&
              'bg-gray-50 hover:bg-gray-200 text-black',
            selectedTheme === 'dark' && 'bg-gray-800 hover:bg-gray-600',
            selectedTheme === 'cupcake' && 'bg-pink-300 hover:bg-pink-300',
            selectedTheme === 'bumblebee' &&
              'bg-yellow-200 hover:bg-yellow-400 text-black',
          ]"
        >
          <th class="px-4 py-2 border border-gray-700">Log ID</th>
          <th class="px-4 py-2 border border-gray-700">Name</th>
          <th class="px-4 py-2 border border-gray-700">Course</th>
          <th class="px-4 py-2 border border-gray-700">Total Hours</th>
          <th class="flex flex-row gap-x-3 justify-center">
            <p class="px-4 py-2">Options</p>
            <button
              @click="router.replace('/log/add')"
              class="bg-green-500 hover:bg-green-700 px-3 py-2 rounded-xl text-white"
            >
              add log
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          class="cursor-pointer transition-colors"
          v-for="log in displayLogs"
          @click="toLogDetail(log.logId)"
          :class="[
            'table-auto w-full border-collapse border text-sm',
            selectedTheme === 'light' &&
              'bg-white hover:bg-gray-200 text-black',
            selectedTheme === 'dark' &&
              'hover:bg-gray-800 bg-gray-900 text-gray-300',
            selectedTheme === 'cupcake' &&
              'bg-pink-100 hover:bg-pink-200 text-pink-800',
            selectedTheme === 'bumblebee' &&
              'bg-yellow-100 hover:bg-yellow-400 text-yellow-800',
          ]"
        >
          <td class="px-4 py-2 border border-gray-700 text-center">
            {{ log.logId }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-left">
            {{ log.name }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-left">
            {{ log.course }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-center">
            {{ log.totalHours }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-center">
            <div class="flex flex-row gap-x-4 justify-center" @click.stop>
              <button
                @click="DeleteLog(log.logId)"
                class="bg-red-500 hover:bg-red-700 px-3 py-2 rounded-xl text-white"
              >
                delete
              </button>
              <button
                @click="editLogs(log.logId)"
                class="bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded-xl text-white"
              >
                edit
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

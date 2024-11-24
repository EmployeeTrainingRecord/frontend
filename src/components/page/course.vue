<script setup>
import router from "../../router/index.js"
import { ref, onMounted, watch, computed } from "vue"
const user = ref("don't login")
const role = ref("")
const courses = ref([])
const courseId = ref("")
const courseName = ref("")
const courseCost = ref(0)
const courseTotalHours = ref(1)
const isEmpty = ref(false)
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
    console.log(Jsondecode.name)
  }
  response = await fetch(import.meta.env.VITE_BASE_URL + `/course`)
  const data = await response.json()
  courses.value = data
})
function signOut() {
  localStorage.removeItem("token")
  window.location.reload()
}
const selectedTheme = ref("dark")
const changeTheme = () => {
  document.documentElement.setAttribute("data-theme", selectedTheme.value)
}
const showModal = async (id,name,cost,hours, func) => {
  if (
    localStorage.getItem("token") === null ||
    localStorage.getItem("token").length === 0
  ) {
    window.alert("you must login first")
    router.replace("/log")
  }
  courseName.value = name
  courseId.value = id
  if (func === "delete") {
    deleteModal.showModal()
 } else if (func === "edit") {
    courseCost.value = cost
    courseTotalHours.value = hours
    editModal.showModal()
  } else if (func === "add") {
    courseCost.value = 0
    courseTotalHours.value = 1
    addModal.showModal()
  }
}
const deleteCourse = async (id) => {
  await fetch(`${import.meta.env.VITE_BASE_URL}/course/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  })
  location.reload()
}
const editCourse = async () =>{
  if(courseName.value === '' ||     courseCost.value === '' ||     courseTotalHours.value === ''){
    window.alert("some input is empty")
    return
  }
  console.log(courseId.value)
  const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + localStorage.getItem("token")
      },
      body: JSON.stringify(
        {          course :`${courseName.value}`,
    trainingCost : courseCost.value,
    totalHours : courseTotalHours.value
        }
      )
    }
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/course/${courseId.value}`,requestOptions)
  if (response.ok){
  location.reload()
  }else {
    window.alert("response not ok")
  }
}
const addCourse = async () =>{
  if(courseName.value === '' ||     courseCost.value === '' ||     courseTotalHours.value === ''){
    window.alert("some input is empty")
    return
  }
  console.log(courseId.value)
  const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + localStorage.getItem("token")
      },
      body: JSON.stringify(
        {
          course :`${courseName.value}`,
    trainingCost : courseCost.value,
    totalHours : courseTotalHours.value
        }
      )
    }
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/course`,requestOptions)
  if (response.ok){
  location.reload()
  }else {
    window.alert("response not ok")
  }
}
</script>
<template>
  <div
    class="flex flex-row justify-between items-center p-4 bg-gray-800 text-white shadow-md rounded-t-md"
  >
    <div class="mb-4 flex gap-x-3">
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
      <button @click="router.replace('/log')" class="bg-blue-500 hover:bg-blue-700 text-white btn">back</button>
    </div>
    <h1 class="text-3xl">Manage Course</h1>
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
        selectedTheme === 'bumblebee' && 'bg-yellow-200 text-yellow-800',
      ]"
    >
      <thead>
        <tr
          class="bg-gray-700 text-white"
          :class="[
            selectedTheme === 'light' &&
              'bg-gray-50 hover:bg-gray-500 text-black',
            selectedTheme === 'dark' && 'bg-gray-800 hover:bg-gray-600',
            selectedTheme === 'cupcake' && 'bg-pink-300 hover:bg-pink-300',
            selectedTheme === 'bumblebee' &&
              'bg-yellow-300 hover:bg-yellow-400 text-black',
          ]"
        >
          <th class="px-4 py-2 border border-gray-700">Course Id</th>
          <th class="px-4 py-2 border border-gray-700">Course Name</th>
          <th class="px-4 py-2 border border-gray-700">Cost</th>
          <th class="px-4 py-2 border border-gray-700">Total Hours</th>
          <th class="flex flex-row gap-x-3 justify-center">
            <p class="px-4 py-2">Options</p>
            <button
              @click="showModal('', '', '', '', 'add')"
              class="bg-green-500 hover:bg-green-700 px-3 py-2 rounded-xl text-white"
            >
              add Course
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          class="cursor-pointer transition-colors"
          v-for="course in courses"
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
            {{ course.id }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-left">
            {{ course.course }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-left">
            {{ course.cost }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-center">
            {{ course.totalHours }}
          </td>
          <td class="px-4 py-2 border border-gray-700 text-center">
            <div class="flex flex-row gap-x-4 justify-center" @click.stop>
              <button
                @click="
                  showModal(
                    course.id,
                    course.course,
                    course.cost,
                    course.totalHours,
                    'delete'
                  )
                "
                class="bg-red-500 hover:bg-red-700 px-3 py-2 rounded-xl text-white"
              >
                delete
              </button>
              <button
                @click="
                  showModal(
                    course.id,
                    course.course,
                    course.cost,
                    course.totalHours,
                    'edit'
                  )
                "
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
  <dialog id="editModal" class="modal">
    <div class="modal-box">
      <h3 class="p-1 text-3xl text-center text-orange-500 font-bold underline">
        Edit Course
      </h3>
      <p v-if="isEmpty" class=" text-red-600 ">some input is empty</p>
      <div class="flex flex-row p-2">
        <h3 class="p-1 w-[210px] text-xl text-center text-yellow-500 font-bold">
          Course name :
        </h3>
        <input
          class="pl-2 text-sm w-full rounded-xl border-none outline-none"
          v-model="courseName"
        />
      </div>
      <div class="flex flex-row p-2">
        <h3 class="p-1 w-[210px] text-xl text-center text-yellow-500 font-bold">
          Cost :
        </h3>
        <input
        type="number"
        min="0"
          class="pl-2 text-sm w-full rounded-xl border-none outline-none"
          v-model="courseCost"
        />
      </div>
      <div class="flex flex-row p-2">
        <h3 class="p-1 w-[210px] text-xl text-center text-yellow-500 font-bold">
          total hours :
        </h3>
        <input
        type="number"
        min="1"
          class="pl-2 text-sm w-full rounded-xl border-none outline-none"
          v-model="courseTotalHours"
        />
      </div>
      <div class="modal-action flex justify-center gap-x-3">
        <form method="dialog">
          <button
            class="bg-green-500 hover:bg-green-700 btn text-white"
            @click="editCourse()"
          >
            Confirm
          </button>
          <button class="bg-red-600 hover:bg-red-800 btn text-white">
            Cancel
          </button>
        </form>
      </div>
    </div>
  </dialog>
  <dialog id="addModal" class="modal">
    <div class="modal-box">
      <h3 class="p-1 text-3xl text-center text-orange-500 font-bold underline">
        Add Course
      </h3>
      <p v-if="isEmpty" class=" text-red-600 ">some input is empty</p>
      <div class="flex flex-row p-2">
        <h3 class="p-1 w-[210px] text-xl text-center text-yellow-500 font-bold">
          Course name :
        </h3>
        <input
          class="pl-2 text-sm w-full rounded-xl border-none outline-none"
          v-model="courseName"
        />
      </div>
      <div class="flex flex-row p-2">
        <h3 class="p-1 w-[210px] text-xl text-center text-yellow-500 font-bold">
          Cost :
        </h3>
        <input
        type="number"
        min="0"

          class="pl-2 text-sm w-full rounded-xl border-none outline-none"
          v-model="courseCost"
        />
      </div>
      <div class="flex flex-row p-2">
        <h3 class="p-1 w-[210px] text-xl text-center text-yellow-500 font-bold">
          total hours :
        </h3>
        <input
        type="number"
        min="1"
          class="pl-2 text-sm w-full rounded-xl border-none outline-none"
          v-model="courseTotalHours"
        />
      </div>
      <div class="modal-action flex justify-center gap-x-3">
        <form method="dialog">
          <button
            class="bg-green-500 hover:bg-green-700 btn text-white"
            @click="addCourse()"
          >
            Confirm
          </button>
          <button class="bg-red-600 hover:bg-red-800 btn text-white">
            Cancel
          </button>
        </form>
      </div>
    </div>
  </dialog>
  <dialog id="deleteModal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Delete Course</h3>
      <p class="py-4">
        Do you want to delete the Course name "{{ courseName }}"
      </p>
      <div class="modal-action flex justify-center gap-x-3">
        <form method="dialog">
          <button
            class="bg-green-500 hover:bg-green-700 btn text-white"
            @click="deleteCourse(courseId)"
          >
            Confirm
          </button>
          <button class="bg-red-600 hover:bg-red-800 btn text-white">
            Cancel
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

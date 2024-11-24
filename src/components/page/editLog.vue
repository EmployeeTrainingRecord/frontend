<script setup>
import { useRoute } from "vue-router"
import router from "../../router/index.js"
import { ref, onMounted, watch } from "vue"
import changeTheme from "../component/changeTheme.vue"
const username = ref("don't login")
const logs = ref([])
const fileType = ref("")
const base64ImageUrl = ref("")
let create
let update
const timeZone = ref("")
const reFormatCreate = ref()
const reFormatUpdate = ref()
const noFile = ref(false)
const employeeId = ref("")
const name = ref("")
const course = ref("")
const totalHours = ref(0)
const trainingCost = ref(0)
const file = ref()
const role = ref("")
const users = ref()
const courses = ref([])
watch([file], () => {
  noFile.value = !file.value || file.value === ""
})
onMounted(async () => {
  let response
  const route = useRoute()
  if (
    localStorage.getItem("token") !== null &&
    localStorage.getItem("token").length > 0
  ) {
    const decodedToken = atob(localStorage.getItem("token").split(".")[1])
    const Jsondecode = JSON.parse(decodedToken)
    username.value = Jsondecode.name
    role.value = Jsondecode.role
    console.log(Jsondecode.name)
    response = await fetch(
      import.meta.env.VITE_BASE_URL + `/log/${route.params.logId}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    )
    if (response.status === 403 || response.status === 401) {
      window.alert("You don't have permission.")
      router.replace("/log")
    } else if (response.status === 404) {
      window.alert("Log ID not found")
      router.replace("/log")
    }
  } else {
    window.alert("you must login first")
    // router.replace("/login")
  }
  const data = await response.json()
  if (role.value === "manager" || role.value === "admin") {
    const fetchUser = await fetch(import.meta.env.VITE_BASE_URL + `/users`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
    const userData = await fetchUser.json()
    users.value = userData
  }
  logs.value = data
  employeeId.value = logs.value.employeeId
  name.value = logs.value.name
  course.value = logs.value.course
  totalHours.value = logs.value.totalHours
  trainingCost.value = logs.value.trainingCost
  file.value = logs.value.data
  try {
    if (file.value === null || file.value === "") {
      noFile.value = true
    } else {
      const binaryString = atob(file.value)
      const byteArray = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i)
      }
      const magicNumber = byteArray
        .slice(0, 4)
        .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "")
      if (magicNumber.startsWith("ffd8")) {
        fileType.value = "image/jpeg"
      } else if (magicNumber.startsWith("89504e47")) {
        fileType.value = "image/png"
      } else if (magicNumber.startsWith("25504446")) {
        fileType.value = "application/pdf"
      } else {
        fileType.value = "unknown"
      }
      if (fileType.value === "image/png" || fileType.value === "image/jpeg") {
        base64ImageUrl.value = `data:${fileType.value};base64,${file.value}`
      }
    }
  } catch (error) {
    console.error("Error loading image:", error)
  }
  create = new Date(logs.value.recordedOn)
  update = new Date(logs.value.updatedOn)
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  timeZone.value = tz
  reFormatCreate.value = create.toLocaleString("en-GB", {
    timeZone: `${tz}`,
  })
  reFormatUpdate.value = update.toLocaleString("en-GB", {
    timeZone: `${tz}`,
  })
  if (role !== "employee") {
    watch(employeeId, (newOid) => {
      findNameById(newOid)
    })
  }
  const fetchCourse = await fetch(import.meta.env.VITE_BASE_URL + `/course`)
  const CourseData = await fetchCourse.json()
  courses.value = CourseData
  watch(course, (name) => {
    findCourseByName(name)
    })
})
function base64ToBlob(base64, fileType) {
  const byteCharacters = atob(base64)
  const byteArrays = []
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  return new Blob(byteArrays, { type: fileType })
}
function findNameById(oid) {
  const userFound = users.value.find((user) => user.oid === oid)
  if (userFound) {
    name.value = userFound.name
  } else {
    name.value = ""
  }
}
function findCourseByName(name) {
  const courseFound = courses.value.find((course) => course.course === name)
  if (courseFound) {
    console.log(courseFound)
    totalHours.value = courseFound.totalHours
    trainingCost.value =courseFound.cost
  } else {
    name.value = ""
  }
}

const editLog = async (id) => {
  const trainingLogDTO = {
    employeeId: `${employeeId.value}`,
    course: `${course.value}`,
    totalHours: `${totalHours.value}`,
    trainingCost: trainingCost.value,
  }
  const formData = new FormData()
  formData.append("trainingLogDTO", JSON.stringify(trainingLogDTO))
  if (!file.value || file.value === "") {
    const fileInput = document.querySelector("#file-input")
    if (fileInput && fileInput.files.length > 0) {
      formData.append("file", fileInput.files[0])
    } else {
      console.log("No file uploaded.")
    }
  } else {
    const fileBlob = base64ToBlob(file.value, fileType.value)
    const type = fileType.value.split("/")[1]
    formData.append("file", fileBlob, `evidence.${type}`)
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/log/${id}`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    router.replace("/log")
  } catch (error) {
    console.error("Error updating log:", error.message)
  }
};
</script>
<template>
  <changeTheme></changeTheme>
  <div class="flex flex-col justify-center">
    <div class="flex justify-center">
      <h1
        class="pb-1 border-b-black border-solid text-3xl text-yellow-500 font-bold underline"
      >
        log id : {{ logs.id }}
      </h1>
    </div>
    <div class="flex justify-center items-center min-h-screen">
      <div
        class="flex flex-row gap-4 w-[80%] p-5 border-4 rounded-lg shadow-lg"
      >
        <div class="flex flex-col w-1/2">
          <p
            class="p-1 text-xl text-center text-yellow-500 font-bold underline"
          >
            Evidence
          </p>
          <p
            class="p-1 text-xl text-center text-yellow-500 font-bold underline"
          >
          (Max file size = 50MB ,support file : pdf,jpg,png)
          </p>
          <div class="flex flex-row justify-between items-center">
            <p v-if="fileType" class="">File type detected: {{ fileType }}</p>
            <button
              v-show="file && file !== ''"
              class="text-red-700 font-bold underline"
              @click="
                file = '';
                fileType = '';
                noFile = true;
              "
            >
              Remove file [X]
            </button>
          </div>
          <p v-if="noFile" class="text-red-700 mt-2">
            You have not yet submitted the evidence
          </p>
          <div
            class="p-2 border-black border-solid border-[1px] min-h-[450px] max-h-[450px] rounded-md"
            style="word-break: break-word"
          >
            <img
              v-if="
                (fileType === 'image/png' || fileType === 'image/jpeg') &&
                file !== ''
              "
              :src="base64ImageUrl"
              alt="Decoded Image"
              class="w-full h-full object-cover"
            />
            <p v-else-if="fileType.length > 0"></p>
            <input
              v-else
              type="file"
              id="file-input"
              @change="handleFileUpload"
              class="w-full"
            />
            <p
              v-if="
                file && fileType !== 'image/png' && fileType !== 'image/jpeg'
              "
              class="text-xl text-red-500 font-bold underline"
            >
            this file is not image            </p>
          </div>
        </div>
        <div class="flex flex-col w-1/2">
          <div class="flex flex-col w-1/2">
            <h1
              v-show="role !== 'employee'"
              class="pb-2 text-xl text-yellow-500 font-bold underline"
            >
              Employee ID
            </h1>
            <div
              v-show="role !== 'employee'"
              class="flex w-[150px] border-black border-solid border-[1px] rounded-xl"
            >
              <select
                class="px-3 py-2 rounded-xl border border-black"
                v-model="employeeId"
              >
                <option v-for="user in users">{{ user.oid }}</option>
              </select>
            </div>
            <h1
              v-show="role !== 'employee'"
              class="pb-2 text-xl text-yellow-500 font-bold underline"
            >
              Name
            </h1>
            <div
              v-show="role !== 'employee'"
              class="flex w-[200px] h-[30px] border-black border-solid border-[1px] rounded-xl"
            >
              <p
                class="p1 text-sm w-full rounded-xl border-none outline-none"
              >
                {{ name }}
              </p>
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Course
            </h1>
            <div
              class="flex w-[150px] border-black border-solid border-[1px] rounded-xl"
            >
            <select
                class="px-3 py-2 rounded-xl border border-black"
                v-model="course"
              >
                <option v-for="c in courses">{{ c.course }}</option>
              </select>
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Total Hours
            </h1>
            <div
              class="flex w-[200px] h-[30px] border-black border-solid border-[1px] rounded-xl"
            >
              <input
              type="number"
              min="1"
                class="pl-2 text-sm w-full rounded-xl border-none outline-none"
                v-model="totalHours"
              />
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Training Cost
            </h1>
            <div
              class="flex w-[200px] h-[30px] border-black border-solid border-[1px] rounded-xl"
            >
              <input
              type="number"
              min="1"
                class="pl-2 text-sm w-full rounded-xl border-none outline-none"
                v-model="trainingCost"
              />
            </div>
          </div>
          <div class="mt-4 p-3 bg-gray-500 text-white rounded-lg">
            <h1 class="text-lg font-bold">TimeZone: {{ timeZone }}</h1>
            <h1 class="text-lg font-bold">Recorded On: {{ reFormatCreate }}</h1>
            <h1 class="text-lg font-bold">Updated On: {{ reFormatUpdate }}</h1>
          </div>
          <br />
          <div class="pt-10 flex justify-center">
            <button
              class="bg-blue-600 rounded-lg px-3 py-2 hover:bg-blue-800 text-white"
              @click="editLog(logs.id)"
            >
              edit
            </button>
            <button
              class="bg-red-600 rounded-lg px-3 py-2 hover:bg-red-800 text-white"
              @click="router.replace(`/log`)"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

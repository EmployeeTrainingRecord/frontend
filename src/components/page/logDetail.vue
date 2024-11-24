<script setup>
import { useRoute } from "vue-router"
import router from "../../router/index.js"
import { ref, onMounted } from "vue"
import changeTheme from "../component/changeTheme.vue"
const user = ref("don't login")
const logs = ref([])
const fileType = ref("")
const base64ImageUrl = ref("")
let create
let update
const timeZone = ref("")
const reFormatCreate = ref()
const reFormatUpdate = ref()
const noFile = ref(false)
const file = ref("")
onMounted(async () => {
  let response
  const route = useRoute()
  if (
    localStorage.getItem("token") !== null &&
    localStorage.getItem("token").length > 0
  ) {
    const decodedToken = atob(localStorage.getItem("token").split(".")[1])
    const Jsondecode = JSON.parse(decodedToken)
    user.value = Jsondecode.name
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
    }else if(response.status === 404){
      window.alert("Log ID not found")
      router.replace("/log")
    }
  } else {
    window.alert("you must login first")
    router.replace("/log")
  }
  const data = await response.json()
  logs.value = data
  file.value = logs.value.data
  try {
    if (logs.value.data === null || logs.value.data === "") {
      noFile.value = true
    } else {
      const binaryString = atob(logs.value.data)
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
        base64ImageUrl.value = `data:${fileType.value};base64,${logs.value.data}`
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
})

function downloadFile(base64Data, fileType, fileName) {
  const byteCharacters = atob(base64Data)
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
  const blob = new Blob(byteArrays, { type: fileType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

const handleDownload = () => {
  if (!file.value || !fileType.value) {
    console.error("No file available for download")
    return
  }
  const type = fileType.value.split("/")[1]
  const fileName = `evidence.${type}`
  downloadFile(file.value, fileType.value, fileName)
}
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
            Evidence (support file : pdf,jpg,png)
          </p>
          <p v-if="fileType">File type detected: {{ fileType }}</p>
          <p v-show="noFile" class="text-red-700">
            You have not yet submitted the evidence
          </p>
          <div
            class="p-2 border-black border-solid border-[1px] min-h-[450px] max-h-[450px] rounded-md"
            style="word-break: break-word"
          >
            <img
              v-if="fileType === 'image/png' || fileType === 'image/jpeg'"
              :src="base64ImageUrl"
              alt="Decoded Image"
              class="w-full h-full object-cover"
            />
            <p class="text-xl text-red-700-500 font-bold underline" v-else>
              this file is not image            </p>
          </div>
        </div>
        <div class="flex flex-col w-1/2">
          <div class="flex flex-col w-1/2">
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Employee ID
            </h1>
            <div
              class="flex p-2 border-black border-solid border-[1px] rounded-xl"
            >
              <p class="text-sm">{{ logs.employeeId }}</p>
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Name
            </h1>
            <div
              class="flex p-2 border-black border-solid border-[1px] rounded-xl"
            >
              <p class="text-sm">{{ logs.name }}</p>
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Course
            </h1>
            <div
              class="flex p-2 border-black border-solid border-[1px] rounded-xl"
            >
              <p class="text-sm">{{ logs.course }}</p>
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Total Hours
            </h1>
            <div
              class="flex p-2 border-black border-solid border-[1px] rounded-xl"
            >
              <p class="text-sm">{{ logs.totalHours }}</p>
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Total Hours
            </h1>
            <div
              class="flex p-2 border-black border-solid border-[1px] rounded-xl"
            >
              <p class="text-sm">{{ logs.trainingCost }}</p>
            </div>
          </div>
          <div class="mt-4 p-3 bg-gray-500 text-white rounded-lg">
            <h1 class="text-lg font-bold">TimeZone: {{ timeZone }}</h1>
            <h1 class="text-lg font-bold">Recorded On: {{ reFormatCreate }}</h1>
            <h1 class="text-lg font-bold">Updated On: {{ reFormatUpdate }}</h1>
          </div>
          <br />
          <div class="pt-10 flex justify-center gap-x-5">
            <button
              @click="handleDownload"
              class="bg-green-500 hover:bg-green-700 px-3 py-2 rounded-xl text-white"
            >
              download file
            </button>
            <button
              @click="
                router.replace({
                  name: 'editLog',
                  params: { logId: logs.logId },
                })
              "
              class="bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded-xl text-white"
            >
              edit
            </button>
            <button
              class="bg-red-600 rounded-lg px-3 py-2 hover:bg-red-800 text-white"
              @click="router.replace(`/log`)"
            >
              back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

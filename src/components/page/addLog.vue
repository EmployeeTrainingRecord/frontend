<script setup>
import router from "../../router/index.js"
import { ref, onMounted, watch } from "vue"
import changeTheme from "../component/changeTheme.vue"
const username = ref("don't login")
const logs = ref([])
const fileType = ref("")
const base64ImageUrl = ref("")
const noFile = ref(false)
const employeeId = ref("")
const name = ref("")
const course = ref("")
const totalHours = ref()
const trainingCost = ref(0)
const file = ref()
const role = ref("")
const users = ref()
watch([file], () => {
  noFile.value = !file.value || file.value === ""
})
onMounted(async () => {
  if (
    localStorage.getItem("token") !== null &&
    localStorage.getItem("token").length > 0
  ) {
    const decodedToken = atob(localStorage.getItem("token").split(".")[1])
    const Jsondecode = JSON.parse(decodedToken)
    username.value = Jsondecode.name
    role.value = Jsondecode.role
    console.log(Jsondecode.name)
  } else {
    window.alert("you must login first")
    router.replace("/login")
  }
  if (role.value === "manager" || role.value === "admin") {
    const fetchUser = await fetch(import.meta.env.VITE_BASE_URL + `/users`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
    const userData = await fetchUser.json()
    users.value = userData
    console.log(userData)
  }
      noFile.value = true
});

function base64ToBlob(base64, fileType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: fileType });
}

watch(employeeId, (newOid) => {
  console.log(`Selected Employee ID: ${newOid}`);
  findNameById(newOid);
});

function findNameById(oid) {
  const userFound = users.value.find((user) => user.oid === oid);
  if (userFound) {
    name.value = userFound.name;
  } else {
    name.value = ""
  }
}
const editLog = async (id) => {
  console.log("file.value : " + file.value);
  const trainingLogDTO = {
    employeeId: `${employeeId.value}`,
    course: `${course.value}`,
    totalHours: `${totalHours.value}`,
    trainingCost: trainingCost.value,
  };
  const formData = new FormData();
  formData.append("trainingLogDTO", JSON.stringify(trainingLogDTO));
  if (!file.value || file.value === "") {
    const fileInput = document.querySelector("#file-input");
    if (fileInput && fileInput.files.length > 0) {
      formData.append("file", fileInput.files[0]);
    } else {
      console.log("No file uploaded.");
    }
  } else {
    const fileBlob = base64ToBlob(file.value, fileType.value);
    const type = fileType.value.split("/")[1];
    formData.append("file", fileBlob, `evidence.${type}`);
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/log`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Log added successfully:", result);
    router.replace("/log");
  } catch (error) {
    console.error("Error updating log:", error.message);
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
      Add New Log
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
              Unsupported file type.
            </p>
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
                class="pl-2 text-sm w-full rounded-xl border-none outline-none"
              >{{  name  }}</p>
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Course
            </h1>
            <div
              class="flex w-[200px] h-[30px] border-black border-solid border-[1px] rounded-xl"
            >
              <input
                class="pl-2 text-sm w-full rounded-xl border-none outline-none"
                v-model="course"
              />
            </div>
            <h1 class="pb-2 text-xl text-yellow-500 font-bold underline">
              Total Hours
            </h1>
            <div
              class="flex w-[200px] h-[30px] border-black border-solid border-[1px] rounded-xl"
            >
              <input 
              type="number"
      min="0"

                class="pl-2 text-sm w-full rounded-xl border-none outline-none"
                v-model.number="totalHours"
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
      min="0"
                class="pl-2 text-sm w-full rounded-xl border-none outline-none"
                v-model.number="trainingCost"
              />
            </div>
          </div>
          <br />
          <div class="pt-10 flex justify-center">
            <button
              class="bg-blue-600 rounded-lg px-3 py-2 hover:bg-blue-800 text-white"
              @click="editLog(logs.id)"
            >
              add
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

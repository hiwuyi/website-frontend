<template>
  <section class="profile_body" v-loading="loading" :element-loading-text="loadingText">
    <div class="list">
      <div class="title">
        Account Settings
      </div>
    </div>

    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" v-loading="listLoad" class="demo-ruleForm list_body_spaces" status-icon>
      <el-form-item prop="name">
        <label class="label" for="dataname">
          Username
        </label>
        <div class="flex flex-row">
          <el-input v-model="ruleForm.name" placeholder="Username" />
        </div>
      </el-form-item>
      <el-form-item prop="email">
        <label class="label" for="dataname">
          Primary email
        </label>
        <div class="flex flex-row">
          <el-input v-model="ruleForm.email" placeholder="Primary email" />
          <small>We will use this email to communicate with you. This is also the email to use to authenticate on hf.co.</small>
        </div>
      </el-form-item>
      <el-form-item prop="avatar">
        <label class="label">
          Password
        </label>
        <div class="flex flex-row">
          <el-input v-model="ruleForm.password" type="password" readonly placeholder="Password" />

          <div class="avatar-uploader">
            <el-button class="avatar-uploader-icon" type="" text bg>Save changes</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item prop="additional">
        <label class="label label_title">
          Additional emails
        </label>
        <div class="lable_desc">Link additional emails to your account to join your organizations easily and identify git commits you make.</div>
        <div class="flex flex-row">
          <div class="avatar-uploader">
            <el-button class="avatar-uploader-icon" type="" text bg>Add an email</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item prop="additional">
        <label class="label label_title">
          Additional emails
        </label>
        <div class="lable_desc">Link additional emails to your account to join your organizations easily and identify git commits you make.</div>
        <div class="flex flex-row">
          <div class="avatar-uploader">
            <el-button class="avatar-uploader-icon" type="" text bg @click="deleteVisible=true">Delete my account</el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <el-dialog v-model="deleteVisible" title="Delete this organization" :show-close="false" custom-class="delete_body">
      <div class="tip">
        Deleting this oraanization will delete all its repositories (models, datasets, and Spaces). This orqanization name will be instantly available for other users. You will be immediately billed for any usageof paid services (such as AutoTrain)
        for the current month.
      </div>
      <el-form ref="ruleFormRefDelete" status-icon>
        <el-form-item prop="agreeDoi" style="width:100%">
          <label class="label" for="dataname">
            Enter organization name
          </label>
          <div class="flex flex-row">
            <el-input v-model="ruleForm.organization_name" placeholder=" " />
          </div>
        </el-form-item>
        <el-form-item prop="agreeDoi" style="width:100%">
          <label class="label" for="dataname">
            Type "delete organization"
          </label>
          <div class="flex flex-row">
            <el-input v-model="ruleForm.organization_type" placeholder=" " />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="ruleForm.organization_name && ruleForm.organization_type !== 'delete organization'" @click="deleteVisible = false">
            Delete organization
          </el-button>
          <el-button @click="deleteVisible = false">Cancel</el-button>
        </span>
      </template>
    </el-dialog>
  </section>
</template>
<script>
const ethereum = window.ethereum;
import { defineComponent, computed, onMounted, onActivated, onDeactivated, watch, ref, reactive, getCurrentInstance } from 'vue'
import { useStore } from "vuex"
import { useRouter, useRoute } from 'vue-router'
import moment from 'moment'
import {
  Plus
} from '@element-plus/icons-vue'
export default defineComponent({
  name: 'Personal Center',
  components: {
    Plus
  },
  setup () {
    const store = useStore()
    const metaAddress = computed(() => (store.state.metaAddress))
    const accessAvatar = computed(() => (store.state.accessAvatar))
    const accessName = computed(() => (store.state.accessName))
    const navLogin = computed(() => { return String(store.state.navLogin) === 'true' })
    const lagLogin = computed(() => { return String(store.state.lagLogin) === 'true' })
    const searchValue = ref('')
    const value = ref('')
    const info = reactive({
      address: '',
      balance: ''
    })
    const profileName = ref('-')
    const ruleForm = reactive({
      name: store.state.accessName,
      email: '',
      password: '111',
      avatar: '',
      homepage: '',
      github: '',
      twitter: '',
      organization_name: '',
      organization_type: ''
    })
    const fileList = ref([])
    const validateInput = (rule, value, callback) => {
      if (!value) callback()
      if (!isURL(value)) {
        callback(new Error("Please enter the web address"));
      } else {
        callback();
      }
    }
    const rules = reactive({
      name: [
        { required: true, message: 'Please fill in this field', trigger: 'blur' }
      ],
      homepage: [
        { validator: validateInput, trigger: "blur" }
      ]
    })
    const ruleFormRef = ref(null)
    const small = ref(false)
    const background = ref(false)
    const logoUrl = require("@/assets/images/icons/logo_w.png")
    const peopleUrl = require("@/assets/images/dashboard/people_default.png")
    const loading = ref(true)
    const loadingText = ref('')
    const prevType = ref(true)
    const listLoad = ref(false)
    const deleteVisible = ref(false)
    const system = getCurrentInstance().appContext.config.globalProperties
    const route = useRoute()
    const router = useRouter()

    function isURL (str_url) {
      // var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
      //   + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@
      //   + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
      //   + "|" // 允许IP和DOMAIN（域名）
      //   + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
      //   + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
      //   + "[a-z]{2,6})" // first level domain- .com or .museum
      //   + "(:[0-9]{1,4})?" // 端口- :80
      //   + "((/?)|" // a slash isn't required if there is no file name
      //   + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
      // var re = new RegExp(strRegex);
      var re = new RegExp('^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i');
      return re.test(str_url);
    }
    function momentFilter (dateItem) {
      return system.$commonFun.momentFun(dateItem)
    }
    function detailFun (row, index) {
      // console.log(row, index)
      router.push({ name: 'datasetDetail', params: { name: row.name, tabs: 'card' } })
    }
    function removeAvatar () {
      fileList.value = []
      ruleForm.avatar = ''
    }
    function handleChange (uploadFile, uploadFiles) {
      console.log(uploadFile, uploadFiles)
      fileList.value = []
      if (uploadFile) fileList.value.push(uploadFile)
      // console.log(fileList.value)
    }
    function handleRemove (file, uploadFiles) {
      // console.log(file, uploadFiles)
      fileList.value = []
    }
    async function editAvatar () {
      let fd = new FormData()
      fileList.value.forEach(file => {
        let fileNew = new File([file.raw], `${new Date().getTime() + file.name}`)
        fd.append('file', fileNew, `${new Date().getTime() + file.name}`)
        console.log('file', fileNew)
      })
      const uploadRes = await system.$commonFun.sendRequest(`${process.env.VUE_APP_BASEAPI}datasets/profile/files`, 'post', fd)
      await system.$commonFun.timeout(500)
      if (uploadRes && uploadRes.status === "success") {
        if (uploadRes.data.files) return uploadRes.data.files[0].url
      }
      return ruleForm.avatar
    }
    function reset () {
      profileName.value = '-'
      ruleForm.name = ''
      ruleForm.avatar = ''
      ruleForm.homepage = ''
      ruleForm.github = ''
      ruleForm.twitter = ''
      fileList.value = []
    }
    onMounted(() => {
      loading.value = false
    })
    onActivated(() => {
      reset()
    })
    return {
      metaAddress,
      accessAvatar,
      accessName,
      navLogin, lagLogin, searchValue, value,
      info,
      ruleForm,
      ruleFormRef,
      rules,
      small,
      background,
      logoUrl,
      peopleUrl,
      system,
      loading,
      loadingText,
      profileName,
      prevType,
      listLoad,
      fileList,
      deleteVisible,
      momentFilter, detailFun, editAvatar,
      handleChange, handleRemove, removeAvatar
    }
  }
})
</script>

<style lang="scss" scoped>
.profile_body {
  max-width: 850px;
  padding: 0 0 0.2rem;
  .label {
    font-size: 0.16rem;
    @media screen and (max-width: 441px) {
      font-size: 14px;
    }
    &.label_title {
      color: #000 !important;
    }
  }
  .lable_desc {
    display: block;
    width: 100%;
    max-width: 500px;
    font-size: 0.16rem;
    color: #606060;
    line-height: 1.5;
    @media screen and (max-width: 441px) {
      font-size: 14px;
    }
  }
  .avatar-uploader {
    margin-top: 0.15rem;
  }

  :deep(.delete_body) {
    width: 40%;
    max-width: 770px;
    min-width: 310px;
    border-radius: 0.13rem;
    text-align: left;
    @media screen and (max-width: 768px) {
      width: 60%;
    }
    @media screen and (max-width: 441px) {
      width: 90%;
    }
    .el-dialog__header {
      padding: 0.17rem 0.25rem 0.1rem;
      font-size: 17px;
      color: #000;
      @media screen and (max-width: 768px) {
        font-size: 15px;
      }
      @media screen and (min-width: 1800px) {
        font-size: 18px;
      }
    }
    .el-dialog__body {
      padding: 0;
      .tip,
      .tip_black {
        padding: 0.1rem 0.25rem;
        background-color: #f3f1ff;
        color: #562683;
        font-size: 15px;
        word-break: break-word;
        line-height: 1.3;
        @media screen and (max-width: 768px) {
          font-size: 14px;
        }
        @media screen and (min-width: 1800px) {
          font-size: 17px;
        }
      }
      .tip_black {
        background-color: transparent;
        color: #000;
        a {
          text-decoration: underline;
        }
      }
      .el-form {
        padding: 0.15rem 0.25rem 0;
        .el-form-item {
          .el-form-item__content {
            .label {
              color: #000;
              font-size: 15px;
              @media screen and (max-width: 768px) {
                font-size: 14px;
              }
              @media screen and (min-width: 1800px) {
                font-size: 17px;
              }
            }
            .flex-row {
              width: 100%;
            }
            .el-input {
              .el-input__inner {
                // background: linear-gradient(180deg, #fefefe, #f0f0f0);
              }
            }
          }
        }
      }
    }
    .el-dialog__footer {
      padding: 0 0.25rem 0.25rem;
      text-align: left;
      .el-button {
        width: auto;
        height: auto;
        padding: 0.07rem 0.15rem;
        margin: 0 0.15rem 0 0;
        background: linear-gradient(180deg, #fefefe, #f0f0f0);
        font-family: inherit;
        font-size: 16px;
        line-height: 1;
        color: #000;
        border-radius: 0.07rem;
        @media screen and (max-width: 1600px) {
          font-size: 14px;
        }
        &:hover {
          opacity: 0.9;
          span {
            cursor: pointer;
          }
        }
        &.is-disabled {
          opacity: 0.5;
          border-color: #e3e6eb;
        }
      }
    }
  }
}
</style>


<i18n>
{
  "en": {},
  "zh": {}
}
</i18n>

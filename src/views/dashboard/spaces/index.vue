<template>
  <section id="space">
    <el-row class="space_body">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="space_area">
        <div class="top">
          <div class="top_text">
            <h2>Spaces</h2>
            <p>Discover amazing ML apps made by the community!</p>
          </div>
          <div class="top_button">
            <router-link :to="{path: '/create_space'}" class="button">Create new Space</router-link>
            or
            <router-link to="">learn more about Spaces</router-link>
          </div>
        </div>
        <div class="top">
          <div class="top_input">
            <div>
              <el-input v-model="searchValue" clearable @input="searchChange()" class="search_name w-50 m-2" placeholder="search Space" />
            </div>
            <div class="top_input_search">
              <el-select v-model="optionsValue" @change="sortChange" class="m-2" placeholder="Sort: Alphabetical">
                <template #prefix>
                  <i class="el-icon-select"></i>
                </template>
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-button @click="clearMethod('clear')">Clear</el-button>
            </div>
          </div>
        </div>
        <div class="week" v-if="pagin.pageNo<=1 && optionsValue === 'updated' && !searchValue">
          <div class="top">
            <div class="title">
              Spaces of the week
              <i class="icon icon_week"></i>
            </div>
          </div>

          <el-row :gutter="32" class="list_body" v-loading="listLoad">
            <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8" v-for="ls in spaceLikesData" :key="ls">
              <el-card class="box-card" @click="detailFun(ls, l)">
                <template #header>
                  <div class="card-header">
                    <span class="left">{{ls.status}}</span>
                    <span class="right">{{ls.likes}}</span>
                    <span class="bottom" v-if="ls.activeOrder && ls.activeOrder.config">{{ls.activeOrder.config.description}}</span>
                  </div>
                  <h1>{{ls.name}}</h1>
                  <!-- <div class="card-owner">
                    <span>Owner: {{ls.wallet_address}}</span>
                  </div> -->
                </template>
                <div class="text">
                  <div class="text_left">
                    <!-- <img :src="accessAvatar||''" alt="" class="icon_img"> -->
                    <i class="icon"></i>
                    <span class="small" @click.stop="searchChange(ls)">{{ls.full_name || hiddAddress(ls.wallet_address)}}</span>
                  </div>
                  <span>{{momentFilter(ls.created_at)}}</span>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <div class="top">
            <div class="title title_all">
              All running spaces, recently uploaded first
            </div>
          </div>
        </div>
        <el-row :gutter="32" class="list_body" v-loading="listLoad">
          <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8" v-for="list in spaceData" :key="list">
            <el-card class="box-card" @click="detailFun(list, l)">
              <template #header>
                <div class="card-header">
                  <span class="left">{{list.status}}</span>
                  <span class="right">{{list.likes}}</span>
                  <span class="bottom" v-if="list.activeOrder && list.activeOrder.config">{{list.activeOrder.config.description}}</span>
                </div>
                <h1>{{list.name}}</h1>
                <!-- <div class="card-owner">
                  <span>Owner: {{list.wallet_address}}</span>
                </div> -->
              </template>
              <div class="text">
                <div class="text_left">
                  <!-- <img :src="accessAvatar||''" alt="" class="icon_img"> -->
                  <i class="icon"></i>
                  <span class="small" @click.stop="searchChange(list)">{{list.full_name || hiddAddress(list.wallet_address)}}</span>
                </div>
                <span>{{momentFilter(list.created_at)}}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-pagination hide-on-single-page :page-size="pagin.pageSize" :current-page="pagin.pageNo" :pager-count="5" :small="small" :background="background" layout="total, prev, pager, next" :total="pagin.total" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        />
      </el-col>
    </el-row>
  </section>
</template>
<script>
import { defineComponent, computed, onMounted, onActivated, onDeactivated, watch, ref, reactive, getCurrentInstance } from 'vue'
import { useStore } from "vuex"
import { useRouter, useRoute } from 'vue-router'
import qs from 'qs'
export default defineComponent({
  name: 'Spaces',
  components: {},
  setup () {
    const store = useStore()
    const lagLogin = computed(() => { return String(store.state.lagLogin) === 'true' })
    const accessAvatar = computed(() => (store.state.accessAvatar))
    const accessName = computed(() => (store.state.accessName))
    const searchValue = ref('')
    const optionsValue = ref('updated')
    const small = ref(false)
    const background = ref(false)
    const bodyWidth = ref(document.body.clientWidth < 992)
    const listLoad = ref(true)
    const spaceData = ref([])
    const spaceDataAll = ref([])
    const spaceLikesData = ref([])
    const options = ref([
      // {
      //   value: 'downloads',
      //   label: 'Most Downloads',
      // },
      {
        value: 'alphabetical',
        label: 'Alphabetical',
      },
      {
        value: 'updated',
        label: 'Recently Updated',
      },
      {
        value: 'likes',
        label: 'Most Likes',
      }
    ])
    const pagin = reactive({
      pageSize: 12,
      pageNo: 1,
      total: 0,
      sort: 'updated'
    })
    const system = getCurrentInstance().appContext.config.globalProperties
    const route = useRoute()
    const router = useRouter()

    function handleSizeChange (val) { }
    async function handleCurrentChange (currentPage) {
      // console.log('handleCurrentChange:', currentPage)
      pagin.pageNo = currentPage
      init()
    }
    async function searchChange (val) {
      // spaceData.value = await filterData(spaceDataAll.value, val)
      pagin.pageNo = 1
      const name = val ? val.wallet_address : ''
      init(name)
    }
    function clearMethod (type) {
      searchValue.value = ''
      pagin.pageNo = 1
      pagin.total = 0
      pagin.sort = 'updated'
      optionsValue.value = 'updated'
      if (type) init('', 1)
    }
    function filterData (spaceData, val) {
      if (val === '') return spaceDataAll.value
      let data = []
      spaceData.forEach(list => {
        if (list.name.indexOf(val) > -1) data.push(list)
      })
      return data
    }
    function NumFormat (value) {
      if (String(value) === '0') return '0'
      else if (!value) return '-'
      var intPartArr = String(value).split('.')
      var intPartFormat = intPartArr[0]
        .toString()
        .replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
      return intPartArr[1] ? `${intPartFormat}.${intPartArr[1]}` : intPartFormat
    }
    function sortChange (val) {
      pagin.sort = val
      pagin.pageNo = 1
      init()
    }
    async function init (name, typeLikes) {
      listLoad.value = true
      spaceData.value = []
      const page = pagin.pageNo > 0 ? pagin.pageNo - 1 : 0
      const params = {
        limit: pagin.pageSize,
        offset: page * pagin.pageSize,
        sort: pagin.sort, // alphabetical， updated
        name: searchValue.value,
        public_address: name || ''
      }

      if (typeLikes) {
        const likesRes = await system.$commonFun.sendRequest(`${process.env.VUE_APP_BASEAPI}spaces?${qs.stringify({ sort: 'likes', limit: 3 })}`, 'get')
        if (likesRes) spaceLikesData.value = likesRes.spaces || []
      }
      const listRes = await system.$commonFun.sendRequest(`${process.env.VUE_APP_BASEAPI}spaces?${qs.stringify(params)}`, 'get')
      if (listRes) {
        spaceData.value = listRes.spaces || []
        spaceDataAll.value = listRes.spaces || []
        pagin.total = listRes.total || 0
        if (listRes.message) system.$commonFun.messageTip('info', listRes.message)
      }
      await system.$commonFun.timeout(500)
      listLoad.value = false
    }
    function detailFun (row, index) {
      // console.log(row, index)
      router.push({ name: 'spaceDetail', params: { wallet_address: row.wallet_address, name: row.name, tabs: 'card' } })
    }
    function momentFilter (dateItem) {
      return system.$commonFun.momentFun(dateItem)
    }
    function hiddAddress (val) {
      if (val) return `${val.substring(0, 5)}...${val.substring(val.length - 5)}`
      else return '-'
    }
    onActivated(() => {
      window.scrollTo(0, 0)
      init('', 1)
    })
    onDeactivated(() => {
      clearMethod()
    })
    watch(lagLogin, (newValue, oldValue) => {
      if (!lagLogin.value) init('', 1)
    })
    return {
      accessAvatar,
      accessName,
      searchValue,
      optionsValue,
      options,
      small,
      background,
      listLoad,
      spaceData,
      spaceDataAll,
      spaceLikesData,
      pagin,
      system,
      route,
      router,
      handleSizeChange, handleCurrentChange, searchChange, detailFun, momentFilter, hiddAddress,
      sortChange, clearMethod
    }
  }
})
</script>

<style lang="scss" scoped>
#space {
  color: #333;
  font-size: 18px;
  @media screen and (max-width: 1200px) {
    font-size: 16px;
  }
  :deep(.space_body) {
    display: flex;
    align-items: stretch;
    padding: 0 0.16rem;
    margin: auto;
    font-size: 14px;
    overflow: hidden;
    @media screen and (min-width: 1280px) {
      max-width: 1280px;
    }
    @media screen and (min-width: 1536px) {
      max-width: 1536px;
    }
    .space_area {
      position: relative;
      padding: 0.74rem 0 0.45rem;
      @media screen and (max-width: 768px) {
        padding: 0.45rem 0;
      }
      .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        color: #9ca3b1;
        font-size: 0.19rem;
        .top_text {
          h2 {
            display: block;
            padding: 0 0 0 0.8rem;
            background: url(../../../assets/images/icons/icon_15.png) no-repeat
              left center;
            background-size: auto 100%;
            font-family: "Helvetica-Bold";
            font-size: 0.44rem;
            color: #000;
            text-align: left;
            @media screen and (max-width: 441px) {
              padding: 0 0 0 0.65rem;
              font-size: 0.34rem;
            }
          }
          p {
            margin: 0.15rem 0;
            font-size: 0.16rem;
            color: #9ca3b1;
            line-height: 1;
          }
        }
        .top_button {
          font-size: 14px;
          line-height: 1;
          color: #9ca3b1;
          @media screen and (min-width: 1800px) {
            font-size: 15px;
          }
          @media screen and (max-width: 600px) {
            display: flex;
            align-items: center;
            width: 100%;
            margin: 0.1rem 0;
          }
          a {
            margin: 0 0.07rem;
            text-decoration: underline;
            color: inherit;
            &:hover {
              opacity: 0.7;
            }
          }
          .button {
            padding: 0.1rem 0.3rem;
            margin: 0 0.1rem 0 0;
            background-color: #f5f6f8;
            color: #000;
            border: 1px solid #e5e5e6;
            border-radius: 0.09rem;
            text-decoration: none;
          }
        }
        .top_input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin: 0.65rem 0 0.32rem;
          @media screen and (max-width: 768px) {
            margin: 0.32rem 0;
          }
          .search_name {
            max-width: 3.4rem;
            margin: 0;
            .el-input__inner {
              padding-left: 0.35rem;
              background: url(../../../assets/images/icons/icon_13_1.png)
                no-repeat 0.1rem center;
              background-size: 17px;
              border-radius: 0.1rem;
              border-color: #cfcfcf;
              @media screen and (min-width: 1800px) {
                font-size: 15px;
              }
            }
            .el-input__prefix {
              padding: 0;
              .el-icon {
                svg {
                  width: 0.22rem;
                  height: 0.22rem;
                  color: #9ea5b3;
                }
              }
            }
          }
          .top_input_search {
            .el-button {
              padding: 0.1rem 0.3rem;
              margin: 0 0 0 0.1rem;
              color: #000;
              background: linear-gradient(180deg, #fefefe, #f0f0f0);
              border-color: #e1e1e1;
              border-radius: 0.09rem;
              text-decoration: none;
              span {
                cursor: inherit;
              }
              &:hover {
                background: linear-gradient(180deg, #f0f0f0, #f0f0f0);
              }
            }
          }
        }
        .el-select {
          // float: right;
          .el-input {
            cursor: pointer;
            .el-input__inner {
              width: 195px;
              padding: 0 12px 0 40px !important;
              background: linear-gradient(180deg, #fefefe, #f0f0f0);
              border-color: #e1e1e1;
              font-size: 14px;
              line-height: 1;
              border-radius: 0.09rem;
              @media screen and (min-width: 1800px) {
                font-size: 15px;
              }
            }
            .el-input__prefix {
              color: #9ca3b1;
              .el-icon-select {
                width: 21px;
                height: 21px;
                background: url(../../../assets/images/icons/icon_12.png)
                  no-repeat left center;
                background-size: 100%;
              }
            }
            .el-input__suffix {
              display: none;
            }
            ::-webkit-input-placeholder {
              color: #9ca3b1;
            } /* 使用webkit内核的浏览器 */
            :-moz-placeholder {
              color: #9ca3b1;
            } /* Firefox版本4-18 */
            ::-moz-placeholder {
              color: #9ca3b1;
            } /* Firefox版本19+ */
            :-ms-input-placeholder {
              color: #9ca3b1;
            }
          }
        }
        .title {
          float: left;
          display: flex;
          align-items: center;
          padding: 0.07rem 0 0.07rem 0.35rem;
          background-color: #7405ff;
          font-size: 0.16rem;
          color: #fff;
          border-radius: 0.1rem;
          line-height: 1.4;
          @media screen and (max-width: 768px) {
            font-size: 14px;
          }
          .icon_week {
            width: 0.25rem;
            height: 0.25rem;
            margin: 0 0.14rem;
            background: url(../../../assets/images/icons/icon_14.png) no-repeat
              center;
            background-size: 100%;
          }
          &.title_all {
            padding: 0.07rem 0.35rem;
          }
        }
      }
      .list_body {
        padding: 0.16rem 0 0.5rem;
        .el-col {
          margin: 0.16rem 0;
          .box-card {
            background-color: #fff;
            box-shadow: none;
            border: 0;
            border-radius: 0;
            .el-card__header {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 1.85rem;
              padding: 0;
              border: 0;
              border-radius: 0.1rem;
              font-size: 0.305rem;
              color: #fff;
              cursor: pointer;
              .card-header {
                span {
                  position: absolute;
                  height: 0.25rem;
                  font-size: 14px;
                  color: #fff;
                  line-height: 0.25rem;
                  @media screen and (min-width: 1800px) {
                    font-size: 15px;
                  }
                  &.left {
                    left: 0.15rem;
                    top: 0.1rem;
                    font-family: "Helvetica-Bold";
                    opacity: 0.9;
                  }
                  &.right {
                    right: 0.15rem;
                    top: 0.1rem;
                    display: flex;
                    align-items: center;
                    padding-left: 0.25rem;
                    background: url(../../../assets/images/icons/icon_9_1.png)
                      no-repeat left 0px;
                    background-size: 0.18rem;
                  }
                  &.bottom {
                    left: 0.15rem;
                    bottom: 0.05rem;
                    opacity: 0.9;
                    font-size: 13px;
                    @media screen and (min-width: 1800px) {
                      font-size: 14px;
                    }
                  }
                }
              }
              .card-owner {
                position: absolute;
                right: 0.15rem;
                bottom: 0.05rem;
                display: flex;
                align-items: center;
                opacity: 0.8;
                span {
                  font-size: 13px;
                  color: #fff;
                  line-height: 1.2;
                  @media screen and (min-width: 1800px) {
                    font-size: 14px;
                  }
                }
              }
              h1 {
                // text-shadow: 3px 3px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                font-size: 0.3rem;
                font-weight: 900;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                line-height: 1.5;
                word-break: break-word;
                @media screen and (max-width: 1440px) {
                  font-size: 0.25rem;
                }
              }
            }
            .el-card__body {
              padding: 0.1rem 0;
              cursor: pointer;
              .text {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #000;
                line-height: 1;
                cursor: pointer;
                @media screen and (min-width: 1800px) {
                  font-size: 15px;
                }
                .text_left {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .icon,
                .icon_img {
                  width: 0.25rem;
                  height: 0.25rem;
                  margin: 0 0.1rem 0 0;
                  border-radius: 0.04rem;
                }
                span {
                  color: #878c93;
                  font-size: 12px;
                  cursor: pointer;
                  @media screen and (min-width: 1440px) {
                    font-size: 13px;
                  }
                  @media screen and (min-width: 1800px) {
                    font-size: 15px;
                  }
                }
                .small {
                  font-weight: 500;
                  color: #000;
                  &:hover {
                    text-decoration: underline;
                  }
                }
              }
            }
          }
          &:hover {
            .box-card {
              .el-card__header {
                opacity: 0.8;
              }
            }
          }
          &:nth-child(9n + 1) {
            .box-card {
              .el-card__header {
                background: #d896f7
                  url(../../../assets/images/dashboard/spaces/space_b_01.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_01.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 2) {
            .box-card {
              .el-card__header {
                background: #c37af9
                  url(../../../assets/images/dashboard/spaces/space_b_02.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_02.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 3) {
            .box-card {
              .el-card__header {
                background: #a85cfc
                  url(../../../assets/images/dashboard/spaces/space_b_03.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_03.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 4) {
            .box-card {
              .el-card__header {
                background: #853fff
                  url(../../../assets/images/dashboard/spaces/space_b_04.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_04.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 5) {
            .box-card {
              .el-card__header {
                background: #7405ff
                  url(../../../assets/images/dashboard/spaces/space_b_05.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_05.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 6) {
            .box-card {
              .el-card__header {
                background: #7220b4
                  url(../../../assets/images/dashboard/spaces/space_b_06.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_06.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 7) {
            .box-card {
              .el-card__header {
                background: #562683
                  url(../../../assets/images/dashboard/spaces/space_b_07.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_07.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 8) {
            .box-card {
              .el-card__header {
                background: #47187d
                  url(../../../assets/images/dashboard/spaces/space_b_08.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_08.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
          &:nth-child(9n + 9) {
            .box-card {
              .el-card__header {
                background: #2d165a
                  url(../../../assets/images/dashboard/spaces/space_b_09.png)
                  no-repeat center;
                background-size: auto 61%;
              }
              .el-card__body {
                .text {
                  .icon {
                    background: url(../../../assets/images/dashboard/spaces/space_w_09.png)
                      no-repeat center;
                    background-size: 100%;
                  }
                }
              }
            }
          }
        }
      }
      .el-pagination {
        margin: 0.1rem auto;
        display: flex;
        justify-content: center;
        .btn-prev {
          i {
            font-size: 14px;
            @media screen and (min-width: 1800px) {
              font-size: 16px;
            }
          }
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

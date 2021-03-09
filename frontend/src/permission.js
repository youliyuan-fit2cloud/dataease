import router from '@/router'
import store from './store'
// import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { buildMenus } from '@/api/system/menu'
import { filterAsyncRouter } from '@/store/modules/permission'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/401', '/404'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
        store.dispatch('permission/setCurrentPath', to.path)
      } else {
        if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
          // get user info
          store.dispatch('user/getInfo').then(() => {
            loadMenus(next, to)
          }).catch(() => {
            store.dispatch('user/logout').then(() => {
              location.reload() // 为了重新实例化vue-router对象 避免bug
            })
          })
        } else if (store.getters.loadMenus) {
          // 修改成false，防止死循环
          store.dispatch('updateLoadMenus')
          loadMenus(next, to)
        } else {
          next()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})
export const loadMenus = (next, to) => {
  buildMenus().then(res => {
    const filterDatas = filterRouter(res.data)
    const asyncRouter = filterAsyncRouter(filterDatas)
    asyncRouter.push({ path: '*', redirect: '/404', hidden: true })
    store.dispatch('permission/GenerateRoutes', asyncRouter).then(() => { // 存储路由
      router.addRoutes(asyncRouter)
      next({ ...to, replace: true })
    })
  })
}

// 根据权限过滤菜单
const filterRouter = routers => {
  const user_permissions = store.getters.permissions
  if (!user_permissions || user_permissions.length === 0) {
    return routers
  }
  const tempResults = routers.filter(router => hasPermission(router, user_permissions))
  // 如果是一级菜单(目录) 没有字菜单 那就移除
  return tempResults.filter(item => item.children && item.children.length)
}
const hasPermission = (router, user_permissions) => {
  // 菜单要求权限 但是当前用户权限没有包含菜单权限
  if (router.permission && !user_permissions.includes(router.permission)) {
    return false
  }
  // 如果有字菜单 则 判断是否满足 ‘任意一个子菜单有权限’
  if (router.children && router.children.length) {
    const permissionChilds = router.children.filter(item => hasPermission(item, user_permissions))
    router.children = permissionChilds
    return router.children.length > 0
  }
  return true
}
router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
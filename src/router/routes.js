export default [
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/views/auth/Register')
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/Login')
  },
  // 首页
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home')
  },
  // 其他未配置的路由都跳转到首页
  {
    path: '*',
    // 重定向
    redirect: '/'
  },
  // 个人中心页
  {
    path: '/users/1/edit',
    // name: 'EditUsers', // 拥有默认子路由，name 属性就没有用了
    component: () => import('@/views/users/Edit.vue'),
    children: [
      {
        // 子路由的 path 为空值 ''，表示该页面作为默认子路由，在导航到父级路由（/users/1/edit）时，就开始加载；
        path: '',
        name: 'EditProfile',
        // auth 为 true，标识当前路由需要登录才能访问
        meta: { auth: true },
        component: () => import('@/views/users/Profile.vue')
      },
      {
        path: '/users/1/edit_avatar',
        name: 'EditAvatar',
        meta: { auth: true },
        component: () => import('@/views/users/Avatar.vue')
      },
      {
        path: '/users/1/edit_password',
        name: 'EditPassword',
        meta: { auth: true },
        component: () => import('@/views/users/Password.vue')
      }
    ]
  },
  // 创建文章
  {
    path: '/articles/create',
    name: 'Create',
    meta: { auth: true },
    component: () => import('@/views/articles/Create.vue')
  },
  // 文章详情
  {
    path: '/articles/:articleId/content',
    name: 'Content',
    component: () => import('@/views/articles/Content.vue')
  },
  // 编辑文章
  {
    path: '/articles/:articleId/edit',
    name: 'Edit',
    meta: { auth: true },
    component: () => import('@/views/articles/Create.vue')
  }
]

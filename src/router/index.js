import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginView from '../views/Login.vue'
import HomeView from '../views/Home.vue'
import ProductsView from '../views/Products.vue'
import CartView from '../views/Cart.vue'
import CartConfirmView from '../views/CartConfirm.vue'
import OrdersView from '../views/Orders.vue'
import OrderDetailView from '../views/OrderDetail.vue'
import OrderReviewView from '../views/OrderReview.vue'
import InventoryChecksView from '../views/InventoryChecks.vue'
import InventoryCheckDetailView from '../views/InventoryCheckDetail.vue'
import PromotionsView from '../views/Promotions.vue'
import ForbiddenView from '../views/Forbidden.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { getCurrentUser } from '../services/auth'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/403',
    name: 'forbidden',
    component: ForbiddenView
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView
      },
      {
        path: 'products',
        name: 'products',
        component: ProductsView,
        meta: { roles: ['customer', 'sales'] }
      },
      {
        path: 'cart',
        name: 'cart',
        component: CartView,
        meta: { roles: ['customer'] }
      },
      {
        path: 'cart/confirm',
        name: 'cart-confirm',
        component: CartConfirmView,
        meta: { roles: ['customer'] }
      },
      {
        path: 'orders',
        name: 'orders',
        component: OrdersView
      },
      {
        path: 'orders/:orderId',
        name: 'order-detail',
        component: OrderDetailView,
        props: true
      },
      {
        path: 'orders/:orderId/review',
        name: 'order-review',
        component: OrderReviewView,
        props: true,
        meta: { roles: ['sales'] }
      },
      {
        path: 'inventory-checks',
        name: 'inventory-checks',
        component: InventoryChecksView,
        meta: { roles: ['sales'] }
      },
      {
        path: 'inventory-checks/:checkId',
        name: 'inventory-check-detail',
        component: InventoryCheckDetailView,
        props: true,
        meta: { roles: ['sales'] }
      },
      {
        path: 'promotions',
        name: 'promotions',
        component: PromotionsView,
        meta: { roles: ['sales'] }
      }
    ]
  },
  {
    path: '*',
    redirect: '/403'
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const user = getCurrentUser()
  if (!user && to.path !== '/login' && to.path !== '/403') {
    return next({ path: '/login' })
  }
  if (user && to.path === '/login') {
    return next({ path: '/' })
  }
  if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
    return next({ path: '/403' })
  }
  next()
})

export default router

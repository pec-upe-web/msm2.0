import Vue from 'vue'
import Vuex from 'vuex'
import { getCurrentUser, saveCurrentUser, logout } from '../services/auth'
import { orders as initialOrders } from '../mock/orders'
import { salesCompanies } from '../mock/salesCompanies'
import { inventoryRecords as initialInventoryRecords } from '../mock/inventoryRecords'

Vue.use(Vuex)

// ── 版本常數（格式變更時遞增，舊快取會被自動清除） ───────────
const APP_VERSION = '1.2'
const CART_KEY = 'b2b_cartItems'
const ORDERS_KEY = 'b2b_orders'
const INVENTORY_KEY = 'b2b_inventory_records'

// ── 簡易 debounce ────────────────────────────────────────────
function debounce (fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// ── 校驗函式 ─────────────────────────────────────────────────
function isValidCart (data) {
  return Array.isArray(data)
}

function isValidOrders (data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(o => typeof o.orderId === 'string' && typeof o.status === 'string')
  )
}

// ── 讀取：版本校驗 + 結構校驗 + Error Boundary ───────────────
function loadPersisted (key, validator) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('資料非物件格式')
    }

    // 版本校驗：不符則清除並回退
    if (parsed.version !== APP_VERSION) {
      console.warn(
        `[store] "${key}" 版本不符（儲存: ${parsed.version}，當前: ${APP_VERSION}），清除快取並回退至原始資料。`
      )
      localStorage.removeItem(key)
      return null
    }

    // 結構校驗：關鍵欄位缺失則回退
    if (!validator(parsed.data)) {
      console.warn(`[store] "${key}" 資料結構異常，清除快取並回退至原始資料。`)
      localStorage.removeItem(key)
      return null
    }

    return parsed.data
  } catch (err) {
    // Error Boundary：任何異常都清除快取、回傳 null、確保 UI 正常
    console.error(`[store] 讀取 "${key}" 發生異常，執行全域狀態重置。`, err)
    try { localStorage.removeItem(key) } catch (_) { /* storage 不可用時靜默失敗 */ }
    return null
  }
}

// ── 寫入：500ms 防抖，包含版本號 ─────────────────────────────
function createDebouncedSave (key, delay = 500) {
  return debounce(function (data) {
    try {
      localStorage.setItem(key, JSON.stringify({ version: APP_VERSION, data }))
    } catch (err) {
      console.warn(`[store] 寫入 "${key}" 失敗（可能超出 quota）。`, err)
    }
  }, delay)
}

const debouncedSaveCart = createDebouncedSave(CART_KEY)
const debouncedSaveOrders = createDebouncedSave(ORDERS_KEY)
const debouncedSaveInventory = createDebouncedSave(INVENTORY_KEY)

// ── 初始化：持久化資料優先，校驗失敗則使用 mock 原始資料 ─────
const persistedCart = loadPersisted(CART_KEY, isValidCart)
const persistedOrders = loadPersisted(ORDERS_KEY, isValidOrders)
const persistedInventory = loadPersisted(INVENTORY_KEY, d => Array.isArray(d))
const initialOrdersState = persistedOrders || initialOrders.map(o => ({ ...o }))
const initialInventoryState = persistedInventory || initialInventoryRecords.map(r => ({ ...r }))

export default new Vuex.Store({
  state: {
    currentUser: getCurrentUser(),
    cartItems: persistedCart || [],
    orders: initialOrdersState,
    selectedSalesCompany: salesCompanies[0],
    inventoryRecords: initialInventoryState,
    snackbar: {
      message: '',
      type: 'success'
    }
  },
  mutations: {
    SET_CURRENT_USER (state, user) {
      state.currentUser = user
    },
    SET_SALES_COMPANY (state, company) {
      state.selectedSalesCompany = company
    },
    ADD_TO_CART (state, item) {
      const existingItem = state.cartItems.find(
        cartItem => cartItem.productId === item.productId && cartItem.packageName === item.packageName
      )
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        state.cartItems.push(item)
      }
      debouncedSaveCart(state.cartItems)
    },
    SHOW_SNACKBAR (state, payload) {
      state.snackbar = {
        message: payload.message,
        type: payload.type || 'success'
      }
    },
    HIDE_SNACKBAR (state) {
      state.snackbar = {
        message: '',
        type: 'success'
      }
    },
    UPDATE_CART_QTY (state, { productId, packageName, delta }) {
      const item = state.cartItems.find(
        i => i.productId === productId && i.packageName === packageName
      )
      if (item) {
        item.quantity = Math.max(1, item.quantity + delta)
        debouncedSaveCart(state.cartItems)
      }
    },
    REMOVE_FROM_CART (state, { productId, packageName }) {
      const index = state.cartItems.findIndex(
        i => i.productId === productId && i.packageName === packageName
      )
      if (index !== -1) {
        state.cartItems.splice(index, 1)
        debouncedSaveCart(state.cartItems)
      }
    },
    UPDATE_CART_PACKAGE (state, { productId, oldPackageName, newPackageName, newUnitPrice }) {
      const itemIndex = state.cartItems.findIndex(
        i => i.productId === productId && i.packageName === oldPackageName
      )
      if (itemIndex === -1) return
      const collidingIndex = state.cartItems.findIndex(
        i => i.productId === productId && i.packageName === newPackageName
      )
      if (collidingIndex !== -1 && collidingIndex !== itemIndex) {
        state.cartItems[collidingIndex].quantity += state.cartItems[itemIndex].quantity
        state.cartItems.splice(itemIndex, 1)
      } else {
        Vue.set(state.cartItems[itemIndex], 'packageName', newPackageName)
        Vue.set(state.cartItems[itemIndex], 'unitPrice', newUnitPrice)
      }
      debouncedSaveCart(state.cartItems)
    },
    CLEAR_CART (state) {
      state.cartItems = []
      debouncedSaveCart(state.cartItems)
    },
    // ── 新增訂單 ─────────────────────────────────────────────
    ADD_ORDER (state, order) {
      state.orders.unshift(order)
      debouncedSaveOrders(state.orders)
    },
    // ── 訂單狀態修改（確保 Vue 2 響應式） ────────────────────
    UPDATE_ORDER_STATUS (state, { orderId, status }) {
      const idx = state.orders.findIndex(o => o.orderId === orderId)
      if (idx !== -1) {
        Vue.set(state.orders[idx], 'status', status)
        debouncedSaveOrders(state.orders)
      }
    },
    ADD_INVENTORY_RECORD (state, record) {
      state.inventoryRecords.unshift(record)
      debouncedSaveInventory(state.inventoryRecords)
    },
    RESTORE_FROM_STORAGE (state) {
      const cart = loadPersisted(CART_KEY, isValidCart)
      const orders = loadPersisted(ORDERS_KEY, isValidOrders)
      if (cart) state.cartItems = cart
      if (orders) state.orders = orders
    }
  },
  actions: {
    login ({ commit }, user) {
      saveCurrentUser(user)
      commit('SET_CURRENT_USER', user)
    },
    logout ({ commit }) {
      logout()
      commit('SET_CURRENT_USER', null)
    },
    addToCart ({ commit }, item) {
      commit('ADD_TO_CART', item)
    },
    showSnackbar ({ commit }, payload) {
      commit('SHOW_SNACKBAR', payload)
      setTimeout(() => {
        commit('HIDE_SNACKBAR')
      }, payload.duration || 1800)
    },
    updateCartQty ({ commit }, payload) {
      commit('UPDATE_CART_QTY', payload)
    },
    removeFromCart ({ commit }, payload) {
      commit('REMOVE_FROM_CART', payload)
    },
    updateCartPackage ({ commit }, payload) {
      commit('UPDATE_CART_PACKAGE', payload)
    },
    clearCart ({ commit }) {
      commit('CLEAR_CART')
    },
    updateOrderStatus ({ commit }, payload) {
      commit('UPDATE_ORDER_STATUS', payload)
    },
    setSalesCompany ({ commit }, company) {
      commit('SET_SALES_COMPANY', company)
    },
    addOrder ({ commit }, order) {
      commit('ADD_ORDER', order)
    },
    addInventoryRecord ({ commit }, record) {
      commit('ADD_INVENTORY_RECORD', record)
    }
  }
})
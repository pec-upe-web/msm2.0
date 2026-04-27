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
const FAVORITES_KEY = 'b2b_favorite_product_ids'

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

function isValidFavoriteProductIds (data) {
  return Array.isArray(data) && data.every(id => typeof id === 'string' && id.length > 0)
}

function isValidFavoriteProductMap (data) {
  if (Array.isArray(data)) {
    return isValidFavoriteProductIds(data)
  }
  if (!data || typeof data !== 'object') {
    return false
  }
  return Object.values(data).every(ids => isValidFavoriteProductIds(ids))
}

function normalizeOrder (order) {
  return {
    ...order,
    source: order.source || 'customer'
  }
}

function mergeSeedOrders (persistedOrders = [], seedOrders = []) {
  const persistedById = new Set(persistedOrders.map(order => order.orderId))
  const merged = [...persistedOrders]
  seedOrders.forEach(order => {
    if (!persistedById.has(order.orderId)) {
      merged.push(order)
    }
  })
  return merged
}

function normalizeInventoryRecord (record) {
  return {
    ...record,
    checkBlocks: Array.isArray(record.checkBlocks)
      ? record.checkBlocks.map(block => ({
          ...block,
          bestBeforeDate: block.bestBeforeDate || ''
        }))
      : []
  }
}

function resolveCompanyIdFromCompanyName (companyName) {
  const match = salesCompanies.find(company => company.name === companyName || company.shortName === companyName)
  return match ? match.id : (salesCompanies[0] ? salesCompanies[0].id : '')
}

function normalizeFavoriteMap (data, fallbackCompanyId) {
  if (Array.isArray(data)) {
    return {
      [fallbackCompanyId]: data.filter(id => typeof id === 'string' && id.length > 0)
    }
  }

  if (!data || typeof data !== 'object') {
    return {}
  }

  return Object.entries(data).reduce((acc, [companyId, ids]) => {
    if (!Array.isArray(ids)) return acc
    const uniqueIds = [...new Set(ids.filter(id => typeof id === 'string' && id.length > 0))]
    if (uniqueIds.length) {
      acc[companyId] = uniqueIds
    }
    return acc
  }, {})
}

function resolveFavoritePayload (payload) {
  if (typeof payload === 'string') {
    return {
      companyId: defaultFavoriteCompanyId,
      productId: payload
    }
  }
  if (!payload || typeof payload !== 'object') {
    return {
      companyId: defaultFavoriteCompanyId,
      productId: ''
    }
  }
  return {
    companyId: payload.companyId || defaultFavoriteCompanyId,
    productId: payload.productId || ''
  }
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
const debouncedSaveFavorites = createDebouncedSave(FAVORITES_KEY)

// ── 初始化：持久化資料優先，校驗失敗則使用 mock 原始資料 ─────
const persistedCart = loadPersisted(CART_KEY, isValidCart)
const persistedOrders = loadPersisted(ORDERS_KEY, isValidOrders)
const persistedInventory = loadPersisted(INVENTORY_KEY, d => Array.isArray(d))
const currentUserFromStorage = getCurrentUser()
const defaultFavoriteCompanyId = currentUserFromStorage
  ? resolveCompanyIdFromCompanyName(currentUserFromStorage.company)
  : (salesCompanies[0] ? salesCompanies[0].id : '')

const persistedFavorites = loadPersisted(FAVORITES_KEY, isValidFavoriteProductMap)
const defaultSalesCompanyId = salesCompanies[0] ? salesCompanies[0].id : ''
const defaultSelectedSalesCompany =
  currentUserFromStorage
    ? (salesCompanies.find(company => company.id === resolveCompanyIdFromCompanyName(currentUserFromStorage.company)) || salesCompanies[0])
    : salesCompanies[0]

function normalizeCartItem (item) {
  return {
    ...item,
    companyId: item.companyId || defaultSalesCompanyId
  }
}

function findCartItemIndex (cartItems, payload) {
  const companyId = payload.companyId || defaultSalesCompanyId
  return cartItems.findIndex(
    item =>
      item.productId === payload.productId &&
      item.packageName === payload.packageName &&
      item.companyId === companyId
  )
}

const initialCartState = (persistedCart || []).map(normalizeCartItem)
const initialOrdersState = mergeSeedOrders(
  (persistedOrders || []).map(normalizeOrder),
  initialOrders.map(normalizeOrder)
)
const initialInventoryState = (persistedInventory || initialInventoryRecords).map(normalizeInventoryRecord)
const initialFavoritesState = normalizeFavoriteMap(persistedFavorites, defaultFavoriteCompanyId)

export default new Vuex.Store({
  state: {
    currentUser: getCurrentUser(),
    cartItems: initialCartState,
    orders: initialOrdersState,
    selectedSalesCompany: defaultSelectedSalesCompany,
    inventoryRecords: initialInventoryState,
    favoriteByCompany: initialFavoritesState,
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
      const cartItem = normalizeCartItem(item)
      const existingItem = state.cartItems.find(
        existingItem =>
          existingItem.productId === cartItem.productId &&
          existingItem.packageName === cartItem.packageName &&
          existingItem.companyId === cartItem.companyId
      )
      if (existingItem) {
        existingItem.quantity += cartItem.quantity
      } else {
        state.cartItems.push(cartItem)
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
    UPDATE_CART_QTY (state, { productId, packageName, delta, companyId }) {
      const index = findCartItemIndex(state.cartItems, { productId, packageName, companyId })
      const item = index !== -1 ? state.cartItems[index] : null
      if (item) {
        item.quantity = Math.max(1, item.quantity + delta)
        debouncedSaveCart(state.cartItems)
      }
    },
    REMOVE_FROM_CART (state, { productId, packageName, companyId }) {
      const index = findCartItemIndex(state.cartItems, { productId, packageName, companyId })
      if (index !== -1) {
        state.cartItems.splice(index, 1)
        debouncedSaveCart(state.cartItems)
      }
    },
    UPDATE_CART_PACKAGE (state, { productId, oldPackageName, newPackageName, newUnitPrice, companyId }) {
      const itemIndex = findCartItemIndex(state.cartItems, {
        productId,
        packageName: oldPackageName,
        companyId
      })
      if (itemIndex === -1) return
      const collidingIndex = state.cartItems.findIndex(
        i =>
          i.productId === productId &&
          i.packageName === newPackageName &&
          i.companyId === (companyId || defaultSalesCompanyId)
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
    TOGGLE_FAVORITE_PRODUCT (state, payload) {
      const { companyId, productId } = resolveFavoritePayload(payload)
      if (!productId) return
      const resolvedCompanyId = companyId || defaultFavoriteCompanyId
      if (!state.favoriteByCompany[resolvedCompanyId]) {
        Vue.set(state.favoriteByCompany, resolvedCompanyId, [])
      }
      const favorites = state.favoriteByCompany[resolvedCompanyId]
      const index = favorites.indexOf(productId)
      if (index === -1) {
        favorites.unshift(productId)
      } else {
        favorites.splice(index, 1)
      }
      debouncedSaveFavorites(state.favoriteByCompany)
    },
    REMOVE_FAVORITE_PRODUCT (state, payload) {
      const { companyId, productId } = resolveFavoritePayload(payload)
      if (!productId) return
      const resolvedCompanyId = companyId || defaultFavoriteCompanyId
      const favorites = state.favoriteByCompany[resolvedCompanyId] || []
      const index = favorites.indexOf(productId)
      if (index !== -1) {
        favorites.splice(index, 1)
        Vue.set(state.favoriteByCompany, resolvedCompanyId, favorites)
        debouncedSaveFavorites(state.favoriteByCompany)
      }
    },
    CLEAR_FAVORITES (state, companyId) {
      if (companyId) {
        Vue.delete(state.favoriteByCompany, companyId)
      } else {
        state.favoriteByCompany = {}
      }
      debouncedSaveFavorites(state.favoriteByCompany)
    },
    RESTORE_FROM_STORAGE (state) {
      const cart = loadPersisted(CART_KEY, isValidCart)
      const orders = loadPersisted(ORDERS_KEY, isValidOrders)
      const favorites = loadPersisted(FAVORITES_KEY, isValidFavoriteProductMap)
      if (cart) state.cartItems = cart.map(normalizeCartItem)
      if (orders) state.orders = orders
      if (favorites) state.favoriteByCompany = normalizeFavoriteMap(favorites, defaultFavoriteCompanyId)
    }
  },
  getters: {
    cartQuantityByCompanyId: state => companyId => {
      return state.cartItems
        .filter(item => item.companyId === companyId)
        .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    },
    cartLineCountByCompanyId: state => companyId => {
      const seen = new Set()
      state.cartItems.forEach(item => {
        if (item.companyId !== companyId) return
        seen.add(`${item.productId}__${item.packageName}`)
      })
      return seen.size
    },
    favoriteProductIdsByCompanyId: state => companyId => {
      return state.favoriteByCompany[companyId] || []
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
    },
    toggleFavoriteProduct ({ commit }, payload) {
      commit('TOGGLE_FAVORITE_PRODUCT', payload)
    },
    removeFavoriteProduct ({ commit }, payload) {
      commit('REMOVE_FAVORITE_PRODUCT', payload)
    },
    clearFavorites ({ commit }, companyId) {
      commit('CLEAR_FAVORITES', companyId)
    }
  }
})

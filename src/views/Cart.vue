<template>
  <div class="cart-page">

    <!-- 頁面標題 -->
    <div class="page-title-block">
      <span class="eyebrow">MSM-CORE / CART</span>
      <h2 class="page-title">購物車</h2>
    </div>

    <!-- 空購物車狀態 -->
    <div v-if="cartItems.length === 0" class="empty-state">
      <p class="empty-text">購物車是空的</p>
      <router-link class="browse-btn" to="/products">去逛逛</router-link>
    </div>

    <template v-else>
      <div class="cart-layout">

        <!-- 左側主區：品項列表 -->
        <section class="cart-main">
          <!-- 銷售公司切換 -->
          <div class="company-switcher">
            <span class="company-switcher-label">銷售公司</span>
            <div class="company-tabs">
              <button
                v-for="co in salesCompanies"
                :key="co.id"
                type="button"
                :class="['company-tab', { active: selectedSalesCompany.id === co.id }]"
                @click="selectCompany(co)"
              >{{ co.shortName }}</button>
            </div>
          </div>

          <h2 class="section-title">購物車品項</h2>

          <ul class="item-list">
            <li
              v-for="item in cartItems"
              :key="item.productId + '_' + item.packageName"
              class="cart-item"
            >
              <div class="item-top">
                <div
                  class="item-thumb"
                  :class="{ 'is-skeleton': !thumbReadySet[item.productId] && !thumbErrorSet[item.productId] }"
                >
                  <img
                    v-show="!thumbErrorSet[item.productId]"
                    class="thumb-img"
                    :class="{ 'is-loaded': thumbReadySet[item.productId] }"
                    :src="productImageUrl(item.productId)"
                    :alt="item.productName"
                    @load="onThumbLoad(item.productId)"
                    @error="onThumbError(item.productId)"
                  />
                  <div v-if="thumbErrorSet[item.productId]" class="thumb-placeholder">
                    <span class="thumb-watermark">MSM 2.0</span>
                  </div>
                </div>
                <div class="item-body">
                  <div class="item-left-col">
                    <p class="item-name">{{ item.productName }}</p>
                    <select
                      class="package-select"
                      :value="item.packageName"
                      @change="onPackageChange(item, $event.target.value)"
                    >
                      <option
                        v-for="opt in packageOptions(item.productId)"
                        :key="opt.label"
                        :value="opt.label"
                      >{{ opt.label }}</option>
                    </select>
                    <span class="unit-price">NT$ {{ item.unitPrice }}</span>
                  </div>
                  <div class="item-right-col">
                    <button type="button" class="remove-btn" @click="askRemove(item)">
                      <trash2-icon :size="14" :stroke-width="1.5" />
                      移除
                    </button>
                    <div class="qty-total-wrap">
                      <div class="quantity-control">
                        <button type="button" class="qty-btn" @click="changeQty(item, -1)">-</button>
                        <span class="qty-value">{{ item.quantity }}</span>
                        <button type="button" class="qty-btn" @click="changeQty(item, 1)">+</button>
                      </div>
                      <span class="subtotal-text">NT$ {{ item.unitPrice * item.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <!-- 促銷區塊 -->
          <div v-if="promotionStatus.length > 0" class="promotions-section">
            <h3 class="promotions-title">促銷活動</h3>
            <div
              v-for="promo in promotionStatus"
              :key="promo.id"
              class="promo-item"
            >
              <p class="promo-name">{{ promo.name }}</p>
              <template v-if="promo.met">
                <p class="promo-status promo-met">已達門檻！預計獲得贈品：</p>
                <ul class="gift-list">
                  <li v-for="(gift, gi) in promo.gifts" :key="gi" class="gift-item">
                    {{ gift.name }} × {{ gift.quantity }}
                  </li>
                </ul>
              </template>
              <p v-else class="promo-status promo-pending">
                再購買 {{ promo.remaining }} 件即可獲得贈品
              </p>
            </div>
          </div>
        </section>

        <!-- 右側側欄（桌機） -->
        <aside class="cart-sidebar">
          <h2 class="section-title">訂單摘要</h2>
          <div class="summary-card">
            <div class="summary-row">
              <span class="summary-label">商品小計</span>
              <span class="summary-value">NT$ {{ subtotal }}</span>
            </div>
            <router-link class="checkout-btn" to="/cart/confirm">前往確認</router-link>
          </div>
        </aside>
      </div>

      <!-- 底部固定列（手機） -->
      <div class="mobile-summary">
        <div class="mobile-left">
          <span class="mobile-label">商品小計</span>
          <span class="mobile-total">NT$ {{ subtotal }}</span>
        </div>
        <router-link class="checkout-btn" to="/cart/confirm">前往確認</router-link>
      </div>
    </template>

    <!-- 確認刪除 Modal -->
    <transition name="modal-fade">
      <div v-if="confirmItem" class="confirm-overlay" @click.self="cancelRemove">
        <div class="confirm-dialog">
          <p class="confirm-title">確定要移除此品項嗎？</p>
          <p class="confirm-sub">{{ confirmItem.productName }}（{{ confirmItem.packageName }}）</p>
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel" @click="cancelRemove">取消</button>
            <button type="button" class="confirm-ok" @click="confirmRemove">確定移除</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 撤酷 Bar -->
    <transition name="undo-slide">
      <div v-if="undoBar.show" class="undo-bar">
        <span class="undo-msg">已移除「{{ undoBar.item && undoBar.item.productName }}」</span>
        <button type="button" class="undo-btn" @click="undoRemove">撤酷</button>
      </div>
    </transition>
  </div>
</template>

<script>
import { products } from '../mock/products'
import { promotions } from '../mock/promotions'
import { salesCompanies } from '../mock/salesCompanies'
import { Trash2 as Trash2Icon } from 'lucide-vue'

export default {
  name: 'CartPage',
  components: { Trash2Icon },
  data () {
    return {
      productList: products,
      promotions,
      salesCompanies,
      thumbReadySet: {},
      thumbErrorSet: {},
      confirmItem: null,
      undoBar: { show: false, item: null, timer: null },
    }
  },
  computed: {
    cartItems () {
      return this.$store.state.cartItems
    },
    selectedSalesCompany () {
      return this.$store.state.selectedSalesCompany
    },
    subtotal () {
      return this.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    },
    totalQty () {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    promotionStatus () {
      return this.promotions
        .filter(promo => {
          if (promo.minTotalQty !== undefined) return true
          if (promo.targetProductId) {
            return this.cartItems.some(i => i.productId === promo.targetProductId)
          }
          return false
        })
        .map(promo => {
          if (promo.minTotalQty !== undefined) {
            const remaining = Math.max(0, promo.minTotalQty - this.totalQty)
            return { ...promo, met: remaining === 0, remaining }
          }
          if (promo.targetProductId) {
            const matched = this.cartItems.find(i => i.productId === promo.targetProductId)
            const qty = matched ? matched.quantity : 0
            const remaining = Math.max(0, promo.minQty - qty)
            return { ...promo, met: remaining === 0, remaining }
          }
          return { ...promo, met: false, remaining: null }
        })
    }
  },
  methods: {
    selectCompany (co) {
      this.$store.dispatch('setSalesCompany', co)
    },
    packageOptions (productId) {
      const product = this.productList.find(p => p.id === productId)
      if (!product) return []
      if (Array.isArray(product.packages) && product.packages.length > 0) {
        // 自訂排序：單罐、一束、一打、一箱，其餘照原順序
        const order = ['單罐', '一束/6罐', '一打/12罐', '一箱/24罐']
        const sorted = [...product.packages].sort((a, b) => {
          const idxA = order.findIndex(o => a.name.includes(o))
          const idxB = order.findIndex(o => b.name.includes(o))
          if (idxA === -1 && idxB === -1) return 0
          if (idxA === -1) return 1
          if (idxB === -1) return -1
          return idxA - idxB
        })
        return sorted.map(pkg => ({
          label: pkg.name,
          price: Number(pkg.price) || 0
        }))
      }
      return [{ label: product.package || '標準包裝', price: Number(product.price) || 0 }]
    },
    changeQty (item, delta) {
      this.$store.dispatch('updateCartQty', {
        productId: item.productId,
        packageName: item.packageName,
        delta
      })
    },
    askRemove (item) {
      this.confirmItem = item
    },
    cancelRemove () {
      this.confirmItem = null
    },
    confirmRemove () {
      const item = this.confirmItem
      this.confirmItem = null
      this.$store.dispatch('removeFromCart', {
        productId: item.productId,
        packageName: item.packageName
      })
      // 儲存小計供撤酷使用
      const snapshot = { ...item }
      if (this.undoBar.timer) clearTimeout(this.undoBar.timer)
      this.undoBar.show = true
      this.undoBar.item = snapshot
      this.undoBar.timer = setTimeout(() => {
        this.undoBar.show = false
        this.undoBar.item = null
      }, 4000)
    },
    undoRemove () {
      if (!this.undoBar.item) return
      clearTimeout(this.undoBar.timer)
      this.$store.dispatch('addToCart', { ...this.undoBar.item })
      this.undoBar.show = false
      this.undoBar.item = null
    },
    removeItem (item) {
      this.$store.dispatch('removeFromCart', {
        productId: item.productId,
        packageName: item.packageName
      })
    },
    productImageUrl (productId) {
      const product = this.productList.find(p => p.id === productId)
      if (product && product.image) return product.image
      return 'https://placehold.co/64x64/F1F5F9/64748B?text=MSM'
    },
    onThumbLoad (productId) {
      this.$set(this.thumbReadySet, productId, true)
    },
    onThumbError (productId) {
      this.$set(this.thumbReadySet, productId, true)
      this.$set(this.thumbErrorSet, productId, true)
    },
    onPackageChange (item, newPackageName) {
      if (newPackageName === item.packageName) return
      const options = this.packageOptions(item.productId)
      const newOption = options.find(opt => opt.label === newPackageName)
      if (!newOption) return
      this.$store.dispatch('updateCartPackage', {
        productId: item.productId,
        oldPackageName: item.packageName,
        newPackageName: newOption.label,
        newUnitPrice: newOption.price
      })
    }
  }
}
</script>

<style scoped>
.cart-page {
  display: flex;
  flex-direction: column;
}

/* ── 空購物車 ────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
}

.empty-text {
  color: var(--c-text-faint);
  font-size: 16px;
  font-weight: 400;
}

.browse-btn {
  padding: 10px 22px;
  border: 0.5px solid var(--c-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

/* ── 主體佈局 ─────────────────────────────── */
.cart-layout {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.section-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 500;
  color: var(--c-text-title);
}

/* ── 銷售公司切換 ─────────────────────────── */
.company-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.company-switcher-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-faint);
  white-space: nowrap;
}

.company-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.company-tab {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  font-size: 13px;
  font-weight: 400;
  color: #64748B;
  cursor: pointer;
  transition: all 0.15s;
}

.company-tab.active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: var(--c-surface);
  font-weight: 500;
}

/* ── 左側品項列表 ─────────────────────────── */
.cart-main {
  flex: 1;
  min-width: 0;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.cart-item {
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 0.5px solid var(--c-stripe);
  transition: background-color 0.15s ease, color 0.15s;
}

/* 保持 hover 效果 */


.cart-item:last-child {
  border-bottom: none;
}



/* ── 縮圖列 ───────────────────────────────── */
.item-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.item-thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 2px;
  overflow: hidden;
  background: var(--c-bg);
  border: 0.5px solid var(--c-border);
  position: relative;
}

/* 骨架屏閃爍 */
.item-thumb.is-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer-thumb 1.4s ease-in-out infinite;
}

@keyframes shimmer-thumb {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.thumb-img.is-loaded {
  opacity: 1;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-stripe);
}

.thumb-watermark {
  font-size: 9px;
  font-weight: 500;
  color: var(--c-border);
  letter-spacing: 0.06em;
  user-select: none;
}

.item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 20px;
}

.item-left-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: center;
}

.item-right-col {
  flex-shrink: 0;
  width: 124px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  padding-right: 0;
}

.item-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-title);
}

.remove-btn {
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  padding: 4px 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  transition: color 0.15s;
  align-self: flex-end;
}

.remove-btn:hover {
  color: #8c2020;
}

/* ── Confirm Modal ────────────────────────── */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 24px;
}

.confirm-dialog {
  background: var(--c-surface);
  border-radius: 10px;
  border: 0.5px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  padding: 24px 20px 20px;
  width: 100%;
  max-width: 320px;
}

.confirm-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--c-text-title);
  text-align: center;
}

.confirm-sub {
  margin: 0 0 20px;
  font-size: 13px;
  font-weight: 400;
  color: #64748B;
  text-align: center;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.confirm-cancel {
  flex: 1;
  height: 40px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: transparent;
  color: var(--c-text-title);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.confirm-cancel:hover {
  background: var(--c-stripe);
}

.confirm-ok {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #8c2020;
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.confirm-ok:hover {
  background: #6e1818;
}

/* Modal 淡入淡出 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

/* ── Undo Bar ─────────────────────────────── */
.undo-bar {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(26, 37, 64, 0.94);
  border-radius: 20px;
  z-index: 400;
  white-space: nowrap;
}

.undo-msg {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
}

.undo-btn {
  border: none;
  background: none;
  color: #7dd3fc;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.02em;
}

.undo-btn:hover {
  color: #bae6fd;
}

/* Undo Bar 滑入滑出 */
.undo-slide-enter-active,
.undo-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.undo-slide-enter,
.undo-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

.package-select {
  width: min(280px, 100%);
  min-width: 240px;
  border-width: 1.5px;
  border-style: solid;
  border-color: #e0e0e0;
  border-radius: 6px;
  background: var(--c-surface);
  color: var(--c-text-title);
  font-family: 'Noto Sans TC', var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  padding: 5px 8px;
  outline: none;
  transition: border-color 0.18s;
}

.qty-total-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid var(--c-primary);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.18s;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #ffffff;
  color: var(--c-primary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.qty-value {
  width: 30px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.unit-price {
  font-size: 12px;
  font-weight: 400;
  color: #64748B;
  font-family: var(--font-mono);
}

.subtotal-text {
  font-size: 15px;
  font-weight: 500;
  color: #1E293B;
  font-family: var(--font-mono);
  text-align: right;
  white-space: nowrap;
}

/* ── 促銷區塊 ─────────────────────────────── */
.promotions-section {
  margin-top: 16px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  padding: 14px;
}

.promotions-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-title);
}

.promo-item {
  padding: 10px 0;
  border-top: 0.5px solid var(--c-divider);
}

.promo-item:first-of-type {
  padding-top: 0;
  border-top: none;
}

.promo-name {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.promo-status {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
}

.promo-met {
  color: #2a7a3a;
}

.promo-pending {
  color: var(--c-text-faint);
}

.gift-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
}

.gift-item {
  font-size: 13px;
  font-weight: 400;
  color: #2a7a3a;
  padding: 3px 0;
}

/* ── 右側側欄 ─────────────────────────────── */
.cart-sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
}

.summary-card {
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  color: var(--c-text-muted);
  font-size: 14px;
  font-weight: 400;
}

.summary-value {
  color: var(--c-text-title);
  font-size: 15px;
  font-weight: 500;
  font-family: var(--font-mono);
}

.checkout-btn {
  display: block;
  width: 100%;
  padding: 11px 0;
  text-align: center;
  background: var(--c-primary);
  color: var(--c-surface);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

/* ── 手機底部固定列 ────────────────────────── */
.mobile-summary {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--c-surface);
  border-top: 0.5px solid var(--c-border);
  gap: 12px;
  z-index: 100;
}

.mobile-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-label {
  font-size: 12px;
  font-weight: 400;
  color: var(--c-text-faint);
}

.mobile-total {
  font-size: 16px;
  font-weight: 500;
  color: var(--c-text-title);
  font-family: var(--font-mono);
}

/* ── RWD ──────────────────────────────────── */
@media (max-width: 768px) {
  .cart-layout {
    flex-direction: column;
  }

  .cart-main {
    width: 100%;
  }

  .cart-sidebar {
    display: none;
  }

  .mobile-summary {
    display: flex;
  }

  .cart-page {
    padding-bottom: 80px;
  }

  .item-thumb {
    width: 60px;
    height: 60px;
  }

  .item-body {
    gap: 12px;
  }

  .package-select {
    min-width: 0;
    width: min(260px, 100%);
  }
}
</style>

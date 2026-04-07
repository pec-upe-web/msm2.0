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
                    <button type="button" class="remove-btn" @click="removeItem(item)">
                      <trash2-icon :size="14" :stroke-width="1.5" />
                      移除
                    </button>
                    <div class="quantity-control">
                      <button type="button" class="qty-btn" @click="changeQty(item, -1)">-</button>
                      <span class="qty-value">{{ item.quantity }}</span>
                      <button type="button" class="qty-btn" @click="changeQty(item, 1)">+</button>
                    </div>
                    <span class="subtotal-text">NT$ {{ item.unitPrice * item.quantity }}</span>
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
  </div>
</template>

<script>
import { products } from '../mock/products'
import { promotions } from '../mock/promotions'
import { Trash2 as Trash2Icon } from 'lucide-vue'

export default {
  name: 'CartPage',
  components: { Trash2Icon },
  data () {
    return {
      productList: products,
      promotions,
      thumbReadySet: {},
      thumbErrorSet: {}
    }
  },
  computed: {
    cartItems () {
      return this.$store.state.cartItems
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
    packageOptions (productId) {
      const product = this.productList.find(p => p.id === productId)
      if (!product) return []
      if (Array.isArray(product.packages) && product.packages.length > 0) {
        return product.packages.map(pkg => ({
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
  color: #7f8797;
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
  color: #334155;
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
  background: #ffffff;
}

.cart-item {
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 0.5px solid #F1F5F9;
  transition: background-color 0.15s ease;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item:hover {
  background-color: #F9FBFE;
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
  background: #F8FAFC;
  border: 0.5px solid #E2E8F0;
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
  background: #F1F5F9;
}

.thumb-watermark {
  font-size: 9px;
  font-weight: 600;
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
  gap: 8px;
}

.item-left-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}

.item-right-col {
  flex-shrink: 0;
  width: 96px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding-right: 0;
}

.item-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
}

.remove-btn {
  border: none;
  background: none;
  color: #8c2020;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.package-select {
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 400;
  padding: 5px 8px;
  outline: none;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  overflow: hidden;
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
  font-weight: 700;
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
  background: #ffffff;
  padding: 14px;
}

.promotions-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
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
  color: #7f8797;
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
  background: #ffffff;
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
  color: #4b5568;
  font-size: 14px;
  font-weight: 400;
}

.summary-value {
  color: #334155;
  font-size: 15px;
  font-weight: 500;
}

.checkout-btn {
  display: block;
  width: 100%;
  padding: 11px 0;
  text-align: center;
  background: var(--c-primary);
  color: #ffffff;
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
  background: #ffffff;
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
  color: #7f8797;
}

.mobile-total {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
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
}
</style>

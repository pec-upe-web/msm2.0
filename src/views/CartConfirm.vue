<template>
  <div class="cart-confirm-page">
    <div class="confirm-container">
      <div class="page-title-block">
        <span class="eyebrow">MSM-CORE / ORDER CONFIRM</span>
        <h2 class="page-title">確認訂單</h2>
      </div>

      <!-- 訂單摘要卡片 -->
      <section class="summary-card">
        <div class="company-row">
          <span class="company-label">銷售公司</span>
          <span class="company-value">{{ selectedSalesCompany }}</span>
        </div>
        <div class="divider" />
        <h3 class="card-title">訂單品項</h3>

        <ul class="item-list">
          <li v-for="item in cartItems" :key="item.productId + '_' + item.packageName" class="item-row">
            <div class="item-info">
              <p class="item-name">{{ item.productName }}</p>
              <p class="item-meta">{{ item.productId }}・{{ item.packageName }}</p>
            </div>
            <div class="item-right">
              <span class="item-qty">× {{ item.quantity }}</span>
              <span class="item-subtotal">$ {{ item.unitPrice * item.quantity }}</span>
            </div>
          </li>
        </ul>

        <!-- 促銷贈品 -->
        <template v-if="earnedGifts.length > 0">
          <div class="divider" />
          <h4 class="gift-heading">促銷贈品</h4>
          <ul class="gift-list">
            <li v-for="(gift, idx) in earnedGifts" :key="idx" class="gift-row">
              <span class="gift-label">{{ gift.promoName }}</span>
              <span class="gift-item">{{ gift.name }} × {{ gift.quantity }}</span>
            </li>
          </ul>
        </template>

        <div class="divider" />

        <div class="total-row">
          <span class="total-label">訂單總金額</span>
          <span class="total-value">$ {{ subtotal }}</span>
        </div>
      </section>

      <!-- 備註欄位 -->
      <section class="remark-section">
        <textarea
          v-model="remark"
          class="remark-textarea"
          placeholder="備註（選填）"
          rows="4"
        ></textarea>
      </section>

      <!-- 操作按鈕 -->
      <div class="action-buttons">
        <button type="button" class="back-btn" @click="$router.back()">
          <chevron-left-icon :size="16" :stroke-width="1.5" />
          返回修改
        </button>
        <button type="button" class="submit-btn" @click="submitOrder">
          確認送出
          <check-icon :size="16" :stroke-width="1.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { promotions } from '../mock/promotions'
import {
  ChevronLeft as ChevronLeftIcon,
  Check as CheckIcon
} from 'lucide-vue'

export default {
  name: 'CartConfirmPage',
  components: { ChevronLeftIcon, CheckIcon },
  data () {
    return {
      remark: '',
      promotions
    }
  },
  computed: {
    cartItems () {
      return this.$store.state.cartItems
    },
    selectedSalesCompany () {
      const c = this.$store.state.selectedSalesCompany
      return c ? (c.name || c) : '—'
    },
    subtotal () {
      return this.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    },
    totalQty () {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    earnedGifts () {
      const result = []
      this.promotions.forEach(promo => {
        if (promo.minTotalQty !== undefined) {
          if (this.totalQty >= promo.minTotalQty) {
            promo.gifts.forEach(gift => {
              result.push({ promoName: promo.name, ...gift })
            })
          }
          return
        }
        if (promo.targetProductId) {
          const matched = this.cartItems.find(i => i.productId === promo.targetProductId)
          if (matched && matched.quantity >= promo.minQty) {
            promo.gifts.forEach(gift => {
              result.push({ promoName: promo.name, ...gift })
            })
          }
        }
      })
      return result
    }
  },
  methods: {
    submitOrder () {
      this.$store.dispatch('clearCart')
      this.$store.dispatch('showSnackbar', { message: '訂單已成功送出', type: 'success' })
      this.$router.push('/orders')
    }
  }
}
</script>

<style scoped>
.cart-confirm-page {
  display: flex;
  justify-content: center;
  padding: 8px 0 32px;
}

.confirm-container {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #334155;
}

/* ── 銷售公司列 ──────────── */
.company-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.company-label {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.company-value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* ── 訂單摘要卡片 ─────── */
.summary-card {
  border: 0.5px solid #d0ddf0;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.card-title {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.item-meta {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.item-qty {
  font-size: 13px;
  font-weight: 400;
  color: #4b5568;
}

.item-subtotal {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  min-width: 80px;
  text-align: right;
}

/* ── 分隔線 ─────────────── */
.divider {
  margin: 14px 0;
  border: none;
  border-top: 0.5px solid var(--c-divider);
}

/* ── 贈品 ────────────────── */
.gift-heading {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 500;
  color: #2a7a3a;
}

.gift-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gift-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 400;
  color: #2a7a3a;
}

.gift-item {
  font-weight: 500;
}

/* ── 總金額 ──────────────── */
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.total-value {
  font-size: 18px;
  font-weight: 500;
  color: var(--c-primary);
}

/* ── 備註 ────────────────── */
.remark-section {
  display: flex;
  flex-direction: column;
}

.remark-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 0.5px solid #d0ddf0;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  resize: vertical;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.remark-textarea::placeholder {
  color: #8b95a8;
  font-weight: 400;
}

/* ── 操作按鈕 ─────────────── */
.action-buttons {
  display: flex;
  gap: 12px;
}

.back-btn {
  flex: 1;
  height: 44px;
  border: 0.5px solid var(--c-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.submit-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 6px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
</style>

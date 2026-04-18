<template>
  <div class="products-page">

    <!-- 頁面標題 -->
    <div class="page-title-block">
      <span class="eyebrow">MSM-CORE / PRODUCT CATALOG</span>
      <h2 class="page-title">產品目錄</h2>
    </div>

    <div class="top-tools">
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

      <div class="search-view-row">
        <div class="search-wrapper">
          <search-icon :size="16" :stroke-width="1.5" class="search-icon-el" />
          <input
            v-model.trim="keyword"
            class="search-input"
            type="text"
            placeholder="搜尋產品名稱或產品代號"
          />
        </div>
        <!-- 切換按鈕 -->
        <div class="view-toggle">
          <button
            type="button"
            :class="['toggle-btn', { active: viewMode === 'list' }]"
            title="直列式"
            @click="viewMode = 'list'"
          >
            <align-justify-icon :size="16" :stroke-width="1.5" />
          </button>
          <button
            type="button"
            :class="['toggle-btn', { active: viewMode === 'grid' }]"
            title="格狀"
            @click="viewMode = 'grid'"
          >
            <layout-grid-icon :size="16" :stroke-width="1.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- 格狀 / 直列 -->
    <div :class="['products-grid', 'view-' + viewMode]">
      <article v-for="product in filteredProducts" :key="product.id" class="product-card">
        <!-- 圖片 -->
        <div
          class="product-img-wrap"
          :class="{ 'is-skeleton': !imgReadyMap[product.id] && !imgErrorMap[product.id] }"
        >
          <img
            v-show="!imgErrorMap[product.id]"
            class="product-image"
            :class="{ 'is-loaded': imgReadyMap[product.id] }"
            :src="productThumbUrl(product)"
            :alt="product.name"
            @load="onImgReady(product.id, false)"
            @error="onImgReady(product.id, true)"
          />
          <div v-if="imgErrorMap[product.id]" class="img-placeholder">
            <span class="placeholder-watermark">MSM 2.0</span>
          </div>
        </div>

        <!-- 內容 -->
        <div class="product-content">
          <!-- 資訊區 -->
          <div class="info-group">
            <div class="name-row">
              <h3 class="product-name">{{ product.name }}</h3>
              <span
                v-if="packageOptionsMap[product.id].length === 1"
                class="single-pkg-badge"
              >{{ packageOptionsMap[product.id][0].label }}</span>
            </div>
            <p class="product-id">{{ product.id }}</p>
            <p v-if="product.description" class="product-desc">{{ product.description }}</p>
            <div class="pkg-area">
              <select
                v-if="packageOptionsMap[product.id].length > 1"
                :value="selectedPackageMap[product.id]"
                class="package-select"
                @change="setSelectedPackage(product.id, $event.target.value)"
              >
                <option
                  v-for="option in packageOptionsMap[product.id]"
                  :key="option.label"
                  :value="option.label"
                >{{ option.label }}</option>
              </select>
            </div>
          </div>

          <!-- 操作區 -->
          <div class="action-group">
            <div class="price-qty-row">
              <span class="price-text">$ {{ selectedOption(product.id).price }}</span>
              <div class="quantity-control">
                <button type="button" class="quantity-btn" @click="decreaseQty(product.id)">-</button>
                <span class="quantity-value">{{ quantityMap[product.id] }}</span>
                <button type="button" class="quantity-btn" @click="increaseQty(product.id)">+</button>
              </div>
            </div>
            <p v-if="isNoPrice(product.id)" class="price-warning">無價格資料</p>
            <button
              type="button"
              class="add-cart-btn"
              :disabled="isNoPrice(product.id)"
              @click="addToCart(product)"
            >
              加入購物車
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import { products } from '../mock/products'
import { salesCompanies } from '../mock/salesCompanies'
import {
  Search as SearchIcon,
  AlignJustify as AlignJustifyIcon,
  LayoutGrid as LayoutGridIcon
} from 'lucide-vue'

export default {
  name: 'ProductsPage',
  components: { SearchIcon, AlignJustifyIcon, LayoutGridIcon },
  data () {
    return {
      keyword: '',
      viewMode: 'grid',
      productList: products,
      salesCompanies,
      selectedPackageMap: {},
      quantityMap: {},
      imgReadyMap: {},
      imgErrorMap: {}
    }
  },
  computed: {
    packageOptionsMap () {
      const map = {}
      this.productList.forEach(product => {
        if (Array.isArray(product.packages) && product.packages.length > 0) {
          map[product.id] = product.packages.map(pkg => ({
            label: pkg.name,
            price: Number(pkg.price) || 0,
            isGift: !!pkg.isGift
          }))
          return
        }
        map[product.id] = [
          {
            label: product.package || '標準包裝',
            price: Number(product.price) || 0,
            isGift: !!product.isGift
          }
        ]
      })
      return map
    },
    filteredProducts () {
      const lowerKeyword = this.keyword.toLowerCase()
      return this.productList.filter(product => {
        return !lowerKeyword ||
          product.name.toLowerCase().includes(lowerKeyword) ||
          product.id.toLowerCase().includes(lowerKeyword)
      })
    },
    selectedSalesCompany () {
      return this.$store.state.selectedSalesCompany
    }
  },
  created () {
    this.initializeCardState()
  },
  methods: {
    selectCompany (co) {
      this.$store.dispatch('setSalesCompany', co)
    },
    initializeCardState () {
      this.productList.forEach(product => {
        const firstOption = this.packageOptionsMap[product.id][0]
        this.$set(this.selectedPackageMap, product.id, firstOption.label)
        this.$set(this.quantityMap, product.id, 1)
        this.$set(this.imgReadyMap, product.id, false)
        this.$set(this.imgErrorMap, product.id, false)
      })
    },
    productThumbUrl (product) {
      if (product.image) return product.image
      const label = encodeURIComponent(product.id || 'MSM')
      return `https://placehold.co/320x240/F1F5F9/64748B?text=${label}`
    },
    onImgReady (productId, isError) {
      this.$set(this.imgReadyMap, productId, true)
      if (isError) this.$set(this.imgErrorMap, productId, true)
    },
    setSelectedPackage (productId, packageLabel) {
      this.$set(this.selectedPackageMap, productId, packageLabel)
    },
    selectedOption (productId) {
      const options = this.packageOptionsMap[productId]
      const selectedLabel = this.selectedPackageMap[productId]
      return options.find(option => option.label === selectedLabel) || options[0]
    },
    increaseQty (productId) {
      this.$set(this.quantityMap, productId, this.quantityMap[productId] + 1)
    },
    decreaseQty (productId) {
      const nextQty = Math.max(1, this.quantityMap[productId] - 1)
      this.$set(this.quantityMap, productId, nextQty)
    },
    isNoPrice (productId) {
      const option = this.selectedOption(productId)
      return option.price === 0 && !option.isGift
    },
    addToCart (product) {
      const option = this.selectedOption(product.id)
      const quantity = this.quantityMap[product.id]
      if (option.price === 0 && !option.isGift) return
      this.$store.dispatch('addToCart', {
        productId: product.id,
        productName: product.name,
        image: product.image,
        packageName: option.label,
        unitPrice: option.price,
        quantity
      })
      this.$store.dispatch('showSnackbar', { message: '已加入購物車', type: 'success' })
    }
  }
}
</script>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title-block {
  margin-bottom: 8px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--c-text-title);
  margin: 0;
  letter-spacing: 0.02em;
}

.top-tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.company-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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
  color: var(--c-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.company-tab.active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: var(--c-surface);
  font-weight: 500;
}

/* ── 搜尋列 + 切換 ─────────────────── */
.search-view-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-icon-el {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-faint);
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 12px 0 38px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  color: var(--c-text-body);
  font-size: 14px;
  font-weight: 400;
  outline: none;
}

.search-input::placeholder {
  color: var(--c-text-faint);
  font-weight: 400;
}

/* ── 切換按鈕 ──────────────────────── */
.view-toggle {
  display: flex;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 44px;
  background: var(--c-surface);
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn + .toggle-btn {
  border-left: 0.5px solid var(--c-border);
}

.toggle-btn.active {
  background: var(--c-primary);
  color: #fff;
}

/* ── 格狀 Grid ─────────────────────── */
.products-grid {
  display: grid;
  gap: 12px;
}

/* 格狀模式：桌機 4 欄 */
.view-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* 直列模式 */
.view-list {
  grid-template-columns: 1fr;
  gap: 10px;
}

/* ── 卡片通用 ──────────────────────── */
.product-card {
  border: 0.5px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: 8px;
  background: var(--c-surface);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── 圖片容器 ──────────────────────── */
.product-img-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--c-stripe);
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  border-bottom: 0.5px solid var(--c-divider);
}

.product-img-wrap.is-skeleton {
  background: var(--c-bg);
}

.product-img-wrap.is-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer-prod 1.4s ease-in-out infinite;
}

@keyframes shimmer-prod {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.product-image.is-loaded {
  opacity: 1;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-bg);
}

.placeholder-watermark {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-border);
  letter-spacing: 0.1em;
  user-select: none;
}

/* ── 內容通用 ──────────────────────── */
.product-content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
}

.info-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 5px;
}

.product-name {
  margin: 0;
  color: var(--c-text-body);
  font-size: 13px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-id {
  margin: 0;
  color: #c0c8d4;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.product-desc {
  margin: 2px 0 4px;
  font-size: 11px;
  font-weight: 400;
  color: var(--c-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 格狀模式只顯示 1 行 */
.view-grid .product-desc {
  -webkit-line-clamp: 1;
  line-clamp: 1;
  font-size: 10px;
}

.pkg-area {
  display: flex;
  flex-direction: column;
}

.package-select {
  width: 100%;
  height: 30px;
  padding: 0 24px 0 8px;
  border: 0.5px solid var(--c-border);
  border-radius: 5px;
  background-color: var(--c-surface);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 11px;
  appearance: none;
  -webkit-appearance: none;
  color: var(--c-text-body);
  font-size: 12px;
  font-weight: 400;
  outline: none;
  cursor: pointer;
}

.single-pkg-badge {
  flex-shrink: 0;
  padding: 2px 5px;
  border: 0.5px solid var(--c-border);
  border-radius: 4px;
  background: var(--c-stripe);
  color: var(--c-text-muted);
  font-size: 10px;
  font-weight: 400;
  white-space: nowrap;
}

.price-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.price-text {
  color: var(--c-text-body);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-mono);
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 0.5px solid var(--c-border);
  border-radius: 5px;
  overflow: hidden;
  flex-shrink: 0;
}

.quantity-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: #ffffff;
  color: var(--c-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.quantity-value {
  width: 26px;
  text-align: center;
  color: #334155;
  font-size: 12px;
  font-weight: 500;
}

.price-warning {
  margin: 0;
  color: #b3261e;
  font-size: 11px;
  font-weight: 400;
}

.add-cart-btn {
  width: 100%;
  height: 38px;
  border: none;
  border-radius: 6px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

.add-cart-btn:disabled {
  background: #9ca7ba;
  cursor: not-allowed;
}

/* ── 直列模式覆蓋 ──────────────────── */
.view-list .product-card {
  flex-direction: row;
  min-height: 110px;
}

.view-list .product-img-wrap {
  width: 130px;
  aspect-ratio: unset;
  flex-shrink: 0;
  border-bottom: none;
  border-right: 0.5px solid var(--c-divider);
}

.view-list .product-content {
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
}

.view-list .info-group {
  flex: 1;
  min-width: 0;
}

.view-list .product-name {
  font-size: 14px;
  -webkit-line-clamp: 1;
}

.view-list .action-group {
  flex-shrink: 0;
  align-items: flex-end;
  min-width: 160px;
}

.view-list .add-cart-btn {
  width: auto;
  padding: 0 20px;
  height: 36px;
}

/* ── RWD 768px ─────────────────────── */
@media (max-width: 768px) {
  /* 格狀：手機 3 欄 */
  .view-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .view-grid .product-content {
    padding: 8px;
  }

  .view-grid .product-name {
    font-size: 11px;
  }

  .view-grid .product-id {
    display: none;
  }

  .view-grid .price-text {
    font-size: 11px;
  }

  .view-grid .quantity-btn {
    width: 22px;
    height: 22px;
    font-size: 13px;
  }

  .view-grid .quantity-value {
    width: 20px;
    font-size: 11px;
  }

  .view-grid .add-cart-btn {
    height: 32px;
    font-size: 11px;
  }

  .view-grid .package-select {
    font-size: 10px;
    height: 26px;
  }

  /* 直列：手機圖片縮小 */
  .view-list .product-img-wrap {
    width: 88px;
  }

  .view-list .product-content {
    padding: 10px;
    gap: 10px;
  }

  .view-list .action-group {
    min-width: 100px;
  }

  .view-list .add-cart-btn {
    padding: 0 10px;
    font-size: 12px;
  }

  .view-list .product-name {
    font-size: 13px;
  }
}
</style>

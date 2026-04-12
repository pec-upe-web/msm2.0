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
      <div class="search-wrapper">
        <search-icon :size="16" :stroke-width="1.5" class="search-icon-el" />
        <input
          v-model.trim="keyword"
          class="search-input"
          type="text"
          placeholder="搜尋產品名稱或產品代號"
        />
      </div>
    </div>

    <div class="products-grid">
      <article v-for="product in filteredProducts" :key="product.id" class="product-card">
        <!-- 圖片容器：骨架屏 + 錯誤佔位 -->
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
        <div class="product-content">
          <div class="name-row">
            <h3 class="product-name">{{ product.name }}</h3>
            <span
              v-if="packageOptionsMap[product.id].length === 1"
              class="single-pkg-badge"
            >{{ packageOptionsMap[product.id][0].label }}</span>
          </div>
          <p class="product-id">{{ product.id }}</p>

          <!-- 規格區塊：常態渲染以保持固定高度 -->
          <div class="pkg-area">
            <div v-if="packageOptionsMap[product.id].length > 1" class="package-tabs">
              <button
                v-for="option in packageOptionsMap[product.id]"
                :key="option.label"
                type="button"
                :class="['package-tab', { active: selectedPackageMap[product.id] === option.label }]"
                @click="setSelectedPackage(product.id, option.label)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Flexbox Spacer：將金額與按鈕強制推向底部 -->
          <div class="content-spacer"></div>

          <div class="price-qty-row">
            <span class="price-text">NT$ {{ selectedOption(product.id).price }}</span>
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
      </article>
    </div>
  </div>
</template>

<script>
import { products } from '../mock/products'
import { salesCompanies } from '../mock/salesCompanies'
import { Search as SearchIcon } from 'lucide-vue'

export default {
  name: 'ProductsPage',
  components: { SearchIcon },
  data () {
    return {
      keyword: '',
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

      if (option.price === 0 && !option.isGift) {
        return
      }

      this.$store.dispatch('addToCart', {
        productId: product.id,
        productName: product.name,
        image: product.image,
        packageName: option.label,
        unitPrice: option.price,
        quantity
      })

      this.$store.dispatch('showSnackbar', {
        message: '已加入購物車',
        type: 'success'
      })
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
  color: #8b95a8;
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
  border: 1px solid #E2E8F0;
  background: #ffffff;
  font-size: 13px;
  font-weight: 400;
  color: #64748B;
  cursor: pointer;
  transition: all 0.15s;
}

.company-tab.active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: #ffffff;
  font-weight: 500;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon-el {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 12px 0 38px;
  border: 0.5px solid var(--c-border);
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  outline: none;
}

.search-input::placeholder {
  color: #8b95a8;
  font-weight: 400;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.product-card {
  border: 0.5px solid #E2E8F0;
  border-top: 2px solid var(--c-primary);
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  transition: border-color 0.1s;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  border-color: var(--c-border);
  border-top-color: var(--c-primary);
}

/* ── 圖片容器 ─────────────────── */
.product-img-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #F8FAFC;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  border-bottom: 0.5px solid #F1F5F9;
}

/* 骨架屏閃爍 */
.product-img-wrap.is-skeleton {
  background: #F1F5F9;
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

/* 錯誤佔位圖 */
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
}

.placeholder-watermark {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-border);
  letter-spacing: 0.1em;
  user-select: none;
}

.product-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  margin: 0;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 3rem;
}

.product-id {
  margin: 3px 0 8px;
  color: #c0c8d4;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.package-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-content: flex-start;
}

/* 規格區塊容器：始終佔位 */
.pkg-area {
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.package-tab {
  padding: 6px 10px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background: #ffffff;
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
}

.package-tab.active {
  border-color: var(--c-primary);
  font-weight: 500;
}

.name-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 0;
}

.single-pkg-badge {
  flex-shrink: 0;
  margin-top: 2px;
  padding: 2px 6px;
  border: 0.5px solid var(--c-border);
  border-radius: 4px;
  background: #F8FAFC;
  color: #64748B;
  font-size: 11px;
  font-weight: 400;
  white-space: nowrap;
}

.price-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 0;
}

.price-text {
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-mono);
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  overflow: hidden;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #ffffff;
  color: var(--c-primary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.quantity-value {
  width: 34px;
  text-align: center;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
}

.price-warning {
  margin: 10px 0 0;
  color: #b3261e;
  font-size: 12px;
  font-weight: 400;
}

.content-spacer {
  flex: 1;
}

.add-cart-btn {
  width: 100%;
  height: 44px;
  margin-top: 8px;
  border: none;
  border-radius: 6px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

.add-cart-btn:disabled {
  background: #9ca7ba;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0;
  }

  .product-card {
    min-width: 0;
  }

  .product-content {
    padding: 10px;
  }

  .product-name {
    font-size: 13px;
  }

  .package-tab {
    font-size: 11px;
    padding: 4px 8px;
  }

  .price-text {
    font-size: 13px;
  }

  .quantity-btn {
    width: 26px;
    height: 26px;
    font-size: 14px;
  }

  .quantity-value {
    width: 28px;
    font-size: 12px;
  }

  .add-cart-btn {
    height: 38px;
    font-size: 13px;
    margin-top: 8px;
  }
}
</style>

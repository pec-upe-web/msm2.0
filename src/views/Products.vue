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

    <section class="catalog-banner-placeholder" aria-label="banner 預留區">
      <div class="banner-icon-wrap">
        <image-icon :size="18" :stroke-width="1.5" />
      </div>
      <div class="banner-copy">
        <p class="banner-title">Banner 預留區</p>
        <p class="banner-desc">未來可放促銷圖、活動訊息或品牌視覺。</p>
      </div>
    </section>

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
            <span class="placeholder-watermark">MSM 2</span>
          </div>
          <button
            type="button"
            class="favorite-toggle"
            :class="{ active: isFavorite(product.id) }"
            :aria-label="isFavorite(product.id) ? '取消我的最愛' : '加入我的最愛'"
            @click.stop="toggleFavorite(product.id)"
          >
            <heart-icon
              :size="14"
              :stroke-width="1.8"
              :fill="isFavorite(product.id) ? 'currentColor' : 'none'"
            />
          </button>
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
            <div class="product-id-row">
              <p class="product-id">{{ product.id }}</p>
              <ProductPromotionBadge
                :product-id="product.id"
                :product-name="product.name"
                :promotions="promotionList"
              />
            </div>
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

    <PromotionNotice :promotions="promotionList" />
  </div>
</template>

<script>
import { products } from '../mock/products'
import { salesCompanies } from '../mock/salesCompanies'
import { promotions } from '../mock/promotions'
import ProductPromotionBadge from '../components/ProductPromotionBadge.vue'
import PromotionNotice from '../components/PromotionNotice.vue'
import {
  Search as SearchIcon,
  AlignJustify as AlignJustifyIcon,
  LayoutGrid as LayoutGridIcon,
  Heart as HeartIcon,
  Image as ImageIcon
} from 'lucide-vue'

export default {
  name: 'ProductsPage',
  components: {
    SearchIcon,
    AlignJustifyIcon,
    LayoutGridIcon,
    HeartIcon,
    ImageIcon,
    ProductPromotionBadge,
    PromotionNotice
  },
  data () {
    return {
      keyword: '',
      viewMode: 'grid',
      productList: products,
      promotionList: promotions,
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
    },
    favoriteProductIds () {
      return this.$store.getters.favoriteProductIdsByCompanyId(this.selectedSalesCompany.id)
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
    isFavorite (productId) {
      return this.favoriteProductIds.includes(productId)
    },
    toggleFavorite (productId) {
      const willFavorite = !this.isFavorite(productId)
      this.$store.dispatch('toggleFavoriteProduct', {
        companyId: this.selectedSalesCompany.id,
        productId
      })
      this.$store.dispatch('showSnackbar', {
        message: willFavorite ? '已加入我的最愛' : '已從我的最愛移除',
        type: 'success'
      })
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
        quantity,
        companyId: this.selectedSalesCompany.id
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
  gap: 14px;
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

.catalog-banner-placeholder {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 88px;
  padding: 14px 16px;
  border: 1px dashed rgba(100, 116, 139, 0.35);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(241, 245, 249, 0.72), rgba(255, 255, 255, 0.9));
}

.banner-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-primary);
  background: rgba(37, 99, 235, 0.08);
  flex-shrink: 0;
}

.banner-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-body);
}

.banner-desc {
  margin: 0;
  font-size: 12px;
  color: var(--c-text-muted);
  line-height: 1.5;
}

.promotion-notice-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border: 0.5px solid var(--c-border);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96));
}

.promotion-notice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.promotion-notice-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 0.5px solid var(--c-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  min-width: 0;
}

.promotion-notice-column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.promotion-notice-column-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-title);
}

.promotion-notice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.promotion-notice-empty {
  padding: 14px 10px;
  border: 0.5px dashed var(--c-border);
  border-radius: 10px;
  color: var(--c-text-muted);
  font-size: 12px;
  text-align: center;
  background: rgba(248, 250, 252, 0.72);
}

.promotion-notice-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 0.5px solid var(--c-border);
  border-radius: 10px;
  background: #fff;
}

.promotion-notice-card--button {
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, transform 0.15s, border-color 0.15s;
}

.promotion-notice-card--button:hover {
  background: #FFF7ED;
  border-color: rgba(249, 115, 22, 0.24);
  transform: translateY(-1px);
}

.promotion-notice-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.promotion-notice-name {
  min-width: 0;
  flex: 1;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
  line-height: 1.45;
}

.promotion-notice-desc {
  margin: 0;
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.promotion-notice-gifts {
  margin: 0;
  padding-left: 16px;
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.promotion-notice-more {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  color: #c2410c;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.panel-eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--c-text-faint);
}

.panel-title {
  margin: 0;
  color: var(--c-text-title);
  font-size: 16px;
  font-weight: 600;
}

.panel-hint {
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 1.5;
  text-align: right;
}

.promotion-banner-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border: 0.5px solid var(--c-border);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96));
}

.promotion-banner-carousel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.promotion-carousel-view {
  display: flex;
  align-items: stretch;
  gap: 10px;
  min-width: 0;
}

.promotion-carousel-view--desktop {
  display: flex;
}

.promotion-carousel-view--mobile {
  display: none;
}

.promo-viewport {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.promo-track {
  display: flex;
  width: 100%;
  transition: transform 0.45s ease;
  will-change: transform;
  transform: translate3d(calc(var(--carousel-index, 0) * -50%), 0, 0);
}

.promo-slide {
  display: block;
  color: inherit;
  text-decoration: none;
  min-width: 0;
}

.promo-slide--desktop {
  flex: 0 0 50%;
  padding-right: 12px;
  box-sizing: border-box;
}

.promo-slide--mobile {
  flex: 0 0 100%;
  padding-right: 0;
  box-sizing: border-box;
}

.promo-banner-card {
  height: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 0.5px solid var(--c-border);
  background: #fff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.promo-banner-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}

.promo-banner-card.is-current {
  border-color: rgba(220, 38, 38, 0.25);
  background: linear-gradient(180deg, rgba(255, 247, 247, 0.98), #ffffff);
}

.promo-banner-card.is-future {
  border-color: rgba(100, 116, 139, 0.22);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), #ffffff);
}

.promo-banner-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.promo-banner-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.promo-banner-tag.is-current {
  background: rgba(220, 38, 38, 0.12);
  color: #dc2626;
}

.promo-banner-tag.is-future {
  background: rgba(100, 116, 139, 0.12);
  color: #475569;
}

.promo-banner-id {
  font-size: 11px;
  color: var(--c-text-faint);
}

.promo-banner-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-title);
  line-height: 1.5;
}

.promo-banner-desc {
  margin: 0;
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.promo-banner-gifts {
  margin: 0;
  padding-left: 16px;
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.promo-banner-date {
  margin-top: auto;
  font-size: 11px;
  color: var(--c-text-faint);
}

.promo-nav-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  margin: auto 0;
  border: 1px solid rgba(100, 116, 139, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: var(--c-text-body);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.promo-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.promo-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.42);
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.promo-dot.active {
  width: 24px;
  background: var(--c-primary);
}

.promotion-banner-empty {
  padding: 18px 12px;
  border-radius: 12px;
  border: 0.5px dashed var(--c-border);
  background: rgba(255, 255, 255, 0.76);
  color: var(--c-text-muted);
  font-size: 12px;
  text-align: center;
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
  grid-template-columns: repeat(auto-fit, minmax(188px, 1fr));
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
  border-radius: 10px;
  background: var(--c-surface);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── 圖片容器 ──────────────────────── */
.product-img-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
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

.favorite-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.68);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.favorite-toggle:hover {
  transform: translateY(-1px);
}

.favorite-toggle.active {
  background: #ef4444;
  color: #fff;
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
  padding: 9px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 7px;
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
  gap: 4px;
}

.product-name {
  margin: 0;
  color: var(--c-text-body);
  font-size: 12px;
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

.product-id-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.product-desc {
  margin: 1px 0 2px;
  font-size: 10px;
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
  font-size: 9px;
}

.pkg-area {
  display: flex;
  flex-direction: column;
}

.package-select {
  width: 100%;
  height: 28px;
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
  font-size: 11px;
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
  font-size: 12px;
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
  width: 24px;
  height: 24px;
  border: none;
  background: #ffffff;
  color: var(--c-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.quantity-value {
  width: 24px;
  text-align: center;
  color: #334155;
  font-size: 11px;
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
  height: 34px;
  border: none;
  border-radius: 6px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

.add-cart-btn:disabled {
  background: #9ca7ba;
  cursor: not-allowed;
}

/* ── 促銷 Modal ───────────────────── */
.promotion-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(15, 23, 42, 0.46);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.promotion-modal {
  position: relative;
  width: min(560px, 100%);
  max-height: min(84vh, 760px);
  overflow: hidden;
  border-radius: 16px;
  background: var(--c-surface);
  border: 0.5px solid var(--c-border);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.24);
  display: flex;
  flex-direction: column;
}

.promotion-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.promotion-modal-head {
  padding: 20px 20px 12px;
  border-bottom: 0.5px solid var(--c-divider);
}

.promotion-modal-eyebrow {
  margin: 0 0 4px;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--c-text-faint);
}

.promotion-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-title);
  line-height: 1.4;
}

.promotion-modal-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--c-text-muted);
}

.promotion-modal-list {
  padding: 16px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.promotion-modal-card {
  border: 0.5px solid var(--c-border);
  border-radius: 12px;
  padding: 14px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.promotion-modal-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.promotion-modal-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-title);
}

.promotion-modal-period,
.promotion-modal-desc,
.promotion-modal-condition,
.promotion-modal-gifts {
  font-size: 13px;
  color: var(--c-text-body);
  line-height: 1.6;
}

.promotion-modal-label {
  display: inline-block;
  margin-right: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-muted);
}

.promotion-modal-text {
  color: var(--c-text-body);
}

.promotion-modal-gifts ul {
  margin: 6px 0 0;
  padding-left: 18px;
}

.promotion-modal-footer {
  padding: 0 20px 20px;
}

.promotion-modal-btn {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #1f2937;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.promotion-modal-empty {
  padding: 20px;
  color: var(--c-text-muted);
  font-size: 13px;
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
  .promotion-notice-grid {
    grid-template-columns: 1fr;
  }

  .panel-head {
    flex-direction: column;
  }

  .panel-hint {
    text-align: left;
  }

  .promotion-carousel-view--desktop {
    display: none;
  }

  .promotion-carousel-view--mobile {
    display: flex;
  }

  .promo-track {
    transform: translate3d(calc(var(--carousel-index, 0) * -100%), 0, 0);
  }

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

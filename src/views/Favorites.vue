<template>
  <div class="favorites-page">
    <div class="page-title-block">
      <span class="eyebrow">MSM-CORE / FAVORITES</span>
      <h2 class="page-title">我的最愛</h2>
    </div>

    <div class="top-tools">
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
    </div>

    <template v-if="favoriteProducts.length">
      <div class="favorites-grid">
        <article v-for="product in favoriteProducts" :key="product.id" class="favorite-card">
          <div class="favorite-image-wrap">
            <img
              v-show="!imgErrorMap[product.id]"
              class="favorite-image"
              :class="{ 'is-loaded': imgReadyMap[product.id] }"
              :src="productThumbUrl(product)"
              :alt="product.name"
              @load="onImgReady(product.id, false)"
              @error="onImgReady(product.id, true)"
            />
            <div v-if="imgErrorMap[product.id]" class="favorite-image-fallback">
              <heart-icon :size="18" :stroke-width="1.5" />
            </div>
          </div>

          <div class="favorite-content">
            <div class="favorite-head">
              <h3 class="favorite-name">{{ product.name }}</h3>
            </div>
            <div class="favorite-id-row">
              <p class="favorite-id">{{ product.id }}</p>
              <ProductPromotionBadge
                :product-id="product.id"
                :product-name="product.name"
                :promotions="promotionList"
              />
            </div>
            <p v-if="product.description" class="favorite-desc">{{ product.description }}</p>

            <div class="favorite-controls">
              <select
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

              <div class="price-row">
                <span class="price-text">$ {{ selectedOption(product.id).price }}</span>
                <div class="quantity-control">
                  <button type="button" class="quantity-btn" @click="decreaseQty(product.id)">-</button>
                  <span class="quantity-value">{{ quantityMap[product.id] }}</span>
                  <button type="button" class="quantity-btn" @click="increaseQty(product.id)">+</button>
                </div>
              </div>
            </div>

            <div class="favorite-actions">
              <button type="button" class="cart-btn" @click="addToCart(product)">加入購物車</button>
              <button type="button" class="remove-btn" @click="removeFavorite(product.id)">取消收藏</button>
            </div>
          </div>
        </article>
      </div>
    </template>

    <section v-else class="empty-state">
      <heart-icon :size="34" :stroke-width="1.5" class="empty-icon" />
      <h3 class="empty-title">目前還沒有收藏商品</h3>
      <p class="empty-desc">
        你可以先到商品目錄點選愛心，系統會把商品加入這一頁，方便你之後快速查看與下單。
      </p>
      <router-link to="/products" class="empty-cta">前往商品目錄</router-link>
    </section>

    <PromotionNotice :promotions="promotionList" />
  </div>
</template>

<script>
import { products } from '../mock/products'
import { promotions } from '../mock/promotions'
import { salesCompanies } from '../mock/salesCompanies'
import ProductPromotionBadge from '../components/ProductPromotionBadge.vue'
import PromotionNotice from '../components/PromotionNotice.vue'
import { Heart as HeartIcon } from 'lucide-vue'

export default {
  name: 'FavoritesPage',
  components: { HeartIcon, ProductPromotionBadge, PromotionNotice },
  data () {
    return {
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
    selectedSalesCompany () {
      return this.$store.state.selectedSalesCompany || this.salesCompanies[0]
    },
    favoriteProductIds () {
      return this.$store.getters.favoriteProductIdsByCompanyId(this.selectedSalesCompany.id)
    },
    packageOptionsMap () {
      const map = {}
      this.favoriteProducts.forEach(product => {
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
    favoriteProducts () {
      const productMap = new Map(this.productList.map(product => [product.id, product]))
      return this.favoriteProductIds
        .map(id => productMap.get(id))
        .filter(Boolean)
    }
  },
  created () {
    this.initializeState()
  },
  watch: {
    favoriteProductIds: {
      immediate: true,
      handler () {
        this.initializeState()
      }
    }
  },
  methods: {
    selectCompany (co) {
      this.$store.dispatch('setSalesCompany', co)
    },
    initializeState () {
      this.favoriteProducts.forEach(product => {
        const firstOption = this.packageOptionsMap[product.id][0]
        if (!firstOption) return
        if (!this.selectedPackageMap[product.id]) {
          this.$set(this.selectedPackageMap, product.id, firstOption.label)
        }
        if (!this.quantityMap[product.id]) {
          this.$set(this.quantityMap, product.id, 1)
        }
        if (typeof this.imgReadyMap[product.id] === 'undefined') {
          this.$set(this.imgReadyMap, product.id, false)
        }
        if (typeof this.imgErrorMap[product.id] === 'undefined') {
          this.$set(this.imgErrorMap, product.id, false)
        }
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
      const options = this.packageOptionsMap[productId] || []
      const selectedLabel = this.selectedPackageMap[productId]
      return options.find(option => option.label === selectedLabel) || options[0] || { price: 0, label: '' }
    },
    increaseQty (productId) {
      this.$set(this.quantityMap, productId, (this.quantityMap[productId] || 1) + 1)
    },
    decreaseQty (productId) {
      const nextQty = Math.max(1, (this.quantityMap[productId] || 1) - 1)
      this.$set(this.quantityMap, productId, nextQty)
    },
    addToCart (product) {
      const option = this.selectedOption(product.id)
      const quantity = this.quantityMap[product.id] || 1
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
    },
    removeFavorite (productId) {
      this.$store.dispatch('removeFavoriteProduct', {
        companyId: this.selectedSalesCompany.id,
        productId
      })
      this.$delete(this.selectedPackageMap, productId)
      this.$delete(this.quantityMap, productId)
      this.$delete(this.imgReadyMap, productId)
      this.$delete(this.imgErrorMap, productId)
      this.$store.dispatch('showSnackbar', { message: '已從我的最愛移除', type: 'success' })
    }
  }
}
</script>

<style scoped>
.favorites-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-title-block {
  margin-bottom: 4px;
}

.top-tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
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

.company-tab:hover:not(.active) {
  background: #f8fafc;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--c-text-title);
  margin: 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 188px);
  gap: 12px;
  justify-content: start;
  align-content: start;
}

.favorite-card {
  border: 0.5px solid var(--c-border);
  border-top: 2px solid #ef4444;
  border-radius: 12px;
  overflow: hidden;
  background: var(--c-surface);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.favorite-image-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--c-stripe);
  border-bottom: 0.5px solid var(--c-divider);
}

.favorite-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.favorite-image.is-loaded {
  opacity: 1;
}

.favorite-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-border);
  background: var(--c-bg);
}

.favorite-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.favorite-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.favorite-id-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.favorite-name {
  margin: 0;
  color: var(--c-text-body);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.favorite-id {
  margin: 0;
  color: #94a3b8;
  font-size: 11px;
  letter-spacing: 0.05em;
}

.favorite-desc {
  margin: 0;
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.favorite-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.package-select {
  width: 100%;
  height: 30px;
  padding: 0 24px 0 8px;
  border: 0.5px solid var(--c-border);
  border-radius: 6px;
  background-color: var(--c-surface);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 11px;
  appearance: none;
  -webkit-appearance: none;
  color: var(--c-text-body);
  font-size: 11px;
  outline: none;
  cursor: pointer;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
  border-radius: 6px;
  overflow: hidden;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #fff;
  color: var(--c-primary);
  cursor: pointer;
}

.quantity-value {
  width: 24px;
  text-align: center;
  font-size: 11px;
  color: #334155;
}

.favorite-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-btn,
.remove-btn,
.empty-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.cart-btn {
  height: 36px;
  background: var(--c-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.remove-btn {
  height: 36px;
  border: 0.5px solid rgba(239, 68, 68, 0.55);
  background: #ffffff;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 500;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.04);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 320px;
  padding: 24px;
  text-align: center;
  border: 0.5px dashed var(--c-border);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(241,245,249,0.82));
}

.empty-icon {
  color: #ef4444;
}

.empty-title {
  margin: 0;
  font-size: 18px;
  color: var(--c-text-title);
}

.empty-desc {
  max-width: 420px;
  margin: 0;
  color: var(--c-text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.empty-cta {
  padding: 0 16px;
  height: 38px;
  background: var(--c-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 640px) {
  .company-tabs {
    width: 100%;
  }

  .company-tab {
    padding: 5px 12px;
  }

  .favorites-grid {
    grid-template-columns: repeat(3, calc((100% - 16px) / 3));
    gap: 8px;
  }

  .favorite-actions {
    flex-direction: column;
  }

  .remove-btn {
    background: #ffffff;
  }
}
</style>

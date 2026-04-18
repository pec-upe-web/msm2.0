<template>
  <div class="order-review-page">

    <!-- 頂部操作列 -->
    <div class="top-bar">
      <button type="button" class="back-btn" @click="$router.push(isNew ? '/orders' : '/orders/' + orderId)">
        <chevron-left-icon :size="16" :stroke-width="1.5" />
        {{ isNew ? '返回訂單列表' : '返回訂單詳情' }}
      </button>
    </div>

    <!-- 頁面標題 -->
    <div class="page-title-block">
      <span class="eyebrow">MSM-CORE / {{ isNew ? 'NEW ORDER' : 'ORDER REVIEW' }}</span>
      <div class="title-row">
        <h2 class="page-title">{{ isNew ? '新增客戶訂單' : '訂單審核' }}</h2>
        <span class="title-en-badge">{{ isNew ? 'NEW ORDER' : 'ORDER REVIEW' }}</span>
      </div>
    </div>

    <!-- 頂部資訊列 -->
    <section class="info-card">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">訂單編號</span>
          <span class="info-value order-id-text">{{ orderId }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">客戶名稱</span>
            <span class="info-value">{{ customerName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">預計到貨日</span>
          <input v-model="deliveryDate" type="date" class="edit-input delivery-input" />
        </div>
        <div class="info-item">
          <span class="info-label">配送單位</span>
          <select v-model="orderDeliveryUnit" class="edit-input edit-select">
            <option v-for="du in deliveryUnitOptions" :key="du" :value="du">{{ du }}</option>
          </select>
        </div>
      </div>
    </section>

    <!-- 桌機可編輯明細表格 -->
    <div class="table-section">
      <div class="table-scroll">
        <table class="review-table">
          <thead>
            <tr>
              <th>來源</th>
              <th>產品代號</th>
              <th>產品名稱</th>
              <th>包裝別</th>
              <th class="col-num">單位<br/>數量</th>
              <th class="col-num">當前<br/>庫存</th>
              <th class="col-num">剩餘<br/>庫存</th>
              <th class="col-num">單價</th>
              <th class="col-num">小計</th>
              <th class="col-action">贈品調整</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in editRows"
              :key="row._rowId"
              :class="['review-row', row._cancelled ? 'row-cancelled' : rowBgClass(row.source, row.isGift), stockRowClass(row)]"
            >
              <td>
                <span :class="['source-badge', 'source--' + row.source]">{{ sourceLabel(row.source) }}</span>
              </td>
              <td>
                <div v-if="row.source === 'sales_add'" class="search-wrap">
                  <input
                    v-if="productSearchIdx === idx"
                    :ref="'psearch_' + idx"
                    v-model="productSearch"
                    class="edit-input code-input"
                    placeholder="輸入代號或名稱"
                    @blur="closeProductSearch"
                  />
                  <span v-else class="cell-text code-chip" @click="openProductSearch(idx)">
                    {{ row.productId || '+ 選取產品' }}
                  </span>
                  <!-- 搜尋下拉 -->
                  <ul v-if="productSearchIdx === idx && searchedProducts.length" class="search-dropdown">
                    <li
                      v-for="p in searchedProducts"
                      :key="p.id"
                      class="search-item"
                      @mousedown.prevent="selectProductFromSearch(p)"
                    >
                      <span class="si-id">{{ p.id }}</span>
                      <span class="si-name">{{ p.name }}</span>
                      <span class="si-price">$ {{ p.packages && p.packages[0] ? p.packages[0].price.toLocaleString() : 0 }}</span>
                    </li>
                  </ul>
                </div>
                <span v-else class="cell-text">{{ row.productId || '—' }}</span>
              </td>
              <td>
                <input
                  v-if="row.source === 'sales_add'"
                  v-model="row.name"
                  class="edit-input name-input"
                  placeholder="產品名稱"
                />
                <span v-else class="cell-text">{{ row.name }}</span>
              </td>
              <td>
                <select
                  v-model="row.package"
                  class="edit-input edit-select"
                  :disabled="row.source === 'system_gift'"
                  @change="onPackageChange(idx)"
                >
                  <option v-for="pkg in packageOptions" :key="pkg" :value="pkg">{{ pkg }}</option>
                </select>
              </td>
              <td class="col-num">
                <div class="qty-pair">
                  <input
                    v-model.number="row.mainQty"
                    type="number"
                    min="0"
                    class="edit-input num-input"
                     :disabled="row.source === 'system_gift'"
                    @change="onQtyChange()"
                  />
                  <span class="qty-sep">/</span>
                  <input
                    v-model.number="row.subQty"
                    type="number"
                    min="0"
                    class="edit-input num-input"
                     :disabled="row.source === 'system_gift'"
                     @input="onSubQtyInput(idx)"
                  />
                </div>
              </td>
              <td class="col-num">
                <span
                  class="cell-text readonly-text stock-mono"
                >{{ getWarehouseStock(row.productId) }}</span>
              </td>
              <td class="col-num">
                <span
                  class="cell-text stock-mono"
                  :class="stockValueClass(row)"
                >{{ remainingStock(row) }}</span>
              </td>
              <td class="col-num">
                <div class="price-cell">
                  <input
                    v-model.number="row.unitPrice"
                    type="number"
                    min="0"
                    class="edit-input num-input"
                    :disabled="row.isGift || row.source === 'customer'"
                  />
                  <span v-if="row.noPrice" class="price-warn" title="無價格資料">⚠</span>
                </div>
              </td>
              <td class="col-num">
                <span class="cell-text readonly-text">{{ row.isGift ? '—' : rowSubtotal(row) }}</span>
              </td>
              <td class="col-action">
                <!-- 系統贈品：取消 / 還原 -->
                <template v-if="row.source === 'system_gift'">
                  <button v-if="row._cancelled" type="button" class="row-btn restore-btn" @click="restoreGiftRow(idx)">還原贈品</button>
                  <button v-else type="button" class="row-btn cancel-btn" @click="cancelGiftRow(idx)">取消</button>
                </template>
                <!-- 手動改為贈品後：還原 + (sales_add 才顯示刪除) -->
                <template v-else-if="row.isGift">
                  <button type="button" class="row-btn revert-gift-btn" @click="toggleGift(idx)">還原</button>
                  <button v-if="row.source === 'sales_add'" type="button" class="row-btn delete-btn" @click="removeRow(idx)">
                    <trash2-icon :size="13" :stroke-width="1.5" />
                  </button>
                </template>
                <!-- 一般列：改贈品 + (sales_add 才顯示刪除) -->
                <template v-else>
                  <button type="button" class="row-btn to-gift-btn" @click="toggleGift(idx)">改贈品</button>
                  <button v-if="row.source === 'sales_add'" type="button" class="row-btn delete-btn" @click="removeRow(idx)">
                    <trash2-icon :size="13" :stroke-width="1.5" />
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="add-row-foot">
              <td colspan="10">
                <button type="button" class="add-row-btn" @click="addRow">+ 新增品項</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- 手機卡片列表 -->
    <ul class="mobile-cards">
      <li
        v-for="(row, idx) in editRows"
        :key="'m_' + row._rowId"
        :class="['mobile-card', row._cancelled ? 'bg-cancelled' : rowBgClass(row.source, row.isGift)]"
      >
        <div class="mc-header">
          <span :class="['source-badge', 'source--' + row.source]">{{ sourceLabel(row.source) }}</span>
          <div class="mc-actions">
            <template v-if="row.source === 'system_gift'">
              <button v-if="row._cancelled" type="button" class="row-btn restore-btn" @click="restoreGiftRow(idx)">還原贈品</button>
              <button v-else type="button" class="row-btn cancel-btn" @click="cancelGiftRow(idx)">取消</button>
            </template>
            <template v-else-if="row.isGift">
              <button type="button" class="row-btn revert-gift-btn" @click="toggleGift(idx)">還原</button>
              <button v-if="row.source === 'sales_add'" type="button" class="row-btn delete-btn" @click="removeRow(idx)">
                <trash2-icon :size="13" :stroke-width="1.5" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="row-btn to-gift-btn" @click="toggleGift(idx)">改贈品</button>
              <button v-if="row.source === 'sales_add'" type="button" class="row-btn delete-btn" @click="removeRow(idx)">
                <trash2-icon :size="13" :stroke-width="1.5" />
              </button>
            </template>
          </div>
        </div>

        <div class="mc-row">
          <span class="mc-label">產品代號</span>
          <div v-if="row.source === 'sales_add'" class="search-wrap">
            <input
              v-if="productSearchIdx === idx"
              :ref="'psearch_m_' + idx"
              v-model="productSearch"
              class="edit-input code-input"
              placeholder="輸入代號或名稱"
              @blur="closeProductSearch"
            />
            <span v-else class="cell-text code-chip" @click="openProductSearch(idx)">
              {{ row.productId || '+ 選取產品' }}
            </span>
            <ul v-if="productSearchIdx === idx && searchedProducts.length" class="search-dropdown">
              <li
                v-for="p in searchedProducts"
                :key="p.id"
                class="search-item"
                @mousedown.prevent="selectProductFromSearch(p)"
              >
                <span class="si-id">{{ p.id }}</span>
                <span class="si-name">{{ p.name }}</span>
                <span class="si-price">$ {{ p.price }}</span>
              </li>
            </ul>
          </div>
          <span v-else class="mc-value">{{ row.productId || '—' }}</span>
        </div>
        <div class="mc-row">
          <span class="mc-label">產品名稱</span>
          <input
            v-if="row.source === 'sales_add'"
            v-model="row.name"
            class="edit-input name-input"
            placeholder="產品名稱"
          />
          <span v-else class="mc-value">{{ row.name }}</span>
        </div>
        <div class="mc-row">
          <span class="mc-label">包裝別</span>
          <select
            v-model="row.package"
            class="edit-input edit-select"
            :disabled="row.source === 'system_gift'"
            @change="onPackageChange(idx)"
          >
            <option v-for="pkg in packageOptions" :key="pkg" :value="pkg">{{ pkg }}</option>
          </select>
        </div>
        <div class="mc-row">
          <span class="mc-label">單位數量</span>
          <div class="qty-pair">
            <input
              v-model.number="row.mainQty"
              type="number"
              min="0"
              class="edit-input num-input"
              :disabled="row.source === 'system_gift'"
              @change="onQtyChange()"
            />
            <span class="qty-sep">/</span>
            <input
              v-model.number="row.subQty"
              type="number"
              min="0"
              class="edit-input num-input"
              :disabled="row.source === 'system_gift'"
              @input="onSubQtyInput(idx)"
            />
          </div>
        </div>
        <div class="mc-row">
          <span class="mc-label">當前庫存</span>
          <span class="mc-value stock-mono">{{ getWarehouseStock(row.productId) }}</span>
        </div>
        <div class="mc-row">
          <span class="mc-label">剩餘庫存</span>
          <span class="mc-value stock-mono" :class="stockValueClass(row)">{{ remainingStock(row) }}</span>
        </div>
        <div class="mc-row">
          <span class="mc-label">單價</span>
          <div class="price-cell">
            <input
              v-model.number="row.unitPrice"
              type="number"
              min="0"
              class="edit-input num-input"
              :disabled="row.isGift || row.source === 'customer'"
            />
            <span v-if="row.noPrice" class="price-warn" title="無價格資料">⚠</span>
          </div>
        </div>
        <div class="mc-row">
          <span class="mc-label">小計</span>
          <span class="mc-value mc-subtotal">{{ row.isGift ? '—' : rowSubtotal(row) }}</span>
        </div>
      </li>
      <li class="mobile-add-item">
        <button type="button" class="add-row-btn" @click="addRow">+ 新增品項</button>
      </li>
    </ul>

    <!-- 底部操作區 -->
    <div class="bottom-bar">
      <div class="total-area">
        <span class="total-label">訂單金額小計</span>
        <span class="total-amount">$ {{ totalAmount.toLocaleString() }}</span>
      </div>
      <div class="bottom-actions">
        <button type="button" class="submit-btn" @click="submitOrder">確認拋轉</button>
      </div>
    </div>

  </div>
</template>

<script>
import { orderDetails } from '../mock/orderDetails'
import { products } from '../mock/products'
import { promotions } from '../mock/promotions'
import { customers } from '../mock/customers'
import { ChevronLeft as ChevronLeftIcon, Trash2 as Trash2Icon } from 'lucide-vue'

// 各倉庫各產品 mock 庫存
const MOCK_STOCKS_BY_WAREHOUSE = {
  '台北倉': { P001: 45, P002: 28, P003: 120, P004: 60, P005: 200, P006: 15, P007: 80, P008: 35, P009: 90, P010: 150 },
  '新北倉': { P001: 30, P002: 50, P003:  80, P004: 40, P005: 160, P006: 25, P007: 60, P008: 20, P009: 70, P010: 100 },
  '桃園倉': { P001: 20, P002: 15, P003:  60, P004: 90, P005: 120, P006: 10, P007: 45, P008: 55, P009: 30, P010:  80 },
  '台中倉': { P001: 60, P002: 35, P003:  90, P004: 25, P005: 180, P006: 40, P007: 70, P008: 40, P009: 110, P010: 130 },
  '高雄倉': { P001: 15, P002: 45, P003:  70, P004: 80, P005: 100, P006: 30, P007: 55, P008: 65, P009: 50, P010:  90 }
}

// 預設庫存（供 buildRow 初始化用）
const MOCK_STOCKS = MOCK_STOCKS_BY_WAREHOUSE['台北倉']

let rowIdCounter = 1

// 根據包裝別名稱提取並計算係數
function getConversionRateFromPackageName (packageName) {
  if (!packageName) return 1
  // 從包裝別名稱提取數字（如 束/6罐 -> 6, 打/12罐 -> 12, 箱/24罐 -> 24, 單罐 -> 1)
  const match = packageName.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

const DEFAULT_WAREHOUSE = '台北倉'

function buildRow (item) {
  const product = products.find(p => p.name === item.name)
  const productId = product ? product.id : ''
  const currentStock = MOCK_STOCKS[productId] !== undefined ? MOCK_STOCKS[productId] : 0
  const packageName = item.package || (product && Array.isArray(product.packages) && product.packages[0] ? product.packages[0].name : '')
  const conversionRate = getConversionRateFromPackageName(packageName)
  const unitPrice = item.unitPrice || 0
  const promoId = item.source === 'system_gift'
    ? ((promotions.find(p => p.gifts.some(g => g.name === item.name)) || {}).id || null)
    : null
  return {
    _rowId: rowIdCounter++,
    _promoId: promoId,
    _cancelled: false,
    source: item.source,
    productId,
    name: item.name,
    package: packageName,
    mainQty: item.qty || 0,
    subQty: 0,
    currentStock,
    conversionRate,
    unitPrice,
    _originalPrice: unitPrice,
    isGift: !!item.isGift,
    noPrice: false
  }
}

function newSalesRow () {
  return {
    _rowId: rowIdCounter++,
    _promoId: null,
    source: 'sales_add',
    productId: '',
    name: '',
    package: '單罐',
    mainQty: 1,
    subQty: 0,
    currentStock: 0,
    conversionRate: 1,
    unitPrice: 0,
    _originalPrice: 0,
    isGift: false,
    noPrice: false
  }
}

function newGiftRow (gift, promoId) {
  return {
    _rowId: rowIdCounter++,
    _promoId: promoId,
    _cancelled: false,
    source: 'system_gift',
    productId: '',
    name: gift.name,
    package: '單罐',
    mainQty: gift.quantity,
    subQty: 0,
    currentStock: 0,
    conversionRate: 1,
    unitPrice: 0,
    isGift: true,
    noPrice: false
  }
}

export default {
  name: 'OrderReviewPage',
  components: { ChevronLeftIcon, Trash2Icon },
  props: ['orderId'],
  data () {
    // isNew：網址為 /orders/new/review
    const isNew = !this.orderId || this.orderId === 'new'
    const detail = isNew ? {} : (orderDetails[this.orderId] || {})
    const sourceItems = detail.items || []
    return {
      isNew,
      deliveryDate: detail.deliveryDate || '',
      orderDeliveryUnit: detail.deliveryUnit || DEFAULT_WAREHOUSE,
      editRows: isNew ? [newSalesRow()] : sourceItems.map(item => buildRow(item)),
      promotions,
      // 行內搜尋
      productSearch: '',
      productSearchIdx: null   // 哪一列正在搜尋
    }
  },
  computed: {
    order () {
      if (this.isNew) return null
      return this.$store.state.orders.find(o => o.orderId === this.orderId) || null
    },
    customerName () {
      // 新增單：從 query 取 customerId
      if (this.isNew) {
        const cid = this.$route.query.customerId
        const c = customers.find(c => c.id === cid)
        return c ? c.name : (cid || '—')
      }
      if (!this.order) return '—'
      const c = customers.find(c => c.id === this.order.customerId)
      return c ? c.name : (this.order.customerId || '—')
    },
    // 行內產品搜尋結果
    searchedProducts () {
      const kw = (this.productSearch || '').trim().toLowerCase()
      if (!kw) return []
      return products.filter(p =>
        p.id.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
      ).slice(0, 8)
    },
    packageOptions () {
      const opts = []
      products.forEach(p => {
        if (Array.isArray(p.packages)) {
          p.packages.forEach(pkg => {
            if (!opts.includes(pkg.name)) opts.push(pkg.name)
          })
        }
      })
      return opts
    },
    deliveryUnitOptions () {
      return ['台北倉', '新北倉', '桃園倉', '台中倉', '高雄倉']
    },
    totalAmount () {
      return this.editRows.reduce((sum, row) => {
        if (row.isGift) return sum
        return sum + (row.mainQty || 0) * (row.unitPrice || 0)
      }, 0)
    }
  },
  methods: {
    sourceLabel (source) {
      const map = { customer: '客戶送單', sales_add: '業務新增', system_gift: '系統贈品' }
      return map[source] || source
    },
    rowBgClass (source, isGift) {
      if (isGift) return 'bg-gift'
      const map = { customer: 'bg-customer', sales_add: 'bg-sales', system_gift: 'bg-gift' }
      return map[source] || ''
    },
    stockRowClass (row) {
      if (row.isGift || !row.productId) return ''
      const rem = this.remainingStock(row)
      if (rem < 0) return 'row-oversell'
      return ''
    },
    stockValueClass (row) {
      if (row.isGift || !row.productId) return ''
      const rem = this.remainingStock(row)
      if (rem < 0) return 'is-negative'
      if (rem <= 10) return 'is-tight'
      return ''
    },
    getWarehouseStock (productId) {
      if (!productId) return 0
      const stocks = MOCK_STOCKS_BY_WAREHOUSE[this.orderDeliveryUnit] || {}
      return stocks[productId] !== undefined ? stocks[productId] : 0
    },
    remainingStock (row) {
      if (!row.productId) return 0
      const stock = this.getWarehouseStock(row.productId)
      const rate = row.conversionRate || 1
      const usedQty = this.editRows
        .filter(r => r.productId === row.productId)
        .reduce((sum, r) => sum + (r.mainQty || 0) * rate + (r.subQty || 0), 0)
      return stock - usedQty
    },
    rowSubtotal (row) {
      const val = (row.mainQty || 0) * (row.unitPrice || 0)
      return '$ ' + val.toLocaleString()
    },
    normalizeSubQty (idx) {
      const row = this.editRows[idx]
      if (!row) return
      const rate = Math.max(1, Number(row.conversionRate) || 1)
      if (rate !== row.conversionRate) {
        this.$set(this.editRows[idx], 'conversionRate', rate)
      }
      if (rate <= 1) return
      const sub = Math.max(0, Number(row.subQty) || 0)
      if (sub >= rate) {
        this.$set(this.editRows[idx], 'mainQty', (row.mainQty || 0) + Math.floor(sub / rate))
        this.$set(this.editRows[idx], 'subQty', sub % rate)
      }
    },
    onSubQtyInput (idx) {
      this.normalizeSubQty(idx)
      this.onQtyChange()
    },
    onProductIdChange (idx) {
      const row = this.editRows[idx]
      const product = products.find(p => p.id === row.productId)
      if (product) {
        const firstPkg = Array.isArray(product.packages) && product.packages[0] ? product.packages[0] : null
        this.$set(this.editRows[idx], 'name', product.name)
        const pkgName = firstPkg ? firstPkg.name : ''
        this.$set(this.editRows[idx], 'package', pkgName)
        this.$set(this.editRows[idx], 'unitPrice', firstPkg ? firstPkg.price : 0)
        const rate = getConversionRateFromPackageName(pkgName)
        this.$set(this.editRows[idx], 'conversionRate', rate)
        this.$set(this.editRows[idx], 'currentStock', MOCK_STOCKS[product.id] || 0)
        this.$set(this.editRows[idx], 'noPrice', !firstPkg || (firstPkg.price === 0 && !row.isGift))
        this.normalizeSubQty(idx)
      }
      this.recalcPromotions()
    },
    onPackageChange (idx) {
      const row = this.editRows[idx]
      const product = products.find(p => p.id === row.productId)
      if (product && Array.isArray(product.packages)) {
        const pkg = product.packages.find(p => p.name === row.package)
        const price = pkg ? pkg.price : 0
        this.$set(this.editRows[idx], 'unitPrice', price)
        this.$set(this.editRows[idx], 'noPrice', price === 0 && !row.isGift)
        const rate = getConversionRateFromPackageName(row.package)
        this.$set(this.editRows[idx], 'conversionRate', rate)
        this.normalizeSubQty(idx)
      }
      this.recalcPromotions()
    },
    onQtyChange () {
      this.recalcPromotions()
    },
    toggleGift (idx) {
      const row = this.editRows[idx]
      if (row.isGift) {
        this.$set(this.editRows[idx], 'isGift', false)
        this.$set(this.editRows[idx], 'unitPrice', row._originalPrice || 0)
      } else {
        this.$set(this.editRows[idx], '_originalPrice', row.unitPrice)
        this.$set(this.editRows[idx], 'isGift', true)
        this.$set(this.editRows[idx], 'unitPrice', 0)
      }
    },
    cancelGiftRow (idx) {
      const row = this.editRows[idx]
      this.$set(this.editRows[idx], '_cancelledQty', row.mainQty)
      this.$set(this.editRows[idx], 'mainQty', 0)
      this.$set(this.editRows[idx], '_cancelled', true)
    },
    restoreGiftRow (idx) {
      const row = this.editRows[idx]
      this.$set(this.editRows[idx], 'mainQty', row._cancelledQty || row.mainQty)
      this.$set(this.editRows[idx], '_cancelled', false)
    },
    addRow () {
      this.editRows.push(newSalesRow())
    },
    removeRow (idx) {
      this.editRows.splice(idx, 1)
    },
    recalcPromotions () {
      this.promotions.forEach(promo => {
        let isMet = false
        if (promo.minTotalQty !== undefined) {
          const totalQty = this.editRows
            .filter(r => !r.isGift)
            .reduce((sum, r) => sum + (r.mainQty || 0), 0)
          isMet = totalQty >= promo.minTotalQty
        } else if (promo.targetProductId) {
          const matched = this.editRows.find(r => r.productId === promo.targetProductId && !r.isGift)
          isMet = !!matched && (matched.mainQty || 0) >= promo.minQty
        }
        promo.gifts.forEach(gift => {
          const existingIdx = this.editRows.findIndex(
            r => r.source === 'system_gift' && r._promoId === promo.id && r.name === gift.name
          )
          if (isMet) {
            // 條件達成：沒有任何行（含已取消）才新增
            if (existingIdx === -1) {
              this.editRows.push(newGiftRow(gift, promo.id))
            }
          } else {
            // 條件未達成：移除該贈品行（含已取消的）
            if (existingIdx !== -1) {
              this.editRows.splice(existingIdx, 1)
            }
          }
        })
      })
    },
    submitOrder () {
      if (this.isNew) {
        // 產生新訂單號（SO- + 時間戳末6碼）
        const newId = 'SO-' + Date.now().toString().slice(-6)
        const customerId = this.$route.query.customerId || ''
        const amount = this.totalAmount
        const newOrder = {
          orderId: newId,
          customerId,
          status: 'transferred',
          amount,
          date: new Date().toISOString().slice(0, 10)
        }
        this.$store.dispatch('addOrder', newOrder)
        this.$store.dispatch('showSnackbar', { message: '訂單已建立', type: 'success' })
        this.$router.push('/orders')
        return
      }
      this.$store.dispatch('updateOrderStatus', { orderId: this.orderId, status: 'transferred' })
      this.$store.dispatch('showSnackbar', { message: '訂單已確認送出', type: 'success' })
      this.$router.push('/orders')
    },
    // 行內產品搜尋
    openProductSearch (idx) {
      this.productSearchIdx = idx
      this.productSearch = this.editRows[idx].productId || ''
      this.$nextTick(() => {
        const el = this.$refs['psearch_' + idx]
        if (el) el.focus()
      })
    },
    selectProductFromSearch (product) {
      const idx = this.productSearchIdx
      if (idx === null) return
      const firstPkg = Array.isArray(product.packages) && product.packages[0] ? product.packages[0] : null
      this.$set(this.editRows[idx], 'productId', product.id)
      this.$set(this.editRows[idx], 'name', product.name)
      const pkgName = firstPkg ? firstPkg.name : ''
      this.$set(this.editRows[idx], 'package', pkgName)
      this.$set(this.editRows[idx], 'unitPrice', firstPkg ? firstPkg.price : 0)
      const rate = getConversionRateFromPackageName(pkgName)
      this.$set(this.editRows[idx], 'conversionRate', rate)
      this.$set(this.editRows[idx], 'currentStock', MOCK_STOCKS[product.id] || 0)
      this.$set(this.editRows[idx], 'noPrice', !firstPkg || firstPkg.price === 0)
      this.normalizeSubQty(idx)
      this.productSearch = ''
      this.productSearchIdx = null
      this.recalcPromotions()
    },
    closeProductSearch () {
      this.productSearch = ''
      this.productSearchIdx = null
    }
  }
}
</script>

<style scoped>
.order-review-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

/* ── 頂部 ─────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
}

.back-btn {
  border: none;
  background: none;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

/* ── 資訊卡片 ─────────────────────── */
.info-card {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.order-id-text {
  color: var(--c-primary);
}

.delivery-input {
  height: 34px;
  font-size: 14px;
  font-weight: 400;
}

/* ── 可編輯 input 通用 ────────────── */
.edit-input {
  border: 0.5px solid #E2E8F0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-weight: 400;
  color: #334155;
  background: #ffffff;
  outline: none;
}

.edit-input:disabled {
  background: #F8FAFC;
  color: #8b95a8;
}

.edit-select {
  padding: 4px 6px;
  cursor: pointer;
}

.num-input {
  width: 60px;
  text-align: right;
}

/* ── 合併單位數量欄 ────────────────── */
.qty-pair {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.qty-sep {
  font-size: 12px;
  color: #8b95a8;
  flex-shrink: 0;
}

.code-input {
  width: 72px;
}

/* 行內產品搜尋 */
.search-wrap {
  position: relative;
  display: inline-block;
}

.code-chip {
  display: inline-block;
  padding: 3px 8px;
  border: 0.5px dashed var(--c-border);
  border-radius: 4px;
  font-size: 12px;
  color: var(--c-primary);
  cursor: pointer;
  white-space: nowrap;
}

.code-chip:hover {
  background: var(--c-primary-light);
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 300;
  background: #ffffff;
  border: 0.5px solid var(--c-border);
  border-top: 2px solid var(--c-primary);
  border-radius: 6px;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  min-width: 220px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 13px;
}

.search-item:hover {
  background: var(--c-primary-light);
}

.si-id {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-text-muted);
  flex-shrink: 0;
  width: 36px;
}

.si-name {
  flex: 1;
  color: var(--c-text-body);
  font-weight: 500;
}

.si-price {
  font-size: 11px;
  color: var(--c-text-muted);
  flex-shrink: 0;
}

.name-input {
  width: 120px;
}

/* ── 桌機表格 ─────────────────────── */
.table-section {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.table-scroll {
  overflow-x: auto;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 960px;
}

.review-table thead tr {
  background: #F8FAFC;
}

.review-table th {
  padding: 12px 12px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  text-align: left;
  border-bottom: 0.5px solid #E2E8F0;
  white-space: nowrap;
  line-height: 1.4;
  text-transform: uppercase;
}

.col-num {
  text-align: right;
}

.review-table th.col-num {
  text-align: right;
}

.col-action {
  text-align: right;
  width: 110px;
  white-space: nowrap;
}

.review-table th.col-action {
  text-align: right;
}

.review-table td {
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 400;
  color: var(--c-text-body);
  border-bottom: 0.5px solid #F1F5F9;
  vertical-align: middle;
}

.review-table tbody tr:last-child td {
  border-bottom: none;
}

.review-row {
  transition: background 0.1s;
}

.review-row:hover td {
  background: #EEF3FB !important;
}

/* ── 列背景 ───────────────────────── */
.bg-customer td {
  background: #F8FAFC;
}

.bg-gift td {
  background: #FAFEF5;
}

.bg-sales td {
  background: #FFFFFF;
}

/* ── 唯讀文字 ─────────────────────── */
.cell-text {
  display: inline-block;
}

.readonly-text {
  color: #4b5568;
}

.is-negative {
  color: #8c2020 !important;
  font-weight: 500;
}

.is-tight {
  color: #8a6a28 !important;
  font-weight: 500;
}

/* 超賣列標記：背景虚紅 */
.row-oversell td {
  background: #fbeeee !important;
}

/* 停用 hover 覆蓋超賣警示色 */
.row-oversell:hover td {
  background: #f7e2e2 !important;
}

/* ── 庫存 Mono 字體 ────────── */
.stock-mono {
  font-family: var(--font-mono);
  font-size: 13px;
  color: #334155;
}

/* ── 來源 badge ────────────────────── */
.source-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.source--customer {
  background: #eef3fb;
  color: var(--c-primary);
}

.source--sales_add {
  background: #edf7f1;
  color: #1a5c38;
}

.source--system_gift {
  background: #f2eefb;
  color: #4a2a8c;
}

/* ── 操作按鈕 ─────────────────────── */
.row-btn {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.cancel-btn {
  border: 0.5px solid #8b95a8;
  background: transparent;
  color: #4b5568;
}

.to-gift-btn {
  border: 0.5px solid #7c3aed;
  background: transparent;
  color: #7c3aed;
}

.revert-gift-btn {
  border: 0.5px solid #8b95a8;
  background: transparent;
  color: #4b5568;
}

.delete-btn {
  border: 0.5px solid #E2E8F0;
  background: transparent;
  color: #8c2020;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
}

/* ── 取消的系統贈品列 ─────────────── */
.row-cancelled td {
  background: #F1F5F9 !important;
}
.row-cancelled:hover td {
  background: #F1F5F9 !important;
}
.row-cancelled td .cell-text,
.row-cancelled td .source-badge,
.row-cancelled td .readonly-text {
  text-decoration: line-through;
  color: #a0aec0;
}
.row-cancelled td .stock-mono {
  color: #a0aec0 !important;
}
.row-cancelled td input,
.row-cancelled td select {
  opacity: 0.35;
  pointer-events: none;
}

.mobile-card.bg-cancelled {
  background: #F1F5F9 !important;
  opacity: 0.6;
}

.restore-btn {
  border: 0.5px solid #059669;
  background: transparent;
  color: #059669;
}

/* ── 新增品項 ─────────────────────── */
.add-row-foot td {
  padding: 10px 12px;
  border-top: 0.5px solid var(--c-divider);
  background: #ffffff;
}

.add-row-btn {
  border: none;
  background: none;
  color: var(--c-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

/* ── 手機卡片（桌機隱藏） ──────────── */
.mobile-cards {
  display: none;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-direction: column;
  gap: 10px;
}

.mobile-card {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-card.bg-customer {
  background: #F8FAFC;
}

.mobile-card.bg-gift {
  background: #fafff5;
}

.mobile-card.bg-sales {
  background: #ffffff;
}

.mc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mc-actions {
  display: flex;
  gap: 8px;
}

.mc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mc-label {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
  flex-shrink: 0;
  width: 80px;
}

.mc-value {
  font-size: 13px;
  font-weight: 400;
  color: #334155;
  text-align: right;
}

.mc-subtotal {
  font-weight: 500;
  color: var(--c-primary);
}

.mobile-add-item {
  padding: 12px 0;
  display: flex;
  justify-content: center;
}

/* ── 底部操作區 ───────────────────── */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: #ffffff;
  border-top: 0.5px solid #E2E8F0;
  z-index: 50;
}

.total-area {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.total-label {
  font-size: 12px;
  font-weight: 400;
  color: #8b95a8;
}

.total-amount {
  font-size: 18px;
  font-weight: 500;
  color: var(--c-primary);
}

.bottom-actions {
  display: flex;
  gap: 10px;
}

.submit-btn {
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 6px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* ── 無價格警告 ─────────────────────── */
.price-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.price-warn {
  color: #8c2020;
  font-size: 13px;
  cursor: help;
  flex-shrink: 0;
}

/* ── RWD ──────────────────────────── */
@media (max-width: 768px) {
  .table-section {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr;
  }

  .order-review-page {
    padding-bottom: calc(80px + max(0px, env(safe-area-inset-bottom)));
  }

  .bottom-bar {
    padding: 10px 16px;
    flex-wrap: wrap;
    gap: 10px;
    bottom: max(0px, env(safe-area-inset-bottom));
  }

  .bottom-actions {
    width: 100%;
  }

  .submit-btn {
    flex: 1;
  }
}
</style>

<template>
  <div class="inventory-detail-page">

    <!-- 頂部操作列 -->
    <div class="top-bar">
      <button type="button" class="back-btn" @click="$router.push('/inventory-checks')">
        <chevron-left-icon :size="16" :stroke-width="1.5" />
        返回盤點列表
      </button>
    </div>

    <!-- 頂部資訊 -->
    <section class="info-card">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">盤點客戶</span>
          <span class="info-value">{{ customerName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">盤點日期</span>
          <input v-model="checkDate" type="date" class="date-input" />
        </div>
      </div>
    </section>

    <!-- 產品盤點區塊列表 -->
    <div class="blocks-list">
      <div
        v-for="(block, bIdx) in checkBlocks"
        :key="block._id"
        class="check-block"
      >
        <!-- 產品標題列 -->
        <div class="block-header">
          <div class="block-meta">
            <select v-model="block.productId" class="product-select" @change="onProductChange(bIdx)">
              <option value="">— 選擇產品 —</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <select v-model="block.package" class="package-select">
              <option v-for="pkg in packageOptions" :key="pkg" :value="pkg">{{ pkg }}</option>
            </select>
          </div>
          <button type="button" class="remove-block-btn" @click="removeBlock(bIdx)">移除</button>
        </div>

        <!-- 五個位置的數量輸入 Grid -->
        <div class="location-grid">
          <div v-for="loc in locations" :key="loc.key" class="location-item">
            <span class="location-tag">{{ loc.label }}</span>
            <div class="qty-row">
              <div class="qty-field">
                <label class="qty-label">主數量</label>
                <input
                  v-model.number="block.qty[loc.key].main"
                  type="number"
                  min="0"
                  class="qty-input"
                  placeholder="0"
                />
              </div>
              <div class="qty-field">
                <label class="qty-label">小數量</label>
                <input
                  v-model.number="block.qty[loc.key].sub"
                  type="number"
                  min="0"
                  class="qty-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 照片確認區（多張） -->
        <div class="block-photo-row">
          <span class="block-photo-label">PHOTO CONFIRM</span>
          <div class="block-photo-area">
            <div class="block-photo-thumbs">
              <img
                v-for="(url, pi) in block.photos"
                :key="pi"
                :src="url"
                class="block-photo-thumb"
                alt="盤點確認照片"
                @click="previewUrl = url"
              />
              <button
                v-for="(url, pi) in block.photos"
                :key="'del-' + pi"
                class="block-photo-del"
                @click.prevent="removeBlockPhoto(bIdx, pi)"
                title="刪除"
              >×</button>
            </div>
            <label class="block-upload-label">
              <camera-icon :size="14" :stroke-width="1.5" />
              新增照片
              <input
                type="file"
                accept="image/*"
                class="file-input"
                multiple
                @change="e => onBlockPhotoUpload(e, bIdx)"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增產品按鈕 -->
    <button type="button" class="add-block-btn" @click="addBlock">
      <plus-icon :size="15" :stroke-width="1.5" />
      新增產品
    </button>

    <!-- 拍照存證區塊 -->
    <section class="proof-section">
      <div class="proof-header">
        <span class="proof-eyebrow">PHOTO EVIDENCE</span>
        <span class="proof-title">拍照存證</span>
        <label class="proof-upload-btn">
          <camera-icon :size="14" :stroke-width="1.5" />
          新增照片
          <input
            type="file"
            accept="image/*"
            class="file-input"
            multiple
            @change="onProofPhotoUpload"
          />
        </label>
      </div>
      <div v-if="proofPhotos.length > 0" class="proof-grid">
        <img
          v-for="(url, pi) in proofPhotos"
          :key="pi"
          :src="url"
          class="proof-thumb"
          alt="存證照片"
          @click="previewUrl = url"
        />
      </div>
      <p v-else class="proof-empty">尚未拍照，請點擊「新增照片」上傳</p>
    </section>

    <!-- 提交按鈕 -->
    <button type="button" class="submit-btn" @click="submitCheck">提交盤點記錄</button>

    <!-- 照片放大預覽 -->
    <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
      <img :src="previewUrl" class="preview-img" alt="照片預覽" />
      <span class="preview-close">點擊任意處關閉</span>
    </div>

  </div>
</template>

<script>
import { customers } from '../mock/customers'
import { products } from '../mock/products'
import {
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
  Camera as CameraIcon
} from 'lucide-vue'

const LOCATIONS = [
  { key: 'warehouse', label: '倉庫' },
  { key: 'shelf', label: '貨架' },
  { key: 'display', label: '陳列' },
  { key: 'fridge', label: '冰箱' },
  { key: 'other', label: '其他' }
]

let blockIdCounter = 1

function buildPackageOptions () {
  const allPackages = products.flatMap(p => Array.isArray(p.packages) ? p.packages.map(pkg => pkg.name) : [])
  return [...new Set(allPackages)].sort()
}

function emptyQty () {
  const obj = {}
  LOCATIONS.forEach(loc => { obj[loc.key] = { main: 0, sub: 0 } })
  return obj
}

function newBlock () {
  return {
    _id: blockIdCounter++,
    productId: '',
    package: '單件',
    qty: emptyQty(),
    photos: []
  }
}

function todayStr () {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default {
  name: 'InventoryCheckDetailPage',
  components: { ChevronLeftIcon, PlusIcon, CameraIcon },
  props: ['checkId'],
  data () {
    const customer = customers.find(c => c.id === this.checkId)
    return {
      customer: customer || null,
      checkDate: todayStr(),
      checkBlocks: [newBlock()],
      products,
      locations: LOCATIONS,
      packageOptions: buildPackageOptions(),
      previewUrl: null,
      proofPhotos: []
    }
  },
  computed: {
    customerName () {
      return this.customer ? this.customer.name : this.checkId
    }
  },
  methods: {
    onProductChange (bIdx) {
      const block = this.checkBlocks[bIdx]
      const product = products.find(p => p.id === block.productId)
      if (product && Array.isArray(product.packages) && product.packages[0]) {
        this.$set(this.checkBlocks[bIdx], 'package', product.packages[0].name)
      }
    },
    addBlock () {
      this.checkBlocks.push(newBlock())
    },
    removeBlock (idx) {
      if (this.checkBlocks.length === 1) {
        this.checkBlocks.splice(idx, 1, newBlock())
        return
      }
      this.checkBlocks.splice(idx, 1)
    },
    submitCheck () {
      const currentUser = this.$store.state.currentUser
      const record = {
        id: 'IC-' + Date.now(),
        checkerId: currentUser ? currentUser.id : '',
        checker: currentUser ? currentUser.name : '',
        customerId: this.checkId,
        customerName: this.customerName,
        checkDate: this.checkDate,
        checkBlocks: this.checkBlocks.map(b => ({
          ...b,
          qty: JSON.parse(JSON.stringify(b.qty)),
          photos: Array.isArray(b.photos) && b.photos.length > 0
            ? [...b.photos]
            : (b.productId ? [this.productImage(b.productId)] : [])
        })),
        proofPhotos: [...this.proofPhotos],
        submittedAt: new Date().toISOString()
      }
      this.$store.dispatch('addInventoryRecord', record)
      this.$store.dispatch('showSnackbar', { message: '盤點記錄已成功提交', type: 'success' })
      this.$router.push('/inventory-checks')
    },
    onBlockPhotoUpload (e, bIdx) {
      const files = Array.from(e.target.files)
      if (!files.length) return
      files.forEach(file => {
        const url = URL.createObjectURL(file)
        this.checkBlocks[bIdx].photos.push(url)
      })
      e.target.value = ''
    },
    removeBlockPhoto (bIdx, pi) {
      this.checkBlocks[bIdx].photos.splice(pi, 1)
    },
    productImage (productId) {
      const p = this.products.find(prod => prod.id === productId)
      return p && p.image ? p.image : ''
    },
    onProofPhotoUpload (e) {
      const files = Array.from(e.target.files)
      files.forEach(file => {
        const url = URL.createObjectURL(file)
        this.proofPhotos.push(url)
      })
      e.target.value = ''
    }
  }
}
</script>

<style scoped>
.inventory-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  grid-template-columns: 1fr 1fr;
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

.date-input {
  height: 36px;
  padding: 0 10px;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  outline: none;
}

/* ── 盤點區塊列表 ─────────────────── */
.blocks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── 盤點區塊 ─────────────────────── */
.check-block {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.block-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.product-select {
  height: 36px;
  padding: 0 10px;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 400;
  outline: none;
  min-width: 160px;
}

.package-select {
  height: 36px;
  padding: 0 10px;
  border: 0.5px solid #E2E8F0;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 400;
  outline: none;
}

.remove-block-btn {
  border: none;
  background: none;
  color: #8c2020;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

/* ── 位置 Grid ────────────────────── */
.location-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.location-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f5f7fb;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #4b5568;
}

.qty-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qty-field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-label {
  font-size: 11px;
  font-weight: 400;
  color: #8b95a8;
  width: 38px;
  flex-shrink: 0;
}

.qty-input {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 0.5px solid #E2E8F0;
  border-radius: 4px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 400;
  outline: none;
  text-align: right;
}

/* ── 新增 / 提交按鈕 ──────────────── */
.add-block-btn {
  border: 0.5px solid var(--c-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 0;
  cursor: pointer;
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 6px;
  background: var(--c-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* ── 拍照存證區塊 ──────────────────── */
.proof-section {
  border: 0.5px solid #E2E8F0;
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.proof-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.proof-eyebrow {
  font-size: 10px;
  font-weight: 500;
  color: #94A3B8;
  letter-spacing: 0.12em;
}

.proof-title {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
  flex: 1;
}

.proof-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 0.5px solid var(--c-primary);
  border-radius: 4px;
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  flex-shrink: 0;
}

.proof-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.proof-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  border: 0.5px solid #E2E8F0;
  cursor: pointer;
  display: block;
  flex-shrink: 0;
}

.proof-empty {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #94A3B8;
}

/* ── 照片確認區 ────────────────────── */
.block-photo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 0.5px solid #F1F5F9;
}

.block-photo-label {
  font-size: 10px;
  font-weight: 500;
  color: #94A3B8;
  letter-spacing: 0.1em;
  flex-shrink: 0;
}

.block-photo-area {
  display: flex;
  align-items: center;
}

.block-photo-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  border: 0.5px solid #E2E8F0;
  cursor: pointer;
  display: block;
}

.block-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 0.5px solid var(--c-primary);
  border-radius: 4px;
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
}

.file-input {
  display: none;
}

/* ── 照片全螢幕預覽 ────────────────── */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.preview-img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 8px;
  object-fit: contain;
  display: block;
}

.preview-close {
  margin-top: 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* ── RWD ──────────────────────────── */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .location-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

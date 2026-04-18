<template>
  <div class="products-view">
    <h2>產品列表</h2>
    <div class="product-grid">
      <div class="product-card" v-for="product in products" :key="product.id">
        <img :src="product.image" :alt="product.name" />
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p>包裝：{{ product.package }}</p>
          <p>單價：$ {{ product.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { products } from '../mock/products'

export default {
  name: 'ProductsView',
  data () {
    return {
      products
    }
  }
}
</script>

<style scoped>
.products-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e3eaf5;
}

.product-card img {
  width: 100%;
  display: block;
}

.product-info {
  padding: 16px;
}

.product-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 500;
}

.product-info p {
  margin: 6px 0;
  color: #5f6f8f;
}

@media (max-width: 760px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>

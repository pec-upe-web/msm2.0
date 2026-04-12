<template>
  <div class="orders-view">
    <h2>訂單列表</h2>
    <div class="order-list">
      <div class="order-card" v-for="order in orders" :key="order.orderId">
        <div class="order-header">
          <strong>{{ order.orderId }}</strong>
          <status-badge :status="order.status" />
        </div>
        <div class="order-detail">
          <div>客戶：{{ customerName(order) }}</div>
          <div>日期：{{ order.date }}</div>
          <div>金額：NT$ {{ order.amount }}</div>
        </div>
        <router-link :to="`/orders/${order.orderId}`" class="link-button">檢視詳情</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { orders } from '../mock/orders'
export default {
  name: 'OrdersView',
  data () {
    return {
      orders
    }
  }
}
</script>

<style scoped>
.orders-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-list {
  display: grid;
  gap: 16px;
}

.order-card {
  padding: 18px;
  background: var(--c-surface);
  border-radius: 16px;
  border: 1px solid var(--c-border);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.order-detail {
  display: grid;
  gap: 8px;
  color: #5f6f8f;
  margin-bottom: 14px;
}

.link-button {
  display: inline-block;
  padding: 10px 16px;
  background: var(--c-primary);
  color: var(--c-surface);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
}
</style>

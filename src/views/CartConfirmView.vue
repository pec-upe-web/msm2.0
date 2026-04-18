<template>
  <div class="cart-confirm-view">
    <h2>訂單確認</h2>
    <div class="confirm-card">
      <p>以下為客戶訂單確認畫面，請確認內容無誤後送出。</p>
      <div class="summary">
        <div>項目總數：3</div>
        <div>訂單金額：$ 5,220</div>
      </div>
      <button class="submit-button">確認送出</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartConfirmView'
}
</script>

<style scoped>
.cart-confirm-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confirm-card {
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e3eaf5;
}

.summary {
  margin: 22px 0;
  display: flex;
  gap: 18px;
  color: #1a2540;
  font-weight: 500;
}

.submit-button {
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: #1a2540;
  color: #dde4f0;
  font-weight: 500;
  cursor: pointer;
}
</style>

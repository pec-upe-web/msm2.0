<template>
  <div class="promotions-view">
    <h2>促銷專區</h2>
    <div class="promotion-grid">
      <div class="promotion-card" v-for="item in promotions" :key="item.id">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <span class="tag">{{ item.type }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PromotionsView',
  data () {
    return {
      promotions: [
        { id: 'P-01', title: '春季滿額折扣', description: '單筆訂單滿 $ 5,000 即可享 5% 折扣。', type: '限時' },
        { id: 'P-02', title: '首單贈品方案', description: '新客戶首單贈送專屬商務筆記本。', type: '新客戶' },
        { id: 'P-03', title: '量販採購優惠', description: '採購 10 件以上產品，可申請專屬折扣。', type: '企業' }
      ]
    }
  }
}
</script>

<style scoped>
.promotions-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.promotion-grid {
  display: grid;
  gap: 16px;
}

.promotion-card {
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e3eaf5;
}

.tag {
  display: inline-block;
  margin-top: 12px;
  color: var(--c-primary);
  font-weight: 500;
}
</style>

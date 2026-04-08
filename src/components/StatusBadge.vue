<template>
  <span class="status-badge" :class="statusClass">
    <span class="status-dot" aria-hidden="true"></span>{{ label }}
  </span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: {
      type: String,
      default: 'pending'
    }
  },
  computed: {
    statusClass () {
      return `status--${this.status}`
    },
    label () {
      const labels = {
        pending: '待審核',
        confirmed: '已確認',
        processing: '處理中',
        cancelled: '已取消',
        transferred: '已拋轉',
        error: '拋轉異常'
      }
      return labels[this.status] || this.status
    }
  }
}
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 10px;
  border-radius: 20px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  white-space: nowrap;
  line-height: 1;
  border: 0.5px solid transparent;
}

.status-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 待審核 */
.status--pending {
  background: #eef3fb;
  color: #1a2f5e;
  border-color: #c4d4ec;
}
.status--pending .status-dot { background: #2e4f8a; }

/* 已確認 */
.status--confirmed {
  background: #edf7f1;
  color: #1a5c38;
  border-color: #a0d4b4;
}
.status--confirmed .status-dot { background: #2a7a4a; }

/* 處理中 */
.status--processing {
  background: #fdf8ee;
  color: #8a6a28;
  border-color: #dfc97a;
}
.status--processing .status-dot { background: #c8980a; }

/* 已取消 */
.status--cancelled {
  background: #fbeeee;
  color: #8c2020;
  border-color: #e4aaaa;
}
.status--cancelled .status-dot { background: #b03030; }

/* 已拋轉 */
.status--transferred {
  background: #f2eefb;
  color: #4a2a8c;
  border-color: #c0aae8;
}
.status--transferred .status-dot { background: #6040b0; }

/* 拋轉異常 */
.status--error {
  background: #fff1f0;
  color: #cf1322;
  border-color: #ffa39e;
}
.status--error .status-dot {
  background: #f5222d;
  animation: dot-breathe 1.6s ease-in-out infinite;
}

@keyframes dot-breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(0.6); }
}
</style>

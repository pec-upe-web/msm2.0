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
    },
    viewerRole: {
      type: String,
      default: ''
    }
  },
  computed: {
    normalizedStatus () {
      const shippedRaw = ['confirmed', 'processing', 'cancelled', 'shipped']
      if (shippedRaw.includes(this.status)) return 'shipped'
      if (this.viewerRole === 'customer' && this.status === 'error') return 'pending'
      return this.status
    },
    statusClass () {
      return `status--${this.normalizedStatus}`
    },
    label () {
      const labels = {
        pending: '待審核',
        shipped: '已出貨',
        transferred: '已拋轉',
        error: '拋轉失敗'
      }
      return labels[this.normalizedStatus] || this.normalizedStatus
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
  background: var(--badge-pending-bg);
  color: var(--badge-pending-color);
  border-color: var(--badge-pending-border);
}
.status--pending .status-dot { background: var(--badge-pending-dot); }

/* 已出貨 */
.status--shipped {
  background: var(--badge-shipped-bg);
  color: var(--badge-shipped-color);
  border-color: var(--badge-shipped-border);
}
.status--shipped .status-dot { background: var(--badge-shipped-dot); }

/* 已拋轉 */
.status--transferred {
  background: var(--badge-transferred-bg);
  color: var(--badge-transferred-color);
  border-color: var(--badge-transferred-border);
}
.status--transferred .status-dot { background: var(--badge-transferred-dot); }

/* 拋轉失敗 */
.status--error {
  background: var(--badge-error-bg);
  color: var(--badge-error-color);
  border-color: var(--badge-error-border);
}
.status--error .status-dot {
  background: var(--badge-error-dot);
  animation: dot-breathe 1.6s ease-in-out infinite;
}

@keyframes dot-breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(0.6); }
}
</style>

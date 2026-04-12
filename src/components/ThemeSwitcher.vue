<template>
  <div class="theme-switcher">
    <div
      class="switcher-btn"
      :style="{ background: themes[currentTheme].primary }"
      @click="toggle"
      title="切換主題"
    >
      <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#fff" opacity="0.2"/><circle cx="14" cy="14" r="8" fill="none" stroke="#fff" stroke-width="2"/></svg>
    </div>
    <transition name="fade">
      <div v-if="open" class="palette-list">
        <div
          v-for="(theme, key) in themes"
          :key="key"
          class="palette-dot"
          :style="{ background: theme['--c-primary'], boxShadow: currentTheme === key ? '0 0 0 3px #fff, 0 2px 8px #0002' : '' }"
          @click="setTheme(key)"
          :title="theme.label"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script>
// 色碼工具：hex 轉 rgb 陣列
function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('')
  const num = parseInt(hex, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}
// 色碼工具：亮度提升
function lighten(hex, percent = 0.1) {
  const rgb = hexToRgb(hex)
  return (
    '#' + rgb.map(c => {
      const v = Math.round(c + (255 - c) * percent)
      return v.toString(16).padStart(2, '0')
    }).join('')
  )
}

const themes = {
  businessBlue: {
    label: '商務深藍',
    '--c-primary': '#2C3E50',
    '--c-bg': '#F4F7F6',
    '--c-surface': '#FFFFFF',
    '--c-border': 'rgba(44,62,80,0.12)',
    '--c-bg-gradient1': '#56CCF2',
    '--c-bg-gradient2': '#3B82F6',
    '--c-bg-gradient3': '#1E3A8A',
  },
  forestZen: {
    label: '晨霧森林',
    '--c-primary': '#3E4E50',
    '--c-bg': '#FAF9F6',
    '--c-surface': '#FFFFFF',
    '--c-border': 'rgba(62,78,80,0.10)',
    '--c-bg-gradient1': '#D1FAE5',
    '--c-bg-gradient2': '#6EE7B7',
    '--c-bg-gradient3': '#3E4E50',
  },
  slateGray: {
    label: '現代石板',
    '--c-primary': '#546E7A',
    '--c-bg': '#ECEFF1',
    '--c-surface': '#F8F9FA',
    '--c-border': 'rgba(84,110,122,0.15)',
    '--c-bg-gradient1': '#E0E7EF',
    '--c-bg-gradient2': '#B0BEC5',
    '--c-bg-gradient3': '#546E7A',
  },
  espressoMorning: {
    label: '晨間咖啡',
    '--c-primary': '#451A03',
    '--c-bg': '#FDF4FF',
    '--c-surface': '#FFFFFF',
    '--c-border': 'rgba(69,26,3,0.08)',
    '--c-bg-gradient1': '#FDE68A',
    '--c-bg-gradient2': '#F59E42',
    '--c-bg-gradient3': '#B45309',
  }
}

// 自動補齊衍生變數
// 讓 --c-primary-light 亮度提升幅度較小，讓 header/tabs 文字更顯眼但不會超過白色
Object.values(themes).forEach(theme => {
  // 主色亮度提升 5%（比原本 10% 更深一點）
  theme['--c-primary-light'] = lighten(theme['--c-primary'], 0.05)
  theme['--c-hover'] = lighten(theme['--c-primary'], 0.12)
})

export default {
  name: "ThemeSwitcher",
  data () {
    return {
      open: false,
      currentTheme: "businessBlue",
      themes
    }
  },
  methods: {
    toggle () {
      this.open = !this.open
    },
    setTheme (key) {
      this.currentTheme = key
      this.applyTheme()
      localStorage.setItem('theme-key', key)
      this.open = false
    },
    applyTheme () {
      const theme = this.themes[this.currentTheme]
      Object.entries(theme).forEach(([key, value]) => {
        if (key.startsWith('--')) {
          document.documentElement.style.setProperty(key, value)
        }
      })
    }
  },
  mounted () {
    const saved = localStorage.getItem('theme-key')
    if (saved && this.themes[saved]) {
      this.currentTheme = saved
    }
    this.applyTheme()
  }
}
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.switcher-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  box-shadow: 0 2px 12px #0002;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s;
  background: var(--primary-color, #2C3E50);
}
.switcher-btn:hover {
  box-shadow: 0 4px 20px #0003;
}
.palette-list {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-end;
}
.palette-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  box-shadow: 0 2px 8px #0002;
  border: 2px solid #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.palette-dot:hover {
  transform: scale(1.12);
  box-shadow: 0 0 0 3px #eee, 0 4px 16px #0003;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

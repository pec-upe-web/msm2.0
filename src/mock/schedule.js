import { customers, customerById as customerLookup } from './customers'
import { haversineKm, sortByDistance } from '../utils/distance'

// 今日班表：依拜訪時間排序的客戶 ID 清單
const rawTodaySchedule = ['C002', 'C001', 'C003', 'C006', 'C007', 'C004', 'C005']

// 班表座標，供後續 GPS 排序 / 地圖跳轉使用
const scheduleLocations = {
  C001: { lat: 25.040, lng: 121.565 },
  C002: { lat: 25.014, lng: 121.462 },
  C003: { lat: 24.954, lng: 121.224 },
  C004: { lat: 24.163, lng: 120.647 },
  C005: { lat: 22.612, lng: 120.301 },
  C006: { lat: 25.062, lng: 121.520 },
  C007: { lat: 25.035, lng: 121.440 }
}

export const todayScheduleIds = [...rawTodaySchedule]

// 完整班表（含時間，供首頁顯示用）
const rawTodayScheduleItems = [
  { time: '08:00', customerId: 'C002' },
  { time: '09:30', customerId: 'C001' },
  { time: '11:00', customerId: 'C003' },
  { time: '13:00', customerId: 'C006' },
  { time: '14:30', customerId: 'C007' },
  { time: '15:30', customerId: 'C004' },
  { time: '17:00', customerId: 'C005' },
]

export function buildTodaySchedule (customerById = {}, orderedCustomerIds = new Set()) {
  return rawTodayScheduleItems.map(item => {
    const location = scheduleLocations[item.customerId]
    const customer = customerById[item.customerId] || {}
    return {
      ...item,
      customer: customer.name || '',
      address: customer.address || '',
      location: location ? { ...location } : null,
      hasOrder: orderedCustomerIds.has(item.customerId)
    }
  })
}

export const todaySchedule = buildTodaySchedule(customerLookup)

export const todayScheduleItems = rawTodayScheduleItems.map(item => {
  const location = scheduleLocations[item.customerId]
  return {
    ...item,
    location: location ? { ...location } : null
  }
})

function buildStoreEntry (customer, source, extra = {}) {
  const location = customer.location || null
  return {
    id: customer.id,
    customerId: customer.id,
    name: customer.name,
    address: customer.address,
    time: extra.time || '',
    location: location ? { ...location } : null,
    source,
    ...extra
  }
}

export function buildTodayStoreList (currentLocation = null, options = {}) {
  const radiusKm = typeof options.radiusKm === 'number' ? options.radiusKm : 30
  const sortMode = options.sortMode === 'distance' ? 'distance' : 'default'
  const orderCustomerIds = options.orderCustomerIds instanceof Set
    ? options.orderCustomerIds
    : new Set(Array.isArray(options.orderCustomerIds) ? options.orderCustomerIds : [])
  const scheduleStores = rawTodayScheduleItems
    .map(item => {
      const customer = customerLookup[item.customerId]
      return customer ? buildStoreEntry(customer, 'schedule', { time: item.time }) : null
    })
    .filter(Boolean)

  const nearbyStores = customers
    .filter(customer => customer.location)
    .filter(customer => {
      if (!currentLocation) return false
      const dist = haversineKm(
        currentLocation.lat,
        currentLocation.lng,
        customer.location.lat,
        customer.location.lng
      )
      return dist <= radiusKm
    })
    .map(customer => buildStoreEntry(customer, 'gps'))

  const merged = [...scheduleStores, ...nearbyStores]
  const seen = new Set()
  const deduped = merged.filter(store => {
    if (seen.has(store.customerId)) return false
    seen.add(store.customerId)
    return true
  })

  const ordered = currentLocation && sortMode === 'distance'
    ? sortByDistance(
        deduped,
        currentLocation,
        store => store.location
      )
    : deduped

  return ordered.map(store => {
    const distance = currentLocation && store.location
      ? haversineKm(currentLocation.lat, currentLocation.lng, store.location.lat, store.location.lng)
      : null
    return {
      ...store,
      distance,
      hasOrder: orderCustomerIds.has(store.customerId)
    }
  })
}

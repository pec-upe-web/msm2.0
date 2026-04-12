// 盤點歷史紀錄 mock 資料（用於首次載入的示範資料）
// checkerId / checker 對應 users.js 中的 sales01 測試帳號
export const inventoryRecords = [
  {
    id: 'IC-1001',
    checkerId: 'sales01',
    checker: '銷售人員測試',
    customerId: 'C001',
    customerName: '7-Eleven 信義旗艦店',
    checkDate: '2026-04-05',
    checkBlocks: [
      {
        _id: 1,
        productId: 'P001',
        package: '一箱/24罐',
        qty: {
          warehouse: { main: 3, sub: 0 },
          shelf: { main: 1, sub: 12 },
          display: { main: 0, sub: 6 },
          fridge: { main: 2, sub: 0 },
          other: { main: 0, sub: 0 }
        },
        photos: [
          'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=400&auto=format&fit=crop'
        ]
      },
      {
        _id: 2,
        productId: 'P002',
        package: '一打/12罐',
        qty: {
          warehouse: { main: 5, sub: 0 },
          shelf: { main: 2, sub: 6 },
          display: { main: 1, sub: 0 },
          fridge: { main: 0, sub: 0 },
          other: { main: 0, sub: 0 }
        },
        photos: [
          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400&auto=format&fit=crop'
        ]
      }
    ],
    proofPhotos: [],
    submittedAt: '2026-04-05T10:23:00.000Z'
  },
  {
    id: 'IC-1002',
    checkerId: 'sales01',
    checker: '銷售人員測試',
    customerId: 'C003',
    customerName: '全聯福利中心 中壢中正店',
    checkDate: '2026-03-28',
    checkBlocks: [
      {
        _id: 1,
        productId: 'P003',
        package: '一束/6罐',
        qty: {
          warehouse: { main: 10, sub: 0 },
          shelf: { main: 4, sub: 3 },
          display: { main: 2, sub: 0 },
          fridge: { main: 1, sub: 0 },
          other: { main: 0, sub: 0 }
        },
        photos: [
          'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop'
        ]
      }
    ],
    proofPhotos: [],
    submittedAt: '2026-03-28T14:05:00.000Z'
  },
  {
    id: 'IC-1003',
    checkerId: 'sales01',
    checker: '銷售人員測試',
    customerId: 'C002',
    customerName: '全家便利商店 板橋民生店',
    checkDate: '2026-03-15',
    checkBlocks: [
      {
        _id: 1,
        productId: 'P005',
        package: '一打/12罐',
        qty: {
          warehouse: { main: 8, sub: 0 },
          shelf: { main: 3, sub: 6 },
          display: { main: 1, sub: 6 },
          fridge: { main: 4, sub: 0 },
          other: { main: 0, sub: 0 }
        },
        photos: [
          'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=400&auto=format&fit=crop'
        ]
      },
      {
        _id: 2,
        productId: 'P007',
        package: '單罐',
        qty: {
          warehouse: { main: 24, sub: 0 },
          shelf: { main: 12, sub: 0 },
          display: { main: 6, sub: 0 },
          fridge: { main: 0, sub: 0 },
          other: { main: 0, sub: 0 }
        },
        photos: [
          'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&auto=format&fit=crop'
        ]
      }
    ],
    proofPhotos: [],
    submittedAt: '2026-03-15T09:45:00.000Z'
  }
]

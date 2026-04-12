// 詳細訂單資料，依 orderId 索引
// source 值說明：
//   customer    → 客戶送單
//   sales_add   → 業務新增
//   sales_edit  → 業務修改
//   system_gift → 系統贈品
export const orderDetails = {
  'SO-1001': {
    deliveryDate: '2026-04-10',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 10, unitPrice: 580, isGift: false, source: 'customer' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 12, unitPrice: 400, isGift: false, source: 'customer' },
      { productId: 'GIFT001', name: '品牌帆布袋', package: '單罐', qty: 1, unitPrice: 0, isGift: true, source: 'system_gift' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1002': {
    deliveryDate: '2026-04-08',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 20, unitPrice: 440, isGift: false, source: 'customer' },
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 15, unitPrice: 360, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 20, unitPrice: 440, isGift: false, source: 'customer' },
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 15, unitPrice: 360, isGift: false, source: 'customer' },
      { productId: 'P010', name: '百事可樂（寶特瓶）', package: '一打/12罐', qty: 5, unitPrice: 390, isGift: false, source: 'sales_add' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1003': {
    deliveryDate: '2026-04-07',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 10, unitPrice: 520, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一打/12罐', qty: 8, unitPrice: 380, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 10, unitPrice: 520, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一打/12罐', qty: 8, unitPrice: 380, isGift: false, source: 'customer' },
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 4, unitPrice: 420, isGift: false, source: 'sales_add' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1004': {
    deliveryDate: null,
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 8, unitPrice: 460, isGift: false, source: 'customer' },
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 5, unitPrice: 420, isGift: false, source: 'customer' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1005': {
    deliveryDate: '2026-04-02',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 36, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 20, unitPrice: 390, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 40, unitPrice: 560, isGift: false, source: 'sales_edit' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 20, unitPrice: 390, isGift: false, source: 'customer' },
      { productId: 'GIFT001', name: '品牌帆布袋', package: '單罐', qty: 2, unitPrice: 0, isGift: true, source: 'system_gift' }
    ],
    transferredOrderId: 'ERP-20260402-0051',
    transferredTime: '2026-04-02 14:25:00'
  },
  'SO-1006': {
    deliveryDate: '2026-04-01',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 18, unitPrice: 440, isGift: false, source: 'customer' },
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 16, unitPrice: 350, isGift: false, source: 'customer' },
      { productId: 'GIFT001', name: '品牌帆布袋', package: '單罐', qty: 1, unitPrice: 0, isGift: true, source: 'system_gift' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1007': {
    deliveryDate: '2026-03-30',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P008', name: '光泉鮮乳（瓶裝）', package: '一束/6罐', qty: 20, unitPrice: 480, isGift: false, source: 'customer' },
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 12, unitPrice: 520, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一箱/24罐', qty: 3, unitPrice: 740, isGift: false, source: 'sales_add' }
    ],
    reviewedItems: [
      { productId: 'P008', name: '光泉鮮乳（瓶裝）', package: '一束/6罐', qty: 20, unitPrice: 480, isGift: false, source: 'customer' },
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 12, unitPrice: 520, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一箱/24罐', qty: 3, unitPrice: 740, isGift: false, source: 'sales_add' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1008': {
    deliveryDate: '2026-03-28',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 14, unitPrice: 460, isGift: false, source: 'customer' },
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 16, unitPrice: 420, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 14, unitPrice: 460, isGift: false, source: 'customer' },
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 16, unitPrice: 420, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1009': {
    deliveryDate: '2026-03-25',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 44, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 20, unitPrice: 430, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 44, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 20, unitPrice: 430, isGift: false, source: 'customer' }
    ],
    transferredOrderId: 'ERP-20260325-0089',
    transferredTime: '2026-03-25 10:12:00'
  },
  'SO-1010': {
    deliveryDate: '2026-03-23',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 32, unitPrice: 350, isGift: false, source: 'customer' },
      { productId: 'P010', name: '百事可樂（寶特瓶）', package: '一打/12罐', qty: 8, unitPrice: 390, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 32, unitPrice: 350, isGift: false, source: 'customer' },
      { productId: 'P010', name: '百事可樂（寶特瓶）', package: '一打/12罐', qty: 8, unitPrice: 390, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1011': {
    deliveryDate: '2026-03-20',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 12, unitPrice: 400, isGift: false, source: 'customer' },
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 8, unitPrice: 520, isGift: false, source: 'customer' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1012': {
    deliveryDate: '2026-03-18',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 6, unitPrice: 460, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一打/12罐', qty: 10, unitPrice: 380, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 6, unitPrice: 460, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一打/12罐', qty: 10, unitPrice: 380, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1013': {
    deliveryDate: '2026-03-16',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 32, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P008', name: '光泉鮮乳（瓶裝）', package: '一打/12罐', qty: 12, unitPrice: 940, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 32, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P008', name: '光泉鮮乳（瓶裝）', package: '一打/12罐', qty: 12, unitPrice: 940, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1014': {
    deliveryDate: null,
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 14, unitPrice: 420, isGift: false, source: 'customer' },
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 10, unitPrice: 440, isGift: false, source: 'customer' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1015': {
    deliveryDate: null,
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P010', name: '百事可樂（寶特瓶）', package: '一打/12罐', qty: 8, unitPrice: 390, isGift: false, source: 'customer' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 6, unitPrice: 400, isGift: false, source: 'customer' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1016': {
    deliveryDate: '2026-03-14',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 40, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 12, unitPrice: 460, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 40, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 12, unitPrice: 460, isGift: false, source: 'customer' }
    ],
    transferredOrderId: 'ERP-20260314-0098',
    transferredTime: '2026-03-14 09:30:00'
  },
  'SO-1017': {
    deliveryDate: '2026-03-12',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 18, unitPrice: 360, isGift: false, source: 'customer' },
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 14, unitPrice: 520, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 18, unitPrice: 360, isGift: false, source: 'customer' },
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 14, unitPrice: 520, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1018': {
    deliveryDate: null,
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P008', name: '光泉鮮乳（瓶裝）', package: '一束/6罐', qty: 24, unitPrice: 480, isGift: false, source: 'customer' },
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 14, unitPrice: 440, isGift: false, source: 'customer' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1019': {
    deliveryDate: '2026-03-08',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一箱/24罐', qty: 6, unitPrice: 740, isGift: false, source: 'customer' },
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 8, unitPrice: 420, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一箱/24罐', qty: 6, unitPrice: 740, isGift: false, source: 'customer' },
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 8, unitPrice: 420, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1020': {
    deliveryDate: '2026-03-07',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 50, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 30, unitPrice: 390, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 50, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 30, unitPrice: 390, isGift: false, source: 'customer' }
    ],
    transferredOrderId: 'ERP-20260307-0122',
    transferredTime: '2026-03-07 16:48:00'
  },
  'SO-1021': {
    deliveryDate: '2026-03-05',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 10, unitPrice: 440, isGift: false, source: 'customer' },
      { productId: 'P010', name: '百事可樂（寶特瓶）', package: '一打/12罐', qty: 12, unitPrice: 390, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 10, unitPrice: 440, isGift: false, source: 'customer' },
      { productId: 'P010', name: '百事可樂（寶特瓶）', package: '一打/12罐', qty: 12, unitPrice: 390, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1022': {
    deliveryDate: null,
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P007', name: '御茶園每朝健康綠茶', package: '一箱/24罐', qty: 24, unitPrice: 520, isGift: false, source: 'customer' },
      { productId: 'P002', name: '麥香紅茶（利樂包）', package: '一箱/24罐', qty: 12, unitPrice: 360, isGift: false, source: 'customer' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1023': {
    deliveryDate: null,
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P005', name: '舒跑運動飲料（瓶裝）', package: '一箱/24罐', qty: 16, unitPrice: 460, isGift: false, source: 'customer' },
      { productId: 'P008', name: '光泉鮮乳（瓶裝）', package: '一束/6罐', qty: 8, unitPrice: 480, isGift: false, source: 'customer' }
    ],
    reviewedItems: null,
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1024': {
    deliveryDate: '2026-03-02',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 36, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一箱/24罐', qty: 10, unitPrice: 740, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P001', name: '台灣啤酒（罐裝）', package: '一箱/24罐', qty: 36, unitPrice: 560, isGift: false, source: 'customer' },
      { productId: 'P004', name: '統一奶茶（寶特瓶）', package: '一箱/24罐', qty: 10, unitPrice: 740, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  },
  'SO-1025': {
    deliveryDate: '2026-02-28',
    salesCompany: '台飲流通股份有限公司',
    items: [
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 10, unitPrice: 420, isGift: false, source: 'customer' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 8, unitPrice: 400, isGift: false, source: 'customer' },
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 6, unitPrice: 440, isGift: false, source: 'customer' }
    ],
    reviewedItems: [
      { productId: 'P003', name: '維他露 O 鋁罐', package: '一箱/24罐', qty: 10, unitPrice: 420, isGift: false, source: 'customer' },
      { productId: 'P006', name: '黑松沙士（罐裝）', package: '一箱/24罐', qty: 8, unitPrice: 400, isGift: false, source: 'customer' },
      { productId: 'P009', name: '可口可樂（罐裝）', package: '一箱/24罐', qty: 6, unitPrice: 440, isGift: false, source: 'customer' }
    ],
    transferredOrderId: null,
    transferredTime: null
  }
}

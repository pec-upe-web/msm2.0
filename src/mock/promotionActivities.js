export const promotionActivities = [
  {
    id: 'ACT001',
    name: '春季新品陳列推廣',
    status: 'active',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    description: '配合春季新產品上市，要求各門市完成指定商品陳列布置，拍照回傳作為稽核依據，並確認所有相關價簽及 POP 標示均已到位。',
    stores: [
      {
        customerId: 'C001',
        name: '大洋貿易',
        address: '台北市信義區光復南路123號',
        todos: [
          { id: 'ACT1-C001-T1', text: '完成輕量防水工作鞋主題陳列布置', requiresPhoto: true, completed: false, photos: [] },
          { id: 'ACT1-C001-T2', text: '張貼春季新品 POP 標牌', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT1-C001-T3', text: '確認價格標示正確無誤', requiresPhoto: false, completed: true, photos: [] }
        ]
      },
      {
        customerId: 'C002',
        name: '迅速供應',
        address: '新北市板橋區中山路200號',
        todos: [
          { id: 'ACT1-C002-T1', text: '補充陳列架庫存至安全水位', requiresPhoto: false, completed: false, photos: [] },
          { id: 'ACT1-C002-T2', text: '拍攝完成後陳列全貌照片', requiresPhoto: true, completed: false, photos: [] }
        ]
      },
      {
        customerId: 'C003',
        name: '綠能物流',
        address: '桃園市中壢區中正路456號',
        todos: [
          { id: 'ACT1-C003-T1', text: '更換入口展示區商品', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT1-C003-T2', text: '確認春季品類標示牌', requiresPhoto: false, completed: true, photos: [] },
          { id: 'ACT1-C003-T3', text: '提交本月陳列執行報告', requiresPhoto: false, completed: true, photos: [] }
        ]
      },
      {
        customerId: 'C004',
        name: '金堡科技',
        address: '台中市西屯區市政路89號',
        todos: [
          { id: 'ACT1-C004-T1', text: '調整工作防護品展區位置', requiresPhoto: true, completed: false, photos: [] },
          { id: 'ACT1-C004-T2', text: '補充環保提袋贈品庫存', requiresPhoto: false, completed: false, photos: [] }
        ]
      },
      {
        customerId: 'C005',
        name: '雄獅建材',
        address: '高雄市前鎮區中山二路78號',
        todos: [
          { id: 'ACT1-C005-T1', text: '完成工地安全用品展示區', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT1-C005-T2', text: '確認訂購截止日告知客戶', requiresPhoto: false, completed: true, photos: [] }
        ]
      }
    ]
  },
  {
    id: 'ACT002',
    name: '五一長假備貨促銷',
    status: 'upcoming',
    startDate: '2026-04-25',
    endDate: '2026-05-10',
    description: '配合五一連假消費旺季，協助各門市提前備貨，確保熱銷品項庫存充足，並完成指定宣傳品張貼及優惠方案說明。',
    stores: [
      {
        customerId: 'C001',
        name: '大洋貿易',
        address: '台北市信義區光復南路123號',
        todos: [
          { id: 'ACT2-C001-T1', text: '確認備貨清單並提交訂單', requiresPhoto: false, completed: false, photos: [] },
          { id: 'ACT2-C001-T2', text: '張貼長假優惠活動海報', requiresPhoto: true, completed: false, photos: [] }
        ]
      },
      {
        customerId: 'C003',
        name: '綠能物流',
        address: '桃園市中壢區中正路456號',
        todos: [
          { id: 'ACT2-C003-T1', text: '確認進貨時程與倉庫容量', requiresPhoto: false, completed: false, photos: [] },
          { id: 'ACT2-C003-T2', text: '完成收銀台周邊促銷品擺設', requiresPhoto: true, completed: false, photos: [] },
          { id: 'ACT2-C003-T3', text: '提交長假活動配合確認書', requiresPhoto: false, completed: false, photos: [] }
        ]
      },
      {
        customerId: 'C005',
        name: '雄獅建材',
        address: '高雄市前鎮區中山二路78號',
        todos: [
          { id: 'ACT2-C005-T1', text: '討論備貨方案與店長確認', requiresPhoto: false, completed: false, photos: [] }
        ]
      }
    ]
  },
  {
    id: 'ACT003',
    name: '工作安全週推廣',
    status: 'active',
    startDate: '2026-03-28',
    endDate: '2026-04-10',
    description: '配合全國工作安全週活動，推廣工業安全防護產品，各門市須完成指定商品展示並提供客戶宣導資料。',
    stores: [
      {
        customerId: 'C004',
        name: '金堡科技',
        address: '台中市西屯區市政路89號',
        todos: [
          { id: 'ACT3-C004-T1', text: '設置安全防護品專區', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT3-C004-T2', text: '發送安全週宣傳折頁', requiresPhoto: false, completed: true, photos: [] },
          { id: 'ACT3-C004-T3', text: '完成安全知識問答活動報名', requiresPhoto: false, completed: false, photos: [] }
        ]
      },
      {
        customerId: 'C005',
        name: '雄獅建材',
        address: '高雄市前鎮區中山二路78號',
        todos: [
          { id: 'ACT3-C005-T1', text: '更新安全防護展示架商品', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT3-C005-T2', text: '回傳客戶宣導活動執行照', requiresPhoto: true, completed: false, photos: [] }
        ]
      },
      {
        customerId: 'C002',
        name: '迅速供應',
        address: '新北市板橋區中山路200號',
        todos: [
          { id: 'ACT3-C002-T1', text: '補充安全手套及護目鏡庫存', requiresPhoto: false, completed: false, photos: [] }
        ]
      }
    ]
  },
  {
    id: 'ACT004',
    name: '年初庫存清倉活動',
    status: 'ended',
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    description: '年初庫存清倉，針對滯銷品及換季商品進行折扣促銷，協助各門市清理年末積壓庫存，回報結果後完成結案。',
    stores: [
      {
        customerId: 'C001',
        name: '大洋貿易',
        address: '台北市信義區光復南路123號',
        todos: [
          { id: 'ACT4-C001-T1', text: '完成清倉品項盤點回報', requiresPhoto: false, completed: true, photos: [] },
          { id: 'ACT4-C001-T2', text: '張貼清倉特賣標示', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT4-C001-T3', text: '提交活動結案報告', requiresPhoto: false, completed: true, photos: [] }
        ]
      },
      {
        customerId: 'C002',
        name: '迅速供應',
        address: '新北市板橋區中山路200號',
        todos: [
          { id: 'ACT4-C002-T1', text: '確認清倉品折扣標示', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT4-C002-T2', text: '回報滯銷品剩餘數量', requiresPhoto: false, completed: true, photos: [] }
        ]
      },
      {
        customerId: 'C003',
        name: '綠能物流',
        address: '桃園市中壢區中正路456號',
        todos: [
          { id: 'ACT4-C003-T1', text: '完成清倉區陳列', requiresPhoto: true, completed: true, photos: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400&auto=format&fit=crop'] },
          { id: 'ACT4-C003-T2', text: '提交回收品清單', requiresPhoto: false, completed: true, photos: [] }
        ]
      }
    ]
  }
]

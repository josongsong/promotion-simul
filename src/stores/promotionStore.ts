import { create } from 'zustand'

export interface Product {
  id: string
  name: string
  price: number
  category: string
  tags: string[]
  image: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: string
  name: string
  membershipTier: 'bronze' | 'silver' | 'gold' | 'vip'
  isNewUser: boolean
}

export interface Condition {
  target: 'cart' | 'user' | 'product'
  attribute: string
  operator: 'GTE' | 'LTE' | 'EQ' | 'IN_CATEGORY'
  value: string
  productId?: string
}

export interface ConditionGroup {
  id: number
  conditions: Condition[]
}

export interface Action {
  type: 'CART_PERCENT_DISCOUNT' | 'CART_FIXED_DISCOUNT' | 'PRODUCT_FIXED_DISCOUNT' | 'TIERED_DISCOUNT' | 'ADD_FREE_PRODUCT' | 'FREE_SHIPPING'
  value?: string
  productId?: string
  targetProductId?: string
  tiers?: Array<{
    quantity: number
    type: 'PERCENT' | 'FIXED'
    value: number
  }>
}

export interface Promotion {
  id: string
  name: string
  groupOperator: 'AND' | 'OR'
  conditionGroups: ConditionGroup[]
  actions: Action[]
  stackable: boolean
  priority: number
}

export interface AppliedPromotion {
  promotionId: string
  promotionName: string
  discountAmount: number
  metadata?: {
    description?: string
  }
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  appliedPromotions: AppliedPromotion[]
  finalTotal: number
}

interface PromotionState {
  // Data
  products: Product[]
  user: User
  cartItems: CartItem[]
  promotions: Promotion[]
  
  // Computed
  calculatedCart: Cart
  
  // Actions
  setUser: (user: User) => void
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateCartItemQuantity: (productId: string, quantity: number) => void
  addPromotion: (promotion: Promotion) => void
  removePromotion: (promotionId: string) => void
  calculateCart: () => void
}

// Mock data
const mockProducts: Product[] = [
  { 
    id: 'prod_101', 
    name: '라운드랩 자작나무 수분 선크림', 
    price: 25000, 
    category: 'skincare', 
    tags: ['sunscreen', 'moisture'],
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_102', 
    name: '메디힐 티트리 에센셜 마스크', 
    price: 2000, 
    category: 'skincare', 
    tags: ['mask', 'soothing'],
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_103', 
    name: '클리오 킬커버 파운웨어 쿠션', 
    price: 32000, 
    category: 'makeup', 
    tags: ['cushion', 'best-seller'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_104', 
    name: '롬앤 쥬시 래스팅 틴트', 
    price: 9900, 
    category: 'makeup', 
    tags: ['tint', 'lip'],
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_105', 
    name: '바닐라코 클린 잇 제로 클렌징 밤', 
    price: 18000, 
    category: 'cleansing', 
    tags: ['cleanser', 'best-seller'],
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_106', 
    name: '이니스프리 그린티 씨드 세럼', 
    price: 27000, 
    category: 'skincare', 
    tags: ['serum', 'moisture'],
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_107', 
    name: '에뛰드 순정 약산성 5.5 진정 토너', 
    price: 15000, 
    category: 'skincare', 
    tags: ['toner', 'soothing'],
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_108', 
    name: '페리페라 잉크 더 에어리 벨벳', 
    price: 9000, 
    category: 'makeup', 
    tags: ['tint', 'lip', 'velvet'],
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_109', 
    name: '아비브 어성초 스팟 패드 카밍터치', 
    price: 24000, 
    category: 'skincare', 
    tags: ['toner-pad', 'soothing'],
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_110', 
    name: '닥터자르트 시카페어 크림', 
    price: 48000, 
    category: 'skincare', 
    tags: ['cream', 'cicapair'],
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_111', 
    name: '아이오페 맨 올데이 퍼펙트 선크림', 
    price: 22000, 
    category: 'skincare', 
    tags: ['sunscreen', 'men'],
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_112', 
    name: '헤라 센슈얼 파우더 매트', 
    price: 35000, 
    category: 'makeup', 
    tags: ['powder', 'matte'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_113', 
    name: '설화수 자음생크림', 
    price: 120000, 
    category: 'skincare', 
    tags: ['cream', 'luxury'],
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_114', 
    name: '에뛰드하우스 블러 퍼펙트 쿠션', 
    price: 18000, 
    category: 'makeup', 
    tags: ['cushion', 'blur'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center'
  },
  { 
    id: 'prod_115', 
    name: '라네즈 워터뱅크 하이드로 크림', 
    price: 28000, 
    category: 'skincare', 
    tags: ['cream', 'hydration'],
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&crop=center'
  }
]

const mockUser: User = {
  id: 'user_123',
  name: '김혜인',
  membershipTier: 'gold',
  isNewUser: false,
}

// Promotion engine logic
function checkCondition(condition: Condition, cart: Cart, user: User): boolean {
  const { target, attribute, operator, value } = condition
  
  switch (target) {
    case 'cart':
      if (attribute === 'subtotal') {
        if (operator === 'GTE') return cart.subtotal >= parseFloat(value)
        if (operator === 'LTE') return cart.subtotal <= parseFloat(value)
      }
      if (attribute === 'item_count') {
        const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        if (operator === 'GTE') return totalCount >= parseInt(value, 10)
      }
      if (attribute === 'product_quantity') {
        const item = cart.items.find(i => i.product.id === condition.productId)
        if (!item) return false
        if (operator === 'GTE') return item.quantity >= parseInt(value, 10)
      }
      break
    case 'user':
      if (attribute === 'membershipTier') {
        if (operator === 'EQ') return user.membershipTier === value
      }
      if (attribute === 'isNewUser') {
        if (operator === 'EQ') return user.isNewUser === (value === 'true')
      }
      break
    case 'product':
      if (attribute === 'category') {
        if (operator === 'IN_CATEGORY') {
          return cart.items.some(item => item.product.category === value)
        }
      }
      break
    default: 
      return false
  }
  return false
}

function applyPromotions(cartItems: CartItem[], user: User, promotions: Promotion[]): Cart {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  let finalTotal = subtotal
  const appliedPromotions: AppliedPromotion[] = []

  const initialCartState: Cart = { items: cartItems, subtotal, finalTotal, appliedPromotions: [] }

  const applicablePromotions = promotions
    .filter(promo => {
      const { conditionGroups = [], groupOperator = 'AND' } = promo
      if (!conditionGroups || conditionGroups.length === 0) return true
      const groupResults = conditionGroups.map(group => 
        group.conditions.every(cond => checkCondition(cond, initialCartState, user))
      )
      if (groupOperator === 'AND') return groupResults.every(res => res === true)
      else return groupResults.some(res => res === true)
    })
    .sort((a, b) => a.priority - b.priority)

  let isNonStackableApplied = false

  for (const promo of applicablePromotions) {
    if (isNonStackableApplied && !promo.stackable) continue
    
    let discountAmountThisPromo = 0
    let promoApplied = false
    let promoMetadata: { description?: string } = {}

    for (const action of promo.actions) {
      switch (action.type) {
        case 'CART_PERCENT_DISCOUNT': {
          const discount = finalTotal * (parseFloat(action.value || '0') / 100)
          discountAmountThisPromo += discount
          finalTotal -= discount
          promoApplied = true
          break
        }
        case 'CART_FIXED_DISCOUNT': {
          const discount = parseFloat(action.value || '0')
          discountAmountThisPromo += discount
          finalTotal -= discount
          promoApplied = true
          break
        }
        case 'PRODUCT_FIXED_DISCOUNT': {
          const discount = parseFloat(action.value || '0')
          discountAmountThisPromo += discount
          finalTotal -= discount
          promoApplied = true
          break
        }
        case 'TIERED_DISCOUNT': {
          const item = cartItems.find(i => i.product.id === action.targetProductId)
          if (item && action.tiers) {
            const sortedTiers = action.tiers.sort((a, b) => b.quantity - a.quantity)
            const applicableTier = sortedTiers.find(tier => item.quantity >= tier.quantity)
            if (applicableTier) {
              let discount = 0
              if (applicableTier.type === 'PERCENT') {
                discount = (item.product.price * item.quantity) * (applicableTier.value / 100)
              } else {
                discount = applicableTier.value
              }
              discountAmountThisPromo += discount
              finalTotal -= discount
              promoApplied = true
              promoMetadata.description = `${item.product.name} ${applicableTier.quantity}개 이상, ${applicableTier.value}${applicableTier.type === 'PERCENT' ? '%' : '원'} 할인`
            }
          }
          break
        }
        case 'ADD_FREE_PRODUCT': {
          const giftProduct = mockProducts.find(p => p.id === action.productId)
          if (giftProduct) {
            promoApplied = true
            promoMetadata.description = `사은품: ${giftProduct.name}`
          }
          break
        }
        case 'FREE_SHIPPING': {
          promoApplied = true
          promoMetadata.description = '배송비 무료'
          break
        }
      }
    }
    
    if (promoApplied) {
      appliedPromotions.push({
        promotionId: promo.id,
        promotionName: promo.name,
        discountAmount: discountAmountThisPromo,
        metadata: promoMetadata
      })
    }
    if (!promo.stackable) isNonStackableApplied = true
  }

  return {
    items: cartItems,
    subtotal,
    appliedPromotions,
    finalTotal: Math.max(0, finalTotal),
  }
}

export const usePromotionStore = create<PromotionState>((set) => ({
  products: mockProducts,
  user: mockUser,
  cartItems: [],
  promotions: [],
  calculatedCart: { items: [], subtotal: 0, appliedPromotions: [], finalTotal: 0 },
  
  setUser: (user) => set({ user }),
  
  addToCart: (product) => set((state) => {
    const existingItem = state.cartItems.find(item => item.product.id === product.id)
    let newCartItems: CartItem[]
    
    if (existingItem) {
      newCartItems = state.cartItems.map(item =>
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCartItems = [...state.cartItems, { product, quantity: 1 }]
    }
    
    const newCart = applyPromotions(newCartItems, state.user, state.promotions)
    return { cartItems: newCartItems, calculatedCart: newCart }
  }),
  
  removeFromCart: (productId) => set((state) => {
    const newCartItems = state.cartItems.filter(item => item.product.id !== productId)
    const newCart = applyPromotions(newCartItems, state.user, state.promotions)
    return { cartItems: newCartItems, calculatedCart: newCart }
  }),
  
  updateCartItemQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      const newCartItems = state.cartItems.filter(item => item.product.id !== productId)
      const newCart = applyPromotions(newCartItems, state.user, state.promotions)
      return { cartItems: newCartItems, calculatedCart: newCart }
    }
    
    const newCartItems = state.cartItems.map(item =>
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    )
    const newCart = applyPromotions(newCartItems, state.user, state.promotions)
    return { cartItems: newCartItems, calculatedCart: newCart }
  }),
  
  addPromotion: (promotion) => set((state) => {
    const newPromotions = [...state.promotions, promotion]
    const newCart = applyPromotions(state.cartItems, state.user, newPromotions)
    return { promotions: newPromotions, calculatedCart: newCart }
  }),
  
  removePromotion: (promotionId) => set((state) => {
    const newPromotions = state.promotions.filter(p => p.id !== promotionId)
    const newCart = applyPromotions(state.cartItems, state.user, newPromotions)
    return { promotions: newPromotions, calculatedCart: newCart }
  }),
  
  calculateCart: () => set((state) => {
    const newCart = applyPromotions(state.cartItems, state.user, state.promotions)
    return { calculatedCart: newCart }
  }),
}))

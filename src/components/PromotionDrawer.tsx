import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, X, Percent, Gift, Truck, Package, TrendingUp } from "lucide-react"
import { usePromotionStore, type Promotion } from "@/stores/promotionStore"

interface PromotionDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAddPromotion: (promotion: Promotion) => void
}

export function PromotionDrawer({ isOpen, onClose, onAddPromotion }: PromotionDrawerProps) {
  const [step, setStep] = useState<'select_type' | 'configure'>('select_type')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const { products } = usePromotionStore()
  
  const initialPromoState: Omit<Promotion, 'id'> = {
    name: '',
    groupOperator: 'AND' as const,
    conditionGroups: [],
    actions: [],
    stackable: true,
    priority: 100
  }
  
  const [newPromo, setNewPromo] = useState<Omit<Promotion, 'id'>>(initialPromoState)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const resetAndClose = () => {
    onClose()
    setTimeout(() => {
      setStep('select_type')
      setSelectedType(null)
      setNewPromo(initialPromoState)
    }, 300)
  }

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    let basePromo = { ...initialPromoState }
    const defaultProduct = products[0]
    
    switch (type) {
      case 'discount':
        basePromo = {
          ...basePromo,
          name: '금액/비율 할인',
          actions: [{ type: 'CART_FIXED_DISCOUNT' as const, value: '' }],
          conditionGroups: [{
            id: Date.now(),
            conditions: [{ target: 'cart' as const, attribute: 'subtotal', operator: 'GTE' as const, value: '' }]
          }]
        }
        break
      case 'bogo':
        basePromo = {
          ...basePromo,
          name: 'BOGO 프로모션',
          actions: [{ type: 'PRODUCT_FIXED_DISCOUNT' as const, value: defaultProduct.price.toString() }],
          conditionGroups: [{
            id: Date.now(),
            conditions: [{ target: 'cart' as const, attribute: 'product_quantity', operator: 'GTE' as const, value: '2', productId: defaultProduct.id }]
          }]
        }
        break
      case 'free_shipping':
        basePromo = {
          ...basePromo,
          name: '무료 배송',
          actions: [{ type: 'FREE_SHIPPING' as const }],
          conditionGroups: [{
            id: Date.now(),
            conditions: [{ target: 'cart' as const, attribute: 'subtotal', operator: 'GTE' as const, value: '' }]
          }]
        }
        break
      case 'gwp':
        basePromo = {
          ...basePromo,
          name: '사은품 증정',
          actions: [{ type: 'ADD_FREE_PRODUCT' as const, productId: products[1].id }],
          conditionGroups: [{
            id: Date.now(),
            conditions: [{ target: 'cart' as const, attribute: 'subtotal', operator: 'GTE' as const, value: '' }]
          }]
        }
        break
      case 'tiered':
        basePromo = {
          ...basePromo,
          name: '다다익선 할인',
          actions: [{
            type: 'TIERED_DISCOUNT' as const,
            targetProductId: defaultProduct.id,
            tiers: [{ quantity: 2, type: 'PERCENT' as const, value: 10 }]
          }],
          conditionGroups: []
        }
        break
    }
    setNewPromo(basePromo)
    setStep('configure')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddPromotion({ ...newPromo, id: `promo_${Date.now()}` })
    resetAndClose()
  }

  const handleBack = () => {
    setStep('select_type')
    setNewPromo(initialPromoState)
  }

  const renderConfigureStep = () => {
    const addConditionGroup = () => {
      const newGroup = {
        id: Date.now(),
        conditions: [{ target: 'cart', attribute: 'subtotal', operator: 'GTE', value: '' }]
      }
      setNewPromo(p => ({ ...p, conditionGroups: [...p.conditionGroups, newGroup] }))
    }

    const addCondition = (groupIndex: number) => {
      const updatedGroups = [...newPromo.conditionGroups]
      updatedGroups[groupIndex].conditions.push({
        target: 'cart',
        attribute: 'subtotal',
        operator: 'GTE',
        value: ''
      })
      setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
    }

    const removeCondition = (groupIndex: number, conditionIndex: number) => {
      const updatedGroups = [...newPromo.conditionGroups]
      updatedGroups[groupIndex].conditions.splice(conditionIndex, 1)
      if (updatedGroups[groupIndex].conditions.length === 0) {
        updatedGroups.splice(groupIndex, 1)
      }
      setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
    }

    const removeConditionGroup = (groupIndex: number) => {
      const updatedGroups = [...newPromo.conditionGroups]
      updatedGroups.splice(groupIndex, 1)
      setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
    }

    const updateCondition = (groupIndex: number, conditionIndex: number, field: string, value: any) => {
      const updatedGroups = [...newPromo.conditionGroups]
      updatedGroups[groupIndex].conditions[conditionIndex][field] = value
      setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="promo-name">프로모션 이름</Label>
          <Input
            id="promo-name"
            placeholder="예: 여름맞이 특별 할인"
            value={newPromo.name}
            onChange={(e) => setNewPromo(p => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        
        {/* 프로모션 타입별 조건 및 액션 설정 */}
        {selectedType === 'discount' && (
          <div className="space-y-6">
            <div className="p-4 border rounded-lg space-y-4">
              <Label>할인 조건</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.target || 'cart'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].target = value as any
                    if (value === 'user') {
                      updatedGroups[0].conditions[0].attribute = 'membershipTier'
                      updatedGroups[0].conditions[0].operator = 'EQ'
                    } else if (value === 'cart') {
                      updatedGroups[0].conditions[0].attribute = 'subtotal'
                      updatedGroups[0].conditions[0].operator = 'GTE'
                    }
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cart">🛒 장바구니</SelectItem>
                    <SelectItem value="user">👤 사용자</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.attribute || 'subtotal'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].attribute = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                      <>
                        <SelectItem value="membershipTier">회원 등급</SelectItem>
                        <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="subtotal">총액</SelectItem>
                        <SelectItem value="item_count">상품 수량</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.operator || 'GTE'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].operator = value as any
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                      <>
                        <SelectItem value="EQ">= (같음)</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                        <SelectItem value="LTE">&lt;= (이하)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                newPromo.conditionGroups[0]?.conditions[0]?.attribute === 'membershipTier' ? (
                  <Select
                    value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'bronze'}
                    onValueChange={(value) => {
                      const updatedGroups = [...newPromo.conditionGroups]
                      updatedGroups[0].conditions[0].value = value
                      setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">🥉 브론즈</SelectItem>
                      <SelectItem value="silver">🥈 실버</SelectItem>
                      <SelectItem value="gold">🥇 골드</SelectItem>
                      <SelectItem value="vip">💎 VIP</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'true'}
                    onValueChange={(value) => {
                      const updatedGroups = [...newPromo.conditionGroups]
                      updatedGroups[0].conditions[0].value = value
                      setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">✨ 신규 회원</SelectItem>
                      <SelectItem value="false">👤 기존 회원</SelectItem>
                    </SelectContent>
                  </Select>
                )
              ) : (
                <Input
                  type="number"
                  placeholder="조건값 (예: 50000)"
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || ''}
                  onChange={(e) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = e.target.value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                  required
                />
              )}
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <Label>할인 내용</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={newPromo.actions[0]?.type || 'CART_FIXED_DISCOUNT'}
                  onValueChange={(value) => {
                    const updatedActions = [...newPromo.actions]
                    updatedActions[0].type = value as any
                    setNewPromo(p => ({ ...p, actions: updatedActions }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CART_FIXED_DISCOUNT">금액 할인(원)</SelectItem>
                    <SelectItem value="CART_PERCENT_DISCOUNT">비율 할인(%)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="할인 값 (예: 5000, 10)"
                  value={newPromo.actions[0]?.value || ''}
                  onChange={(e) => {
                    const updatedActions = [...newPromo.actions]
                    updatedActions[0].value = e.target.value
                    setNewPromo(p => ({ ...p, actions: updatedActions }))
                  }}
                  required
                />
              </div>
            </div>
          </div>
        )}
        
        {selectedType === 'free_shipping' && (
          <div className="p-4 border rounded-lg space-y-4">
            <Label>무료 배송 조건</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newPromo.conditionGroups[0]?.conditions[0]?.target || 'cart'}
                onValueChange={(value) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].target = value as any
                  if (value === 'user') {
                    updatedGroups[0].conditions[0].attribute = 'membershipTier'
                    updatedGroups[0].conditions[0].operator = 'EQ'
                  } else if (value === 'cart') {
                    updatedGroups[0].conditions[0].attribute = 'subtotal'
                    updatedGroups[0].conditions[0].operator = 'GTE'
                  }
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cart">🛒 장바구니</SelectItem>
                  <SelectItem value="user">👤 사용자</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={newPromo.conditionGroups[0]?.conditions[0]?.attribute || 'subtotal'}
                onValueChange={(value) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].attribute = value
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                    <>
                      <SelectItem value="membershipTier">회원 등급</SelectItem>
                      <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="subtotal">장바구니 총액</SelectItem>
                      <SelectItem value="item_count">상품 수량</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              
              <Select
                value={newPromo.conditionGroups[0]?.conditions[0]?.operator || 'GTE'}
                onValueChange={(value) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].operator = value as any
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                    <>
                      <SelectItem value="EQ">= (같음)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                      <SelectItem value="LTE">&lt;= (이하)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
              newPromo.conditionGroups[0]?.conditions[0]?.attribute === 'membershipTier' ? (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'bronze'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">🥉 브론즈</SelectItem>
                    <SelectItem value="silver">🥈 실버</SelectItem>
                    <SelectItem value="gold">🥇 골드</SelectItem>
                    <SelectItem value="vip">💎 VIP</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'true'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">✨ 신규 회원</SelectItem>
                    <SelectItem value="false">👤 기존 회원</SelectItem>
                  </SelectContent>
                </Select>
              )
            ) : (
              <Input
                type="number"
                placeholder="금액 또는 수량 (예: 30000, 3)"
                value={newPromo.conditionGroups[0]?.conditions[0]?.value || ''}
                onChange={(e) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].value = e.target.value
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
                required
              />
            )}
          </div>
        )}
        
        {selectedType === 'gwp' && (
          <div className="p-4 border rounded-lg space-y-4">
            <Label>사은품 증정 조건</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newPromo.conditionGroups[0]?.conditions[0]?.target || 'cart'}
                onValueChange={(value) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].target = value as any
                  if (value === 'user') {
                    updatedGroups[0].conditions[0].attribute = 'membershipTier'
                    updatedGroups[0].conditions[0].operator = 'EQ'
                  } else if (value === 'cart') {
                    updatedGroups[0].conditions[0].attribute = 'subtotal'
                    updatedGroups[0].conditions[0].operator = 'GTE'
                  }
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cart">장바구니</SelectItem>
                  <SelectItem value="user">사용자</SelectItem>
                </SelectContent>
              </Select>
              
              {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.attribute || 'membershipTier'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].attribute = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="membershipTier">회원 등급</SelectItem>
                    <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.attribute || 'subtotal'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].attribute = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subtotal">장바구니 총액</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select
                value={newPromo.conditionGroups[0]?.conditions[0]?.operator || 'GTE'}
                onValueChange={(value) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].operator = value as any
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                    <>
                      <SelectItem value="EQ">= (같음)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
              newPromo.conditionGroups[0]?.conditions[0]?.attribute === 'membershipTier' ? (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'bronze'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">브론즈</SelectItem>
                    <SelectItem value="silver">실버</SelectItem>
                    <SelectItem value="gold">골드</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'true'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">신규 회원</SelectItem>
                    <SelectItem value="false">기존 회원</SelectItem>
                  </SelectContent>
                </Select>
              )
            ) : (
              <Input
                type="number"
                placeholder="금액 (예: 50000)"
                value={newPromo.conditionGroups[0]?.conditions[0]?.value || ''}
                onChange={(e) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].value = e.target.value
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
                required
              />
            )}
            
            <Separator />
            <div className="pt-4 space-y-2">
              <Label>증정 사은품</Label>
              <Select
                value={newPromo.actions[0]?.productId || ''}
                onValueChange={(value) => {
                  const updatedActions = [...newPromo.actions]
                  updatedActions[0].productId = value
                  setNewPromo(p => ({ ...p, actions: updatedActions }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {selectedType === 'bogo' && (
          <div className="space-y-6">
            <div className="p-4 border rounded-lg space-y-4">
              <Label>BOGO 조건 (Buy)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.productId || ''}
                  onValueChange={(value) => {
                    const selectedProduct = products.find(p => p.id === value)
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].productId = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                    
                    const updatedActions = [...newPromo.actions]
                    updatedActions[0].value = selectedProduct ? selectedProduct.price.toString() : '0'
                    setNewPromo(prev => ({ ...prev, actions: updatedActions }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상품 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="구매 수량 (예: 2)"
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || ''}
                  onChange={(e) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = e.target.value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                  required
                />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg space-y-2">
              <Label>BOGO 혜택 (Get)</Label>
              <p className="text-sm">
                1개 상품 금액({(newPromo.actions[0]?.value || 0).toLocaleString()}원)이 할인됩니다.
              </p>
            </div>
          </div>
        )}
        
        {selectedType === 'tiered' && (
          <div className="p-4 border rounded-lg space-y-4">
            <Label>다다익선 할인 조건</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newPromo.conditionGroups[0]?.conditions[0]?.target || 'cart'}
                onValueChange={(value) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  if (updatedGroups.length === 0) {
                    updatedGroups.push({ id: Date.now(), conditions: [] })
                  }
                  if (updatedGroups[0].conditions.length === 0) {
                    updatedGroups[0].conditions.push({ target: 'cart', attribute: 'subtotal', operator: 'GTE', value: '' })
                  }
                  updatedGroups[0].conditions[0].target = value as any
                  if (value === 'user') {
                    updatedGroups[0].conditions[0].attribute = 'membershipTier'
                    updatedGroups[0].conditions[0].operator = 'EQ'
                  } else if (value === 'cart') {
                    updatedGroups[0].conditions[0].attribute = 'subtotal'
                    updatedGroups[0].conditions[0].operator = 'GTE'
                  }
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cart">장바구니</SelectItem>
                  <SelectItem value="user">사용자</SelectItem>
                </SelectContent>
              </Select>
              
              {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.attribute || 'membershipTier'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].attribute = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="membershipTier">회원 등급</SelectItem>
                    <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.attribute || 'subtotal'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].attribute = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subtotal">장바구니 총액</SelectItem>
                    <SelectItem value="item_count">상품 수량</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select
                value={newPromo.conditionGroups[0]?.conditions[0]?.operator || 'GTE'}
                onValueChange={(value) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].operator = value as any
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
                    <>
                      <SelectItem value="EQ">= (같음)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                      <SelectItem value="LTE">&lt;= (이하)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {newPromo.conditionGroups[0]?.conditions[0]?.target === 'user' ? (
              newPromo.conditionGroups[0]?.conditions[0]?.attribute === 'membershipTier' ? (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'bronze'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">브론즈</SelectItem>
                    <SelectItem value="silver">실버</SelectItem>
                    <SelectItem value="gold">골드</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newPromo.conditionGroups[0]?.conditions[0]?.value || 'true'}
                  onValueChange={(value) => {
                    const updatedGroups = [...newPromo.conditionGroups]
                    updatedGroups[0].conditions[0].value = value
                    setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">신규 회원</SelectItem>
                    <SelectItem value="false">기존 회원</SelectItem>
                  </SelectContent>
                </Select>
              )
            ) : (
              <Input
                type="number"
                placeholder="조건값 (예: 50000)"
                value={newPromo.conditionGroups[0]?.conditions[0]?.value || ''}
                onChange={(e) => {
                  const updatedGroups = [...newPromo.conditionGroups]
                  updatedGroups[0].conditions[0].value = e.target.value
                  setNewPromo(p => ({ ...p, conditionGroups: updatedGroups }))
                }}
              />
            )}
            
            <Separator />
            <div className="pt-4 space-y-2">
              <Label>할인 대상 상품</Label>
              <Select
                value={newPromo.actions[0]?.targetProductId || ''}
                onValueChange={(value) => {
                  const updatedActions = [...newPromo.actions]
                  updatedActions[0].targetProductId = value
                  setNewPromo(p => ({ ...p, actions: updatedActions }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상품 선택" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            <div className="pt-4 space-y-2">
              <Label>계층별 할인 설정</Label>
              <div className="space-y-2">
                {newPromo.actions[0]?.tiers?.map((tier, index) => (
                  <div key={index} className="flex items-center gap-2 relative">
                    <Input
                      type="number"
                      placeholder="수량"
                      value={tier.quantity}
                      onChange={(e) => {
                        const updatedActions = [...newPromo.actions]
                        updatedActions[0].tiers[index].quantity = parseInt(e.target.value) || 0
                        setNewPromo(p => ({ ...p, actions: updatedActions }))
                      }}
                    />
                    <span>개 이상</span>
                    <Select
                      value={tier.type}
                      onValueChange={(value) => {
                        const updatedActions = [...newPromo.actions]
                        updatedActions[0].tiers[index].type = value as 'PERCENT' | 'FIXED'
                        setNewPromo(p => ({ ...p, actions: updatedActions }))
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">%</SelectItem>
                        <SelectItem value="FIXED">원</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="할인 값"
                      value={tier.value}
                      onChange={(e) => {
                        const updatedActions = [...newPromo.actions]
                        updatedActions[0].tiers[index].value = parseInt(e.target.value) || 0
                        setNewPromo(p => ({ ...p, actions: updatedActions }))
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const updatedActions = [...newPromo.actions]
                        updatedActions[0].tiers.splice(index, 1)
                        setNewPromo(p => ({ ...p, actions: updatedActions }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const updatedActions = [...newPromo.actions]
                  updatedActions[0].tiers.push({ quantity: 3, type: 'PERCENT', value: 15 })
                  setNewPromo(p => ({ ...p, actions: updatedActions }))
                }}
              >
                계층 추가
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={resetAndClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Card className="max-h-[80vh] flex flex-col rounded-t-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
              <div className="flex items-center">
                {step === 'configure' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="mr-2 h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <CardTitle>
                    {step === 'select_type' ? '프로모션 유형 선택' : '프로모션 세부 설정'}
                  </CardTitle>
                  <CardDescription>
                    {step === 'select_type'
                      ? '적용할 프로모션의 기본 유형을 선택하세요.'
                      : '규칙을 설정하여 프로모션을 완성하세요.'}
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={resetAndClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
              {step === 'select_type' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('discount')}
                    className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-accent transition-colors"
                  >
                    <Percent className="h-8 w-8 mb-2" />
                    <span className="font-semibold">금액/비율 할인</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('bogo')}
                    className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-accent transition-colors"
                  >
                    <Gift className="h-8 w-8 mb-2" />
                    <span className="font-semibold">BOGO (1+1 등)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('free_shipping')}
                    className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-accent transition-colors"
                  >
                    <Truck className="h-8 w-8 mb-2" />
                    <span className="font-semibold">무료 배송</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('gwp')}
                    className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-accent transition-colors"
                  >
                    <Package className="h-8 w-8 mb-2" />
                    <span className="font-semibold">사은품 증정</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('tiered')}
                    className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-accent transition-colors"
                  >
                    <TrendingUp className="h-8 w-8 mb-2" />
                    <span className="font-semibold">다다익선 할인</span>
                  </button>
                </div>
              )}
              {step === 'configure' && renderConfigureStep()}
              </div>
            </CardContent>
            {step === 'configure' && (
              <CardFooter className="bg-muted/50 border-t flex-shrink-0">
                <Button type="submit" className="w-full">
                  프로모션 저장
                </Button>
              </CardFooter>
            )}
          </form>
        </Card>
      </div>
    </>
  )
}

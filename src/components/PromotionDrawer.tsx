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
        conditions: [{ target: 'cart' as const, attribute: 'subtotal', operator: 'GTE' as const, value: '' }]
      }
      setNewPromo(p => ({ ...p, conditionGroups: [...p.conditionGroups, newGroup] }))
    }

    const addCondition = (groupIndex: number) => {
      const updatedGroups = [...newPromo.conditionGroups]
      updatedGroups[groupIndex].conditions.push({
        target: 'cart' as const,
        attribute: 'subtotal',
        operator: 'GTE' as const,
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
            {/* 조건 그룹 간 연산자 선택 */}
            <div className="p-4 border rounded-lg space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">조건 그룹 연산자</Label>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {newPromo.groupOperator === 'AND' ? '모든 그룹 만족' : '하나 이상 만족'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'AND' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'AND'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'AND' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">AND</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">모든 조건 그룹이 만족</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'OR' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'OR'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'OR' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">OR</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">하나 이상의 그룹이 만족</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>할인 조건</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConditionGroup}
                  className="flex items-center gap-2"
                >
                  <span>+</span>
                  조건 그룹 추가
                </Button>
              </div>
              {/* 조건 그룹들 렌더링 */}
              {newPromo.conditionGroups.map((group, groupIndex) => (
                <div key={group.id} className="space-y-4">
                  {/* 그룹 간 연산자 표시 */}
                  {groupIndex > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        newPromo.groupOperator === 'AND' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          newPromo.groupOperator === 'AND' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        {newPromo.groupOperator === 'AND' ? 'AND' : 'OR'}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30 relative">
                    {/* 그룹 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          newPromo.groupOperator === 'AND' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {groupIndex + 1}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">조건 그룹 {groupIndex + 1}</Label>
                          <p className="text-xs text-muted-foreground">
                            그룹 내 모든 조건이 만족되어야 함 (AND)
                          </p>
                        </div>
                      </div>
                      {newPromo.conditionGroups.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConditionGroup(groupIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={condition.target}
                          onValueChange={(value) => {
                            updateCondition(groupIndex, conditionIndex, 'target', value)
                            if (value === 'user') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'membershipTier')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'EQ')
                            } else if (value === 'cart') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'subtotal')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'GTE')
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cart">🛒 장바구니</SelectItem>
                            <SelectItem value="user">👤 사용자</SelectItem>
                            <SelectItem value="product">📦 상품</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.attribute}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'attribute', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="membershipTier">회원 등급</SelectItem>
                                <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                              </>
                            ) : condition.target === 'product' ? (
                              <>
                                <SelectItem value="category">카테고리</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="subtotal">총액</SelectItem>
                                <SelectItem value="item_count">상품 수량</SelectItem>
                                <SelectItem value="product_quantity">특정 상품 수량</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            ) : condition.attribute === 'category' ? (
                              <>
                                <SelectItem value="IN_CATEGORY">포함</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                                <SelectItem value="LTE">&lt;= (이하)</SelectItem>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* 값 입력 필드 */}
                      {condition.target === 'user' ? (
                        condition.attribute === 'membershipTier' ? (
                          <Select
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                      ) : condition.attribute === 'category' ? (
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skincare">스킨케어</SelectItem>
                            <SelectItem value="makeup">메이크업</SelectItem>
                            <SelectItem value="cleansing">클렌징</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : condition.attribute === 'product_quantity' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={condition.productId || ''}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'productId', value)}
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
                            placeholder="수량"
                            value={condition.value}
                            onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                          />
                        </div>
                      ) : (
                        <Input
                          type="number"
                          placeholder="조건값 (예: 50000)"
                          value={condition.value}
                          onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                        />
                      )}
                      
                      {/* 조건 삭제 버튼 */}
                      {group.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(groupIndex, conditionIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          조건 삭제
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {/* 조건 추가 버튼 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(groupIndex)}
                    className="flex items-center gap-2 w-full"
                  >
                    <span>+</span>
                    조건 추가
                  </Button>
                </div>
              </div>
              ))}
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
          <div className="space-y-6">
            {/* 조건 그룹 간 연산자 선택 */}
            <div className="p-4 border rounded-lg space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">조건 그룹 연산자</Label>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {newPromo.groupOperator === 'AND' ? '모든 그룹 만족' : '하나 이상 만족'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'AND' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'AND'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'AND' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">AND</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">모든 조건 그룹이 만족</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'OR' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'OR'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'OR' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">OR</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">하나 이상의 그룹이 만족</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>무료 배송 조건</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConditionGroup}
                  className="flex items-center gap-2"
                >
                  <span>+</span>
                  조건 그룹 추가
                </Button>
              </div>
              {/* 조건 그룹들 렌더링 */}
              {newPromo.conditionGroups.map((group, groupIndex) => (
                <div key={group.id} className="space-y-4">
                  {/* 그룹 간 연산자 표시 */}
                  {groupIndex > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        newPromo.groupOperator === 'AND' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          newPromo.groupOperator === 'AND' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        {newPromo.groupOperator === 'AND' ? 'AND' : 'OR'}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30 relative">
                    {/* 그룹 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          newPromo.groupOperator === 'AND' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {groupIndex + 1}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">조건 그룹 {groupIndex + 1}</Label>
                          <p className="text-xs text-muted-foreground">
                            그룹 내 모든 조건이 만족되어야 함 (AND)
                          </p>
                        </div>
                      </div>
                      {newPromo.conditionGroups.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConditionGroup(groupIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={condition.target}
                          onValueChange={(value) => {
                            updateCondition(groupIndex, conditionIndex, 'target', value)
                            if (value === 'user') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'membershipTier')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'EQ')
                            } else if (value === 'cart') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'subtotal')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'GTE')
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cart">🛒 장바구니</SelectItem>
                            <SelectItem value="user">👤 사용자</SelectItem>
                            <SelectItem value="product">📦 상품</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.attribute}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'attribute', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="membershipTier">회원 등급</SelectItem>
                                <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                              </>
                            ) : condition.target === 'product' ? (
                              <>
                                <SelectItem value="category">카테고리</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="subtotal">총액</SelectItem>
                                <SelectItem value="item_count">상품 수량</SelectItem>
                                <SelectItem value="product_quantity">특정 상품 수량</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            ) : condition.attribute === 'category' ? (
                              <>
                                <SelectItem value="IN_CATEGORY">포함</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                                <SelectItem value="LTE">&lt;= (이하)</SelectItem>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* 값 입력 필드 */}
                      {condition.target === 'user' ? (
                        condition.attribute === 'membershipTier' ? (
                          <Select
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                      ) : condition.attribute === 'category' ? (
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skincare">스킨케어</SelectItem>
                            <SelectItem value="makeup">메이크업</SelectItem>
                            <SelectItem value="cleansing">클렌징</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : condition.attribute === 'product_quantity' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={condition.productId || ''}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'productId', value)}
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
                            placeholder="수량"
                            value={condition.value}
                            onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                          />
                        </div>
                      ) : (
                        <Input
                          type="number"
                          placeholder="조건값 (예: 50000)"
                          value={condition.value}
                          onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                        />
                      )}
                      
                      {/* 조건 삭제 버튼 */}
                      {group.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(groupIndex, conditionIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          조건 삭제
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {/* 조건 추가 버튼 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(groupIndex)}
                    className="flex items-center gap-2 w-full"
                  >
                    <span>+</span>
                    조건 추가
                  </Button>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedType === 'gwp' && (
          <div className="space-y-6">
            {/* 조건 그룹 간 연산자 선택 */}
            <div className="p-4 border rounded-lg space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">조건 그룹 연산자</Label>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {newPromo.groupOperator === 'AND' ? '모든 그룹 만족' : '하나 이상 만족'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'AND' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'AND'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'AND' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">AND</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">모든 조건 그룹이 만족</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'OR' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'OR'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'OR' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">OR</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">하나 이상의 그룹이 만족</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>사은품 증정 조건</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConditionGroup}
                  className="flex items-center gap-2"
                >
                  <span>+</span>
                  조건 그룹 추가
                </Button>
              </div>
              {/* 조건 그룹들 렌더링 */}
              {newPromo.conditionGroups.map((group, groupIndex) => (
                <div key={group.id} className="space-y-4">
                  {/* 그룹 간 연산자 표시 */}
                  {groupIndex > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        newPromo.groupOperator === 'AND' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          newPromo.groupOperator === 'AND' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        {newPromo.groupOperator === 'AND' ? 'AND' : 'OR'}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30 relative">
                    {/* 그룹 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          newPromo.groupOperator === 'AND' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {groupIndex + 1}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">조건 그룹 {groupIndex + 1}</Label>
                          <p className="text-xs text-muted-foreground">
                            그룹 내 모든 조건이 만족되어야 함 (AND)
                          </p>
                        </div>
                      </div>
                      {newPromo.conditionGroups.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConditionGroup(groupIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={condition.target}
                          onValueChange={(value) => {
                            updateCondition(groupIndex, conditionIndex, 'target', value)
                            if (value === 'user') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'membershipTier')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'EQ')
                            } else if (value === 'cart') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'subtotal')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'GTE')
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cart">🛒 장바구니</SelectItem>
                            <SelectItem value="user">👤 사용자</SelectItem>
                            <SelectItem value="product">📦 상품</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.attribute}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'attribute', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="membershipTier">회원 등급</SelectItem>
                                <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                              </>
                            ) : condition.target === 'product' ? (
                              <>
                                <SelectItem value="category">카테고리</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="subtotal">총액</SelectItem>
                                <SelectItem value="item_count">상품 수량</SelectItem>
                                <SelectItem value="product_quantity">특정 상품 수량</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            ) : condition.attribute === 'category' ? (
                              <>
                                <SelectItem value="IN_CATEGORY">포함</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                                <SelectItem value="LTE">&lt;= (이하)</SelectItem>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* 값 입력 필드 */}
                      {condition.target === 'user' ? (
                        condition.attribute === 'membershipTier' ? (
                          <Select
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                      ) : condition.attribute === 'category' ? (
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skincare">스킨케어</SelectItem>
                            <SelectItem value="makeup">메이크업</SelectItem>
                            <SelectItem value="cleansing">클렌징</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : condition.attribute === 'product_quantity' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={condition.productId || ''}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'productId', value)}
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
                            placeholder="수량"
                            value={condition.value}
                            onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                          />
                        </div>
                      ) : (
                        <Input
                          type="number"
                          placeholder="조건값 (예: 50000)"
                          value={condition.value}
                          onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                        />
                      )}
                      
                      {/* 조건 삭제 버튼 */}
                      {group.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(groupIndex, conditionIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          조건 삭제
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {/* 조건 추가 버튼 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(groupIndex)}
                    className="flex items-center gap-2 w-full"
                  >
                    <span>+</span>
                    조건 추가
                  </Button>
                </div>
              </div>
              ))}
            </div>
            
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
            {/* 조건 그룹 간 연산자 선택 */}
            <div className="p-4 border rounded-lg space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">조건 그룹 연산자</Label>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {newPromo.groupOperator === 'AND' ? '모든 그룹 만족' : '하나 이상 만족'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'AND' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'AND'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'AND' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">AND</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">모든 조건 그룹이 만족</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'OR' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'OR'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'OR' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">OR</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">하나 이상의 그룹이 만족</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>BOGO 조건 (Buy)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConditionGroup}
                  className="flex items-center gap-2"
                >
                  <span>+</span>
                  조건 그룹 추가
                </Button>
              </div>
              {/* 조건 그룹들 렌더링 */}
              {newPromo.conditionGroups.map((group, groupIndex) => (
                <div key={group.id} className="space-y-4">
                  {/* 그룹 간 연산자 표시 */}
                  {groupIndex > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        newPromo.groupOperator === 'AND' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          newPromo.groupOperator === 'AND' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        {newPromo.groupOperator === 'AND' ? 'AND' : 'OR'}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30 relative">
                    {/* 그룹 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          newPromo.groupOperator === 'AND' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {groupIndex + 1}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">조건 그룹 {groupIndex + 1}</Label>
                          <p className="text-xs text-muted-foreground">
                            그룹 내 모든 조건이 만족되어야 함 (AND)
                          </p>
                        </div>
                      </div>
                      {newPromo.conditionGroups.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConditionGroup(groupIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={condition.productId || ''}
                          onValueChange={(value) => {
                            const selectedProduct = products.find(p => p.id === value)
                            updateCondition(groupIndex, conditionIndex, 'productId', value)
                            
                            // BOGO의 경우 할인액을 상품 가격으로 설정
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
                          value={condition.value}
                          onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                          required
                        />
                      </div>
                      
                      {/* 조건 삭제 버튼 */}
                      {group.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(groupIndex, conditionIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          조건 삭제
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {/* 조건 추가 버튼 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(groupIndex)}
                    className="flex items-center gap-2 w-full"
                  >
                    <span>+</span>
                    조건 추가
                  </Button>
                </div>
              </div>
              ))}
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
          <div className="space-y-6">
            {/* 조건 그룹 간 연산자 선택 */}
            <div className="p-4 border rounded-lg space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">조건 그룹 연산자</Label>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {newPromo.groupOperator === 'AND' ? '모든 그룹 만족' : '하나 이상 만족'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'AND' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'AND'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'AND' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">AND</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">모든 조건 그룹이 만족</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPromo(p => ({ ...p, groupOperator: 'OR' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newPromo.groupOperator === 'OR'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {newPromo.groupOperator === 'OR' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">OR</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">하나 이상의 그룹이 만족</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>할인 조건</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConditionGroup}
                  className="flex items-center gap-2"
                >
                  <span>+</span>
                  조건 그룹 추가
                </Button>
              </div>
              {/* 조건 그룹들 렌더링 */}
              {newPromo.conditionGroups.map((group, groupIndex) => (
                <div key={group.id} className="space-y-4">
                  {/* 그룹 간 연산자 표시 */}
                  {groupIndex > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        newPromo.groupOperator === 'AND' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          newPromo.groupOperator === 'AND' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        {newPromo.groupOperator === 'AND' ? 'AND' : 'OR'}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30 relative">
                    {/* 그룹 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          newPromo.groupOperator === 'AND' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {groupIndex + 1}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">조건 그룹 {groupIndex + 1}</Label>
                          <p className="text-xs text-muted-foreground">
                            그룹 내 모든 조건이 만족되어야 함 (AND)
                          </p>
                        </div>
                      </div>
                      {newPromo.conditionGroups.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConditionGroup(groupIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={condition.target}
                          onValueChange={(value) => {
                            updateCondition(groupIndex, conditionIndex, 'target', value)
                            if (value === 'user') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'membershipTier')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'EQ')
                            } else if (value === 'cart') {
                              updateCondition(groupIndex, conditionIndex, 'attribute', 'subtotal')
                              updateCondition(groupIndex, conditionIndex, 'operator', 'GTE')
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cart">🛒 장바구니</SelectItem>
                            <SelectItem value="user">👤 사용자</SelectItem>
                            <SelectItem value="product">📦 상품</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.attribute}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'attribute', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="membershipTier">회원 등급</SelectItem>
                                <SelectItem value="isNewUser">신규 회원 여부</SelectItem>
                              </>
                            ) : condition.target === 'product' ? (
                              <>
                                <SelectItem value="category">카테고리</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="subtotal">총액</SelectItem>
                                <SelectItem value="item_count">상품 수량</SelectItem>
                                <SelectItem value="product_quantity">특정 상품 수량</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.target === 'user' ? (
                              <>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            ) : condition.attribute === 'category' ? (
                              <>
                                <SelectItem value="IN_CATEGORY">포함</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="GTE">&gt;= (이상)</SelectItem>
                                <SelectItem value="LTE">&lt;= (이하)</SelectItem>
                                <SelectItem value="EQ">= (같음)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* 값 입력 필드 */}
                      {condition.target === 'user' ? (
                        condition.attribute === 'membershipTier' ? (
                          <Select
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                            value={condition.value}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
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
                      ) : condition.attribute === 'category' ? (
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skincare">스킨케어</SelectItem>
                            <SelectItem value="makeup">메이크업</SelectItem>
                            <SelectItem value="cleansing">클렌징</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : condition.attribute === 'product_quantity' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={condition.productId || ''}
                            onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'productId', value)}
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
                            placeholder="수량"
                            value={condition.value}
                            onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                          />
                        </div>
                      ) : (
                        <Input
                          type="number"
                          placeholder="조건값 (예: 50000)"
                          value={condition.value}
                          onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                        />
                      )}
                      
                      {/* 조건 삭제 버튼 */}
                      {group.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(groupIndex, conditionIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          조건 삭제
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {/* 조건 추가 버튼 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(groupIndex)}
                    className="flex items-center gap-2 w-full"
                  >
                    <span>+</span>
                    조건 추가
                  </Button>
                </div>
              </div>
              ))}
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
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
            
            <div className="p-4 border rounded-lg space-y-4">
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
        <Card className="h-[85vh] flex flex-col rounded-t-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between border-b">
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
            <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-6 min-h-0">
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

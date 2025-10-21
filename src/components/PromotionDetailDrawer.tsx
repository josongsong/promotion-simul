import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, X } from "lucide-react"
import { usePromotionStore, type Promotion } from "@/stores/promotionStore"

interface PromotionDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAddPromotion: (promotion: Promotion) => void
  selectedType: string
}

export function PromotionDetailDrawer({ isOpen, onClose, onAddPromotion, selectedType }: PromotionDetailDrawerProps) {
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
      setNewPromo(initialPromoState)
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPromo.name.trim()) return
    
    const promotion: Promotion = {
      ...newPromo,
      id: Date.now().toString(),
      type: selectedType as any
    }
    
    onAddPromotion(promotion)
    resetAndClose()
  }

  const addConditionGroup = () => {
    const newGroup = {
      id: Date.now().toString(),
      conditions: [{
        target: 'cart' as const,
        attribute: 'subtotal' as const,
        operator: 'GTE' as const,
        value: '0'
      }]
    }
    setNewPromo(p => ({
      ...p,
      conditionGroups: [...p.conditionGroups, newGroup]
    }))
  }

  const removeConditionGroup = (index: number) => {
    setNewPromo(p => ({
      ...p,
      conditionGroups: p.conditionGroups.filter((_, i) => i !== index)
    }))
  }

  const addCondition = (groupIndex: number) => {
    const newCondition = {
      target: 'cart' as const,
      attribute: 'subtotal' as const,
      operator: 'GTE' as const,
      value: '0'
    }
    setNewPromo(p => ({
      ...p,
      conditionGroups: p.conditionGroups.map((group, i) => 
        i === groupIndex 
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group
      )
    }))
  }

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    setNewPromo(p => ({
      ...p,
      conditionGroups: p.conditionGroups.map((group, i) => 
        i === groupIndex 
          ? { ...group, conditions: group.conditions.filter((_, j) => j !== conditionIndex) }
          : group
      )
    }))
  }

  const updateCondition = (groupIndex: number, conditionIndex: number, field: string, value: string) => {
    setNewPromo(p => ({
      ...p,
      conditionGroups: p.conditionGroups.map((group, i) => 
        i === groupIndex 
          ? { 
              ...group, 
              conditions: group.conditions.map((condition, j) => 
                j === conditionIndex 
                  ? { ...condition, [field]: value }
                  : condition
              )
            }
          : group
      )
    }))
  }

  if (!isOpen) return null

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
               <Card className="h-[90vh] flex flex-col rounded-t-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between border-b">
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={resetAndClose}
                  className="mr-2 h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>프로모션 세부 설정</CardTitle>
                  <CardDescription>
                    규칙을 설정하여 프로모션을 완성하세요.
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
                      <div className="flex items-center justify-between">
                        <Label>할인 조건</Label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={newPromo.groupOperator}
                            onValueChange={(value) => setNewPromo(p => ({ ...p, groupOperator: value as 'AND' | 'OR' }))}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
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
                      </div>
                      {/* 조건 그룹들 렌더링 */}
                      {newPromo.conditionGroups.map((group, groupIndex) => (
                        <div key={group.id} className="space-y-4">
                          {/* 그룹 간 연산자 표시 */}
                          {groupIndex > 0 && (
                            <div className="flex items-center justify-center py-2">
                              <button
                                type="button"
                                onClick={() => setNewPromo(p => ({ 
                                  ...p, 
                                  groupOperator: p.groupOperator === 'AND' ? 'OR' : 'AND' 
                                }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                                  newPromo.groupOperator === 'AND' 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' 
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  newPromo.groupOperator === 'AND' ? 'bg-blue-500' : 'bg-green-500'
                                }`} />
                                {newPromo.groupOperator === 'AND' ? 'AND' : 'OR'}
                                <span className="text-xs opacity-70">(클릭하여 변경)</span>
                              </button>
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
            </div>
            <CardFooter className="bg-muted/50 border-t flex-shrink-0">
              <Button type="submit" className="w-full">
                프로모션 저장
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  )
}

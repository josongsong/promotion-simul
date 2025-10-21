import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Percent, Gift, Truck, Package, TrendingUp } from "lucide-react"

interface PromotionTypeDrawerProps {
  isOpen: boolean
  onClose: () => void
  onTypeSelect: (type: string) => void
}

export function PromotionTypeDrawer({ isOpen, onClose, onTypeSelect }: PromotionTypeDrawerProps) {
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

  const handleTypeSelect = (type: string) => {
    onTypeSelect(type)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Card className="h-[60vh] flex flex-col rounded-t-xl overflow-hidden">
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between border-b">
            <div>
              <CardTitle>프로모션 유형 선택</CardTitle>
              <CardDescription>
                적용할 프로모션의 기본 유형을 선택하세요.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-6 min-h-0">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

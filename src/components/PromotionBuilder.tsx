import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { PromotionDrawer } from "./PromotionDrawer"
import { usePromotionStore } from "@/stores/promotionStore"

export function PromotionBuilder() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { promotions, addPromotion, removePromotion } = usePromotionStore()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>프로모션 규칙</CardTitle>
          <CardDescription>생성된 프로모션 목록입니다.</CardDescription>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          프로모션 추가
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {promotions.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">
              생성된 프로모션이 없습니다.
            </p>
          ) : (
            promotions.map(p => (
              <div key={p.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-accent/50">
                <span>{p.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removePromotion(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <PromotionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddPromotion={addPromotion}
      />
    </Card>
  )
}

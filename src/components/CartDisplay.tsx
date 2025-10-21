import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart } from "lucide-react"
import { usePromotionStore } from "@/stores/promotionStore"

export function CartDisplay() {
  const { calculatedCart } = usePromotionStore()
  const { items, subtotal, appliedPromotions, finalTotal } = calculatedCart

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          장바구니
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            장바구니가 비어있습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity}개 x {item.product.price.toLocaleString()}원
                  </p>
                </div>
                <p className="font-semibold">
                  {(item.product.price * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="flex-col items-stretch space-y-4 bg-muted/50 rounded-b-lg">
          <div className="pt-4">
            <div className="flex justify-between text-md">
              <span>주문 금액</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
          </div>
          {appliedPromotions.map(promo => (
            <div key={promo.promotionId} className="flex justify-between text-md items-start">
              <div className="flex flex-col">
                <span className={promo.discountAmount > 0 ? "text-destructive" : "text-muted-foreground"}>
                  {promo.promotionName}
                </span>
                {promo.metadata?.description && (
                  <span className="text-xs text-muted-foreground">
                    {promo.metadata.description}
                  </span>
                )}
              </div>
              {promo.discountAmount > 0 ? (
                <span className="text-destructive">
                  - {promo.discountAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}원
                </span>
              ) : (promo.metadata?.description && promo.metadata.description.includes('배송')) ? (
                <span className="text-blue-600 dark:text-blue-400">무료</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">적용</span>
              )}
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-xl font-bold">
            <span>최종 결제 금액</span>
            <span>{finalTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}원</span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

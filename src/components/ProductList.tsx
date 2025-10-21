import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePromotionStore } from "@/stores/promotionStore"

export function ProductList() {
  const { products, addToCart } = usePromotionStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>상품 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {products.map(product => (
            <div key={product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.price.toLocaleString()}원</p>
              </div>
              <Button size="sm" onClick={() => addToCart(product)}>
                담기
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

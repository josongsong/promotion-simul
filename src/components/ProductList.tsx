import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePromotionStore } from "@/stores/promotionStore"
import { useState } from "react"

const categoryLabels = {
  'all': '전체',
  'skincare': '스킨케어',
  'makeup': '메이크업',
  'cleansing': '클렌징',
  'bodycare': '바디케어'
}

export function ProductList() {
  const { products, addToCart } = usePromotionStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>상품 목록</CardTitle>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
          {filteredProducts.map(product => (
            <div key={product.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image'
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.price.toLocaleString()}원</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {categoryLabels[product.category as keyof typeof categoryLabels]}
                  </span>
                  {product.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Button size="sm" onClick={() => addToCart(product)}>
                담기
              </Button>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              선택한 카테고리에 상품이 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import { UserProfile } from "@/components/UserProfile"
import { ProductList } from "@/components/ProductList"
import { CartDisplay } from "@/components/CartDisplay"
import { PromotionBuilder } from "@/components/PromotionBuilder"

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            프로모션 엔진 시뮬레이터
          </h1>
          <p className="text-muted-foreground">
            실시간으로 프로모션 규칙을 만들고 결과를 확인하세요.
          </p>
        </header>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserProfile />
            <ProductList />
          </div>
          <div>
            <CartDisplay />
          </div>
          <div>
            <PromotionBuilder />
          </div>
        </div>
      </div>
    </div>
  )
}

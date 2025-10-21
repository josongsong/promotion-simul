import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { usePromotionStore } from "@/stores/promotionStore"

export function UserProfile() {
  const { user, setUser } = usePromotionStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원 정보 시뮬레이션</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="membership">회원 등급</Label>
          <Select 
            value={user.membershipTier} 
            onValueChange={(value: 'bronze' | 'silver' | 'gold' | 'vip') => 
              setUser({ ...user, membershipTier: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="회원 등급을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bronze">브론즈</SelectItem>
              <SelectItem value="silver">실버</SelectItem>
              <SelectItem value="gold">골드</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="new-user">신규 회원 여부</Label>
          <Switch 
            id="new-user" 
            checked={user.isNewUser} 
            onCheckedChange={(checked) => setUser({ ...user, isNewUser: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

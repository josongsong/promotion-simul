import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { usePromotionStore } from "@/stores/promotionStore"

// 미국 주 목록
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
]

export function UserProfile() {
  const { user, setUser } = usePromotionStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원 정보</CardTitle>
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
        
        <div className="space-y-2">
          <Label htmlFor="region">지역 (주)</Label>
          <Select 
            value={user.region} 
            onValueChange={(value) => 
              setUser({ ...user, region: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="주를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">나이</Label>
          <Input
            id="age"
            type="number"
            value={user.age}
            onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) || 0 })}
            placeholder="나이를 입력하세요"
            min="0"
            max="120"
          />
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

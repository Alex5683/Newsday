import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const screens = [
  { name: "Undervalued", change: "+8.2%", period: "1 Month" },
  { name: "Top Big Today", change: "+12.4%", period: "1 Day" },
  { name: "Unusual Volume", change: "+5.7%", period: "1 Week" },
  { name: "Momentum Movers", change: "+15.3%", period: "1 Month" },
  { name: "Technical Titans", change: "+9.8%", period: "1 Month" },
]

export function PopularScreens() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Popular Screens</h2>
        <Button variant="link" className="text-blue-600">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screens.map((screen, i) => (
          <div key={i} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium mb-2">{screen.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-bold">{screen.change}</span>
              <span className="text-sm text-gray-500">{screen.period}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

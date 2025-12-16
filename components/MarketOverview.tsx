"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { coinGeckoAPI, formatCurrency, formatPercentage, type CoinData } from "@/lib/api/coingecko"
import { forexAPI, type ForexPair } from "@/lib/api/forex"

const marketTabs = ["Indices", "Stocks", "Commodities", "Currencies", "ETFs", "Bonds", "Funds", "Cryptocurrency"]

interface MarketItem {
  name: string
  price: string
  change: string
  percent: string
  trend: "up" | "down"
  symbol?: string
}

interface MarketDataState {
  [key: string]: MarketItem[]
}

export function MarketOverview() {
  const [activeTab, setActiveTab] = useState("Indices")
  const [marketData, setMarketData] = useState<MarketDataState>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCryptoData = async (): Promise<MarketItem[]> => {
    try {
      const coins = await coinGeckoAPI.getTopCoins(6)
      return coins.map((coin: CoinData) => ({
        name: coin.name,
        price: formatCurrency(coin.current_price),
        change: coin.price_change_24h >= 0 ? `+${coin.price_change_24h.toFixed(2)}` : coin.price_change_24h.toFixed(2),
        percent: formatPercentage(coin.price_change_percentage_24h),
        trend: coin.price_change_percentage_24h >= 0 ? "up" : "down",
        symbol: coin.symbol.toUpperCase(),
      }))
    } catch (error) {
      console.error("Error fetching crypto data:", error)
      return []
    }
  }

  const fetchForexData = async (): Promise<MarketItem[]> => {
    try {
      const pairs = await forexAPI.getMajorPairs()
      return pairs.map((pair: ForexPair) => ({
        name: pair.symbol,
        price: pair.price.toFixed(4),
        change: pair.change >= 0 ? `+${pair.change.toFixed(4)}` : pair.change.toFixed(4),
        percent: formatPercentage(pair.changePercent),
        trend: pair.changePercent >= 0 ? "up" : "down",
      }))
    } catch (error) {
      console.error("Error fetching forex data:", error)
      return []
    }
  }

  const getStaticData = (category: string): MarketItem[] => {
    const staticData = {
      Indices: [
        { name: "Dow Jones", price: "43,049.7", change: "+1,457.9", percent: "+3.51%", trend: "up" as const },
        { name: "S&P 500", price: "5,842.47", change: "+159.1", percent: "+2.80%", trend: "up" as const },
        { name: "Nasdaq", price: "18,983.46", change: "+631.3", percent: "+3.44%", trend: "up" as const },
        { name: "Russell 2000", price: "2,392.92", change: "+89.2", percent: "+3.87%", trend: "up" as const },
        { name: "S&P 500 VIX", price: "14.73", change: "-0.36", percent: "-2.39%", trend: "down" as const },
        { name: "NIKKEI 225", price: "39,667.07", change: "+631.3", percent: "+1.62%", trend: "up" as const },
      ],
      Stocks: [
        { name: "Apple Inc", price: "227.52", change: "+2.15", percent: "+0.95%", trend: "up" as const },
        { name: "Microsoft", price: "415.26", change: "-1.84", percent: "-0.44%", trend: "down" as const },
        { name: "NVIDIA", price: "138.07", change: "+5.21", percent: "+3.92%", trend: "up" as const },
        { name: "Amazon", price: "186.29", change: "+0.87", percent: "+0.47%", trend: "up" as const },
        { name: "Tesla", price: "248.98", change: "-3.45", percent: "-1.37%", trend: "down" as const },
        { name: "Google", price: "175.43", change: "+1.23", percent: "+0.71%", trend: "up" as const },
      ],
      Commodities: [
        { name: "Gold", price: "2,665.80", change: "+12.40", percent: "+0.47%", trend: "up" as const },
        { name: "Silver", price: "31.245", change: "-0.125", percent: "-0.40%", trend: "down" as const },
        { name: "Crude Oil WTI", price: "68.72", change: "+0.89", percent: "+1.31%", trend: "up" as const },
        { name: "Brent Oil", price: "72.81", change: "+0.95", percent: "+1.32%", trend: "up" as const },
        { name: "Natural Gas", price: "3.142", change: "-0.058", percent: "-1.81%", trend: "down" as const },
        { name: "Copper", price: "4.1845", change: "+0.0325", percent: "+0.78%", trend: "up" as const },
      ],
      ETFs: [
        { name: "SPDR S&P 500", price: "584.25", change: "+15.92", percent: "+2.80%", trend: "up" as const },
        { name: "Invesco QQQ", price: "489.83", change: "+16.31", percent: "+3.44%", trend: "up" as const },
        { name: "iShares Russell 2000", price: "239.29", change: "+8.92", percent: "+3.87%", trend: "up" as const },
        { name: "SPDR Gold Shares", price: "266.58", change: "+1.24", percent: "+0.47%", trend: "up" as const },
        { name: "Energy Select SPDR", price: "89.45", change: "+1.23", percent: "+1.39%", trend: "up" as const },
        { name: "Financial Select SPDR", price: "42.18", change: "+1.89", percent: "+4.69%", trend: "up" as const },
      ],
      Bonds: [
        { name: "US 10Y Treasury", price: "4.285", change: "+0.045", percent: "+1.06%", trend: "up" as const },
        { name: "US 30Y Treasury", price: "4.512", change: "+0.032", percent: "+0.71%", trend: "up" as const },
        { name: "US 2Y Treasury", price: "4.156", change: "+0.089", percent: "+2.19%", trend: "up" as const },
        { name: "German 10Y Bund", price: "2.345", change: "-0.012", percent: "-0.51%", trend: "down" as const },
        { name: "UK 10Y Gilt", price: "4.287", change: "+0.023", percent: "+0.54%", trend: "up" as const },
        { name: "Japan 10Y Bond", price: "0.985", change: "+0.015", percent: "+1.55%", trend: "up" as const },
      ],
      Funds: [
        { name: "Vanguard Total Stock", price: "115.42", change: "+2.89", percent: "+2.57%", trend: "up" as const },
        { name: "Fidelity 500 Index", price: "168.73", change: "+4.21", percent: "+2.56%", trend: "up" as const },
        { name: "Vanguard Total Bond", price: "78.95", change: "-0.23", percent: "-0.29%", trend: "down" as const },
        { name: "iShares Core S&P 500", price: "584.25", change: "+15.92", percent: "+2.80%", trend: "up" as const },
        { name: "Vanguard FTSE Developed", price: "52.18", change: "+0.89", percent: "+1.73%", trend: "up" as const },
        { name: "Schwab US Broad Market", price: "58.42", change: "+1.45", percent: "+2.55%", trend: "up" as const },
      ],
    }
    return staticData[category as keyof typeof staticData] || []
  }

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true)
      setError(null)

      try {
        const data: MarketDataState = {}

        // Fetch live cryptocurrency data
        data.Cryptocurrency = await fetchCryptoData()

        // Fetch live forex data
        data.Currencies = await fetchForexData()

        // Use static data for other categories
        marketTabs.forEach((tab) => {
          if (!data[tab]) {
            data[tab] = getStaticData(tab)
          }
        })

        setMarketData(data)
      } catch (err) {
        setError("Failed to fetch market data")
        console.error("Error fetching market data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()

    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading market data...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64 text-red-600">
          <span>{error}</span>
        </div>
      </Card>
    )
  }

  const currentData = marketData[activeTab] || []

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Markets</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
          <Button variant="link" className="text-blue-600">
            Show more rows
          </Button>
        </div>
      </div>

      {/* Market tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {marketTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            className={activeTab === tab ? "bg-blue-600 text-white" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {(tab === "Cryptocurrency" || tab === "Currencies") && (
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-1"></div>
            )}
          </Button>
        ))}
      </div>

      {/* Market data table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-600">
              <th className="pb-2">Name</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Change</th>
              <th className="pb-2 text-right">Change %</th>
              <th className="pb-2 text-right">Time</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <span className="font-medium">{item.name}</span>
                    {item.symbol && <span className="text-xs text-gray-500 uppercase">({item.symbol})</span>}
                  </div>
                </td>
                <td className="py-3 text-right font-medium">{item.price}</td>
                <td className={`py-3 text-right ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {item.change}
                </td>
                <td className={`py-3 text-right ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  <div className="flex items-center justify-end space-x-1">
                    {item.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{item.percent}</span>
                  </div>
                </td>
                <td className="py-3 text-right text-sm text-gray-500">
                  {activeTab === "Cryptocurrency" || activeTab === "Currencies" ? "Live" : "17:59"}
                </td>
                <td className="py-3">
                  <Button variant="ghost" size="sm">
                    Chart
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

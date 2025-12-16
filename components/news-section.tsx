"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { newsAPI, type NewsArticle } from "@/lib/api/news"

export function NewsSection() {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const articles = await newsAPI.getFinancialNews(undefined, 4)
        setNewsItems(articles)
      } catch (err) {
        setError("Failed to fetch news")
        console.error("Error fetching news:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()

    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Latest News</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading news...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Latest News</h2>
        </div>
        <div className="text-red-600 text-center py-8">{error}</div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold">Latest News</h2>
          <div className="flex items-center space-x-1 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
        <Link href="/blog" className="text-blue-600 hover:underline text-sm">
          View all news
        </Link>
      </div>
      <div className="space-y-4">
        {newsItems.map((item, i) => (
          <div key={item.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
            <div className="w-16 h-12 bg-gray-200 rounded shrink-0 overflow-hidden">
              {item.urlToImage && (
                <img
                  src={item.urlToImage || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
            </div>
            <div className="flex-1">
              <Link href={`/blog/${item.category}/${item.id}`}>
                <h3 className="font-medium text-sm leading-tight mb-1 hover:text-blue-600 transition-colors cursor-pointer">
                  {item.title}
                </h3>
              </Link>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Link href={`/blog/${item.category}`} className="hover:text-blue-600 capitalize">
                  {item.category}
                </Link>
                <span>•</span>
                <span>{new Date(item.publishedAt).toLocaleString()}</span>
                <span>•</span>
                <span>{item.source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export interface NewsArticle {
  id: string
  title: string
  description: string
  content: string
  author: string
  publishedAt: string
  urlToImage: string
  source: string
  category: string
  tags: string[]
}

class NewsAPI {
  // Get financial news (mock implementation - replace with real news API)
  async getFinancialNews(category?: string, limit = 10): Promise<NewsArticle[]> {
    // Mock news data - replace with real API integration
    const mockNews: NewsArticle[] = [
      {
        id: "1",
        title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
        description:
          "Bitcoin surged to unprecedented levels as major institutions continue to embrace cryptocurrency investments.",
        content:
          "Bitcoin has reached a new all-time high, driven by increased institutional adoption and growing acceptance of cryptocurrency as a legitimate asset class...",
        author: "Sarah Johnson",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        urlToImage: "/bitcoin-institutional-chart.png",
        source: "Crypto Daily",
        category: "cryptocurrency",
        tags: ["bitcoin", "institutional", "adoption"],
      },
      {
        id: "2",
        title: "Federal Reserve Signals Potential Interest Rate Changes",
        description: "The Fed hints at upcoming monetary policy adjustments in response to economic indicators.",
        content:
          "Federal Reserve officials have indicated potential changes to interest rates following recent economic data...",
        author: "Michael Chen",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        urlToImage: "/sp500-chart.png",
        source: "Financial Times",
        category: "markets",
        tags: ["fed", "interest-rates", "monetary-policy"],
      },
      {
        id: "3",
        title: "Gold Prices Surge on Global Economic Uncertainty",
        description: "Precious metals see increased demand as investors seek safe-haven assets.",
        content:
          "Gold prices have surged significantly as global economic uncertainty drives investors toward safe-haven assets...",
        author: "Emma Rodriguez",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        urlToImage: "/gold-price-chart.png",
        source: "Commodities Weekly",
        category: "commodities",
        tags: ["gold", "safe-haven", "uncertainty"],
      },
    ]

    if (category) {
      return mockNews.filter((article) => article.category === category).slice(0, limit)
    }

    return mockNews.slice(0, limit)
  }

  // Get trending news
  async getTrendingNews(limit = 5): Promise<NewsArticle[]> {
    const news = await this.getFinancialNews()
    return news.slice(0, limit)
  }
}

export const newsAPI = new NewsAPI()

import { useState, KeyboardEvent } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type TimeRange = '5y' | '1y' | '6m' | '3m' | '1m' | '1w' | '1d'

function StockPrice() {
  const [ticker, setTicker] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('1y')
  const [stockData, setStockData] = useState<{ dates: string[], prices: number[] }>({ dates: [], prices: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getApiFunction = (range: TimeRange) => {
    switch (range) {
      case '1d':
        return 'TIME_SERIES_INTRADAY&interval=5min'
      case '1w':
      case '1m':
      case '3m':
        return 'TIME_SERIES_DAILY'
      default:
        return 'TIME_SERIES_MONTHLY'
    }
  }

  const getDataKey = (range: TimeRange) => {
    switch (range) {
      case '1d':
        return 'Time Series (5min)'
      case '1w':
      case '1m':
      case '3m':
        return 'Time Series (Daily)'
      default:
        return 'Monthly Time Series'
    }
  }

  const getDataLimit = (range: TimeRange) => {
    switch (range) {
      case '1d':
        return 78 // ~6.5 trading hours
      case '1w':
        return 5 // 5 trading days
      case '1m':
        return 21 // ~21 trading days
      case '3m':
        return 63 // ~63 trading days
      case '6m':
        return 6 // 6 months
      case '1y':
        return 12 // 12 months
      case '5y':
        return 60 // 60 months
      default:
        return 12
    }
  }

  const formatDate = (date: string, range: TimeRange) => {
    if (range === '1d') {
      return date.substring(11, 16) // Show only time for intraday
    }
    const [year, month, day] = date.substring(0, 10).split('-')
    if (range === '5y' || range === '1y') {
      return `${month}/${year}`
    }
    return `${month}/${day}/${year.substring(2)}`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const fetchStockData = async () => {
    if (!ticker) return
    
    setLoading(true)
    setError('')
    
    try {
      const apiFunction = getApiFunction(timeRange)
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${ticker}&apikey=AA26ZP2Y539USYXX`
      )
      
      const dataKey = getDataKey(timeRange)
      const timeSeries = response.data[dataKey]
      
      if (!timeSeries) {
        throw new Error('No data available for this ticker')
      }

      const dates: string[] = []
      const prices: number[] = []

      Object.entries(timeSeries)
        .slice(0, getDataLimit(timeRange))
        .reverse()
        .forEach(([date, values]: [string, any]) => {
          dates.push(formatDate(date, timeRange))
          prices.push(parseFloat(values['4. close']))
        })

      setStockData({ dates, prices })
    } catch (err) {
      setError('Error fetching stock data. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ticker && !loading) {
      fetchStockData()
    }
  }

  const timeRangeButtons: { value: TimeRange; label: string }[] = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: '5y', label: '5Y' }
  ]

  const chartData = {
    labels: stockData.dates,
    datasets: [
      {
        label: `${ticker.toUpperCase()} Stock Price`,
        data: stockData.prices,
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: ticker ? `${ticker.toUpperCase()} Stock Price History` : 'Enter a stock symbol to view price history',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return formatPrice(context.parsed.y)
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: (value: number) => formatPrice(value),
          font: {
            size: 11
          }
        }
      }
    }
  }

  return (
    <div className="container">
      <div className="search-container">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Enter stock symbol and press Enter (e.g., AAPL)"
          className="ticker-input"
          disabled={loading}
        />
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <div className="chart-container">
        <div className="time-range-buttons">
          {timeRangeButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setTimeRange(value)
                if (ticker) fetchStockData()
              }}
              className={`time-range-button ${timeRange === value ? 'active' : ''}`}
              disabled={loading}
            >
              {label}
            </button>
          ))}
        </div>
        {stockData.dates.length > 0 ? (
          <Line data={chartData} options={chartOptions} height={400} />
        ) : (
          <div className="empty-chart">
            <p>Enter a stock symbol above to view price history</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockPrice
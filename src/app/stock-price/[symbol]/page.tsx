'use client'

import { useState, useEffect } from 'react'
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
import { useParams } from 'next/navigation'
import Header from '@/components/Header'

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

export default function StockPrice() {
  const params = useParams()
  const ticker = params.symbol as string
  const [timeRange, setTimeRange] = useState<TimeRange>('1y')
  const [stockData, setStockData] = useState<{ dates: string[], prices: number[] }>({ dates: [], prices: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const timeRangeButtons = [
    { value: '5y' as TimeRange, label: '5Y' },
    { value: '1y' as TimeRange, label: '1Y' },
    { value: '6m' as TimeRange, label: '6M' },
    { value: '3m' as TimeRange, label: '3M' },
    { value: '1m' as TimeRange, label: '1M' },
    { value: '1w' as TimeRange, label: '1W' },
    { value: '1d' as TimeRange, label: '1D' }
  ]

  // Rest of the StockPrice component code remains the same, just remove the conditional rendering for ticker
  // as it's now part of the URL parameters

  return (
    <>
      <Header />
      <div className="container">
        {error && (
          <p className="error\" style={{ color: 'red', padding: '10px', textAlign: 'center' }}>
            {error}
          </p>
        )}
        
        <div className="chart-container">
          <div className="time-range-buttons">
            {timeRangeButtons.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`time-range-button ${timeRange === value ? 'active' : ''}`}
                disabled={loading}
              >
                {label}
              </button>
            ))}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : (
            <Line data={chartData} options={chartOptions} height={400} />
          )}
        </div>
      </div>
    </>
  )
}
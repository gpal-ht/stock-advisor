'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaHome } from 'react-icons/fa'

export default function Home() {
  const [ticker, setTicker] = useState('')
  const router = useRouter()

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ticker) {
      router.push(`/stock-price/${ticker}`)
    }
  }

  return (
    <>
      <div className="sticky-header">
        <div className="search-container">
          <button onClick={() => router.push('/')} className="home-button">
            <FaHome size={20} />
          </button>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter stock symbol and press Enter (e.g., AAPL)"
            className="ticker-input"
          />
        </div>
      </div>
      <div className="container">
        <h1>Dashboard</h1>
        <p>Welcome to your stock dashboard!</p>
      </div>
    </>
  )
}
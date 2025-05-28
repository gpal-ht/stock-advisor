import { Outlet, useNavigate } from 'react-router-dom'
import { useState, KeyboardEvent } from 'react'
import { FaHome } from 'react-icons/fa'

function Layout() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ticker && !loading) {
      navigate(`/stock-price?symbol=${ticker}`)
    }
  }

  const handleHomeClick = () => {
    setTicker('')
    navigate('/dashboard')
  }

  return (
    <>
      <div className="sticky-header">
        <div className="search-container">
          <button onClick={handleHomeClick} className="home-button">
            <FaHome size={20} />
          </button>
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
      </div>
      <Outlet />
    </>
  )
}

export default Layout
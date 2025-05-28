import { Routes, Route, Navigate } from 'react-router-dom'
import StockPrice from './components/StockPrice'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/stock-price" element={<StockPrice />} />
      <Route path="/" element={<Navigate to="/stock-price\" replace />} />
    </Routes>
  )
}

export default App
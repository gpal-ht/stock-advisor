import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import StockPrice from './components/StockPrice'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/stock-price" element={<StockPrice />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
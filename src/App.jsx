import { useState } from 'react'
import VentaPage from './pages/VentaPage'
import StockPage from './pages/StockPage'
import HistorialPage from './pages/HistorialPage'
import { useToast } from './hooks/useToast'

export default function App() {
  const [tab, setTab] = useState('venta')
  const { toast, showToast } = useToast()

  return (
    <div className="app-layout">
      {/* Toast */}
      {toast && (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Pages */}
      <div className="page-content">
        {tab === 'venta' && <VentaPage showToast={showToast} />}
        {tab === 'stock' && <StockPage showToast={showToast} />}
        {tab === 'historial' && <HistorialPage showToast={showToast} />}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className={`nav-item ${tab === 'venta' ? 'active' : ''}`} onClick={() => setTab('venta')}>
          <CartIcon />
          Venta
        </button>
        <button className={`nav-item ${tab === 'stock' ? 'active' : ''}`} onClick={() => setTab('stock')}>
          <BoxIcon />
          Stock
        </button>
        <button className={`nav-item ${tab === 'historial' ? 'active' : ''}`} onClick={() => setTab('historial')}>
          <ChartIcon />
          Historial
        </button>
      </nav>
    </div>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline strokeLinecap="round" strokeLinejoin="round" points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line strokeLinecap="round" strokeLinejoin="round" x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <line strokeLinecap="round" strokeLinejoin="round" x1="18" y1="20" x2="18" y2="10"/>
      <line strokeLinecap="round" strokeLinejoin="round" x1="12" y1="20" x2="12" y2="4"/>
      <line strokeLinecap="round" strokeLinejoin="round" x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}

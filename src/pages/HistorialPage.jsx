import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

function formatDate(str) {
  const d = new Date(str)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function HistorialPage({ showToast }) {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => { loadVentas() }, [])

  async function loadVentas() {
    setLoading(true)
    const { data } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setVentas(data || [])
    setLoading(false)
  }

  async function toggleExpand(venta) {
    if (expanded === venta.id) { setExpanded(null); return }
    setExpanded(venta.id)
    if (!items[venta.id]) {
      const { data } = await supabase.from('venta_items').select('*').eq('venta_id', venta.id)
      setItems(prev => ({ ...prev, [venta.id]: data || [] }))
    }
  }

  const hoy = new Date().toDateString()
  const ventasHoy = ventas.filter(v => new Date(v.created_at).toDateString() === hoy)
  const totalHoy = ventasHoy.reduce((s, v) => s + Number(v.total), 0)
  const totalEfectivo = ventas.filter(v => v.metodo_pago === 'efectivo').reduce((s, v) => s + Number(v.total), 0)
  const totalMP = ventas.filter(v => v.metodo_pago === 'mp').reduce((s, v) => s + Number(v.total), 0)

  const ventasFiltradas = useMemo(() => {
    if (filtro === 'todas') return ventas
    return ventas.filter(v => v.metodo_pago === filtro)
  }, [ventas, filtro])

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span className="loading-text">Cargando historial...</span>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div className="page-title">📊 Historial</div>
        <div className="page-subtitle">Últimas 100 ventas</div>
      </div>

      <div className="page-scroll">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Ventas hoy</div>
            <div className="stat-value">{ventasHoy.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total hoy</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{formatPrice(totalHoy)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">💵 Efectivo</div>
            <div className="stat-value green" style={{ fontSize: 18 }}>{formatPrice(totalEfectivo)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">📱 MercadoPago</div>
            <div className="stat-value blue" style={{ fontSize: 18 }}>{formatPrice(totalMP)}</div>
          </div>
        </div>

        <div className="filtros-bar">
          <button className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`} onClick={() => setFiltro('todas')}>
            Todas ({ventas.length})
          </button>
          <button className={`filtro-btn ${filtro === 'efectivo' ? 'active' : ''}`} onClick={() => setFiltro('efectivo')}>
            💵 Efectivo ({ventas.filter(v => v.metodo_pago === 'efectivo').length})
          </button>
          <button className={`filtro-btn ${filtro === 'mp' ? 'active-mp' : ''}`} onClick={() => setFiltro('mp')}>
            📱 MercadoPago ({ventas.filter(v => v.metodo_pago === 'mp').length})
          </button>
        </div>

        <div style={{ padding: '10px 12px 8px' }}>
          {ventasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-text">Sin ventas</div>
              <div className="empty-sub">No hay ventas con este filtro</div>
            </div>
          ) : ventasFiltradas.map(v => (
            <div key={v.id} className="venta-item" onClick={() => toggleExpand(v)}>
              <div className="venta-row">
                <div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 500, color: 'var(--accent)' }}>{formatPrice(v.total)}</div>
                  <div className="venta-date">{formatDate(v.created_at)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`pago-badge ${v.metodo_pago === 'mp' ? 'mp' : 'efectivo'}`}>
                    {v.metodo_pago === 'mp' ? '📱 MP' : '💵 Efectivo'}
                  </span>
                  <span style={{ color: 'var(--text3)', fontSize: 16 }}>
                    {expanded === v.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expanded === v.id && items[v.id] && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  {items[v.id].map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, flex: 1, color: 'var(--text2)', fontFamily: 'Lora, serif' }}>{item.nombre_producto}</span>
                      <span className="sans" style={{ fontSize: 13, color: 'var(--text3)', marginRight: 10 }}>x{item.cantidad}</span>
                      <span className="mono" style={{ fontSize: 13 }}>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

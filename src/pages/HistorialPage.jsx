import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

function formatDate(str) {
  const d = new Date(str)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function HistorialPage({ showToast }) {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({}) // { venta_id: [] }

  useEffect(() => { loadVentas() }, [])

  async function loadVentas() {
    setLoading(true)
    const { data } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setVentas(data || [])
    setLoading(false)
  }

  async function toggleExpand(venta) {
    if (expanded === venta.id) { setExpanded(null); return }
    setExpanded(venta.id)
    if (!items[venta.id]) {
      const { data } = await supabase
        .from('venta_items')
        .select('*')
        .eq('venta_id', venta.id)
      setItems(prev => ({ ...prev, [venta.id]: data || [] }))
    }
  }

  // Stats
  const hoy = new Date().toDateString()
  const ventasHoy = ventas.filter(v => new Date(v.created_at).toDateString() === hoy)
  const totalHoy = ventasHoy.reduce((s, v) => s + Number(v.total), 0)
  const totalHistorico = ventas.reduce((s, v) => s + Number(v.total), 0)

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span className="loading-text">Cargando historial...</span>
    </div>
  )

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title"><span className="accent-dot" />Historial</div>
        <div className="page-subtitle">Últimas 50 ventas</div>
      </div>

      <div className="page-scroll">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Ventas hoy</div>
            <div className="stat-value">{ventasHoy.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total hoy</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{formatPrice(totalHoy)}</div>
          </div>
          <div className="stat-card" style={{ gridColumn: 'span 2' }}>
            <div className="stat-label">Total acumulado (50 últimas)</div>
            <div className="stat-value green" style={{ fontSize: 20 }}>{formatPrice(totalHistorico)}</div>
          </div>
        </div>

        {/* Lista */}
        <div style={{ padding: '0 16px 8px' }}>
          {ventas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-text">Sin ventas aún</div>
              <div className="empty-sub">Las ventas registradas aparecerán aquí</div>
            </div>
          ) : ventas.map(v => (
            <div key={v.id} className="venta-item" onClick={() => toggleExpand(v)} style={{ cursor: 'pointer' }}>
              <div className="venta-row">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{formatPrice(v.total)}</div>
                  <div className="venta-date">{formatDate(v.created_at)}</div>
                </div>
                <div style={{ color: 'var(--text3)', fontSize: 20 }}>
                  {expanded === v.id ? '▲' : '▼'}
                </div>
              </div>

              {expanded === v.id && items[v.id] && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {items[v.id].map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, flex: 1, color: 'var(--text2)' }}>{item.nombre_producto}</span>
                      <span style={{ fontSize: 13, color: 'var(--text3)', marginRight: 10 }}>x{item.cantidad}</span>
                      <span className="mono" style={{ fontSize: 13 }}>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

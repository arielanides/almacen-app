import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

export default function VentaPage({ showToast }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState({}) // { id: qty }
  const [confirming, setConfirming] = useState(false)
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    loadProductos()
  }, [])

  async function loadProductos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre')
    if (!error) setProductos(data || [])
    setLoading(false)
  }

  const filtered = useMemo(() =>
    productos.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase())
    ), [productos, search])

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = productos.find(x => x.id === id)
      return sum + (p ? p.precio_venta * qty : 0)
    }, 0)
  }, [cart, productos])

  function toggleProduct(p) {
    if (p.stock <= 0) return
    setCart(prev => {
      if (prev[p.id]) {
        const next = { ...prev }
        delete next[p.id]
        return next
      }
      return { ...prev, [p.id]: 1 }
    })
  }

  function changeQty(p, delta) {
    setCart(prev => {
      const current = prev[p.id] || 0
      const next = current + delta
      if (next <= 0) {
        const obj = { ...prev }
        delete obj[p.id]
        return obj
      }
      if (next > p.stock) return prev
      return { ...prev, [p.id]: next }
    })
  }

  async function confirmarVenta() {
    setProcesando(true)
    try {
      const items = Object.entries(cart).map(([id, qty]) => {
        const p = productos.find(x => x.id === id)
        return { id, qty, p }
      })

      // Crear venta
      const { data: venta, error: ve } = await supabase
        .from('ventas')
        .insert({ total })
        .select()
        .single()

      if (ve) throw ve

      // Items
      const { error: ie } = await supabase
        .from('venta_items')
        .insert(items.map(({ id, qty, p }) => ({
          venta_id: venta.id,
          producto_id: id,
          nombre_producto: p.nombre,
          precio_unitario: p.precio_venta,
          cantidad: qty,
          subtotal: p.precio_venta * qty
        })))

      if (ie) throw ie

      // Actualizar stock
      for (const { id, qty, p } of items) {
        await supabase
          .from('productos')
          .update({ stock: p.stock - qty })
          .eq('id', id)
      }

      setCart({})
      setConfirming(false)
      await loadProductos()
      showToast('✓ Venta registrada!', 'success')
    } catch (e) {
      showToast('Error al registrar la venta', 'error')
    }
    setProcesando(false)
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span className="loading-text">Cargando productos...</span>
    </div>
  )

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <span className="accent-dot" />
          Nueva Venta
        </div>
        {cartCount > 0 && (
          <div className="page-subtitle">{cartCount} producto{cartCount > 1 ? 's' : ''} seleccionado{cartCount > 1 ? 's' : ''}</div>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <SearchIcon className="search-icon" />
          <input
            className="search-input"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Products */}
      <div className="page-scroll">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-text">Sin resultados</div>
            <div className="empty-sub">Probá con otro nombre</div>
          </div>
        ) : (
          <div className="product-list">
            {filtered.map(p => {
              const inCart = !!cart[p.id]
              const qty = cart[p.id] || 0
              const outOfStock = p.stock <= 0
              return (
                <div
                  key={p.id}
                  className={`product-card ${inCart ? 'selected' : ''} ${outOfStock ? 'out' : ''}`}
                  onClick={() => toggleProduct(p)}
                  style={outOfStock ? { opacity: 0.4 } : {}}
                >
                  <div className="product-info">
                    <div className="product-name">{p.nombre}</div>
                    <div className="product-meta">
                      <span className={`product-stock ${p.stock <= 3 && p.stock > 0 ? 'stock-low' : p.stock === 0 ? 'stock-out' : ''}`}>
                        {p.stock === 0 ? 'Sin stock' : `Stock: ${p.stock}`}
                      </span>
                    </div>
                  </div>
                  {inCart ? (
                    <div className="qty-selector" onClick={e => e.stopPropagation()}>
                      <button className="qty-btn" onClick={() => changeQty(p, -1)}>−</button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(p, +1)} disabled={qty >= p.stock}>+</button>
                    </div>
                  ) : null}
                  <div className="product-price">{formatPrice(p.precio_venta)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="cart-bar">
          <div>
            <div className="cart-total-label">Total</div>
            <div className="cart-total-amount">{formatPrice(total)}</div>
          </div>
          <button
            className="btn-secondary"
            onClick={() => setCart({})}
          >Limpiar</button>
          <button
            className="btn-primary"
            onClick={() => setConfirming(true)}
          >Confirmar</button>
        </div>
      )}

      {/* Confirm sheet */}
      {confirming && (
        <div className="sheet-overlay" onClick={() => setConfirming(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">Confirmar venta</div>
            </div>
            <div className="sheet-body">
              {Object.entries(cart).map(([id, qty]) => {
                const p = productos.find(x => x.id === id)
                if (!p) return null
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14, flex: 1 }}>{p.nombre}</span>
                    <span style={{ fontSize: 14, color: 'var(--text2)', marginRight: 12 }}>x{qty}</span>
                    <span className="mono" style={{ fontSize: 14, color: 'var(--accent)' }}>{formatPrice(p.precio_venta * qty)}</span>
                  </div>
                )
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 24px' }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>TOTAL</span>
                <span className="mono" style={{ fontSize: 24, color: 'var(--accent)' }}>{formatPrice(total)}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirming(false)}>Volver</button>
                <button
                  className="btn-primary"
                  style={{ flex: 2 }}
                  onClick={confirmarVenta}
                  disabled={procesando}
                >{procesando ? 'Registrando...' : 'Registrar Venta'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

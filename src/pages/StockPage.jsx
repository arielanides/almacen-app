import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

export default function StockPage({ showToast }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sheet, setSheet] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ nombre: '', precio_compra: '', precio_venta: '', stock: '' })
  const [ingresoForm, setIngresoForm] = useState({ cantidad: '', precio_compra: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { loadProductos() }, [])

  async function loadProductos() {
    setLoading(true)
    const { data } = await supabase.from('productos').select('*').eq('activo', true).order('nombre')
    setProductos(data || [])
    setLoading(false)
  }

  const filtered = useMemo(() =>
    productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase())),
    [productos, search])

  function openNuevo() {
    setForm({ nombre: '', precio_compra: '', precio_venta: '', stock: '' })
    setSheet('nuevo')
  }

  function openEditar(p) {
    setSelected(p)
    setForm({ nombre: p.nombre, precio_compra: p.precio_compra, precio_venta: p.precio_venta, stock: p.stock })
    setSheet('editar')
  }

  function openIngreso(p) {
    setSelected(p)
    setIngresoForm({ cantidad: '', precio_compra: p.precio_compra })
    setSheet('ingreso')
  }

  function closeSheet() { setSheet(null); setSelected(null) }

  async function saveProducto() {
    if (!form.nombre.trim()) { showToast('Ingresá un nombre', 'error'); return }
    setSaving(true)
    const data = {
      nombre: form.nombre.trim(),
      precio_compra: parseFloat(form.precio_compra) || 0,
      precio_venta: parseFloat(form.precio_venta) || 0,
      stock: parseInt(form.stock) || 0,
    }
    if (sheet === 'nuevo') {
      const { error } = await supabase.from('productos').insert(data)
      if (error) { showToast('Error al guardar', 'error'); setSaving(false); return }
      showToast('✓ Producto creado!', 'success')
    } else {
      const { error } = await supabase.from('productos').update(data).eq('id', selected.id)
      if (error) { showToast('Error al guardar', 'error'); setSaving(false); return }
      showToast('✓ Producto actualizado!', 'success')
    }
    setSaving(false)
    closeSheet()
    loadProductos()
  }

  async function saveIngreso() {
    const cant = parseInt(ingresoForm.cantidad)
    if (!cant || cant <= 0) { showToast('Ingresá una cantidad válida', 'error'); return }
    setSaving(true)
    const pc = parseFloat(ingresoForm.precio_compra) || selected.precio_compra
    await supabase.from('ingresos').insert({
      producto_id: selected.id,
      nombre_producto: selected.nombre,
      cantidad: cant,
      precio_compra: pc,
    })
    await supabase.from('productos').update({
      stock: selected.stock + cant,
      precio_compra: pc,
    }).eq('id', selected.id)
    showToast(`✓ +${cant} unidades ingresadas!`, 'success')
    setSaving(false)
    closeSheet()
    loadProductos()
  }

  async function eliminarProducto(p) {
    setSaving(true)
    await supabase.from('productos').update({ activo: false }).eq('id', p.id)
    showToast('Producto eliminado', 'success')
    setConfirmDelete(null)
    setSaving(false)
    loadProductos()
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span className="loading-text">Cargando stock...</span>
    </div>
  )

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">📦 Stock</div>
          <div className="page-subtitle">{productos.length} productos</div>
        </div>
        <button className="btn-primary" style={{ marginTop: 4 }} onClick={openNuevo}>+ Nuevo</button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <SearchIcon className="search-icon" />
          <input className="search-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="page-scroll">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-text">Sin productos</div>
            <div className="empty-sub">Tocá + Nuevo para agregar</div>
          </div>
        ) : (
          <div className="product-list">
            {filtered.map(p => (
              <div key={p.id} className="product-card" onClick={() => openEditar(p)}>
                <div className="product-info">
                  <div className="product-name">{p.nombre}</div>
                  <div className="product-meta">
                    <span className={`product-stock ${p.stock <= 3 && p.stock > 0 ? 'stock-low' : p.stock === 0 ? 'stock-out' : ''}`}>
                      {p.stock === 0 ? '⚠ Sin stock' : `${p.stock} unidades`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Botón ingreso */}
                  <button
                    style={{
                      background: 'var(--accent-bg)',
                      border: '1.5px solid var(--accent)',
                      borderRadius: 8,
                      padding: '7px 11px',
                      fontSize: 12,
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 800,
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={e => { e.stopPropagation(); openIngreso(p) }}
                  >+ Stock</button>

                  {/* Tachito */}
                  <button
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text3)',
                      flexShrink: 0
                    }}
                    onClick={e => { e.stopPropagation(); setConfirmDelete(p) }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="sheet-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-body" style={{ textAlign: 'center', paddingTop: 10 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Eliminar producto</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, fontFamily: 'Nunito, sans-serif' }}>
                ¿Seguro que querés eliminar <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button
                  className="btn-danger"
                  style={{ flex: 1, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 10, padding: '13px 20px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
                  onClick={() => eliminarProducto(confirmDelete)}
                  disabled={saving}
                >
                  {saving ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sheet nuevo/editar */}
      {(sheet === 'nuevo' || sheet === 'editar') && (
        <div className="sheet-overlay" onClick={closeSheet}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">{sheet === 'nuevo' ? 'Nuevo Producto' : 'Editar Producto'}</div>
            </div>
            <div className="sheet-body">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" placeholder="Ej: Coca Cola 600ml" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} style={{fontFamily:'Lora,serif'}} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio costo</label>
                  <input className="form-input" type="number" placeholder="0" value={form.precio_compra} onChange={e => setForm(f => ({...f, precio_compra: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio venta</label>
                  <input className="form-input" type="number" placeholder="0" value={form.precio_venta} onChange={e => setForm(f => ({...f, precio_venta: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input className="form-input" type="number" placeholder="0" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={closeSheet}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={saveProducto} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sheet ingreso */}
      {sheet === 'ingreso' && selected && (
        <div className="sheet-overlay" onClick={closeSheet}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">Ingreso de mercadería</div>
            </div>
            <div className="sheet-body">
              <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.nombre}</div>
                <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4, fontFamily: 'Nunito, sans-serif' }}>
                  Stock actual: <strong>{selected.stock}</strong> unidades
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cantidad a ingresar</label>
                  <input className="form-input" type="number" placeholder="0" value={ingresoForm.cantidad} onChange={e => setIngresoForm(f => ({...f, cantidad: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nuevo precio costo</label>
                  <input className="form-input" type="number" value={ingresoForm.precio_compra} onChange={e => setIngresoForm(f => ({...f, precio_compra: e.target.value}))} />
                </div>
              </div>
              {ingresoForm.cantidad && (
                <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16, fontFamily: 'Nunito, sans-serif' }}>
                  Stock resultante: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{selected.stock + (parseInt(ingresoForm.cantidad) || 0)}</span> unidades
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={closeSheet}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={saveIngreso} disabled={saving}>
                  {saving ? 'Guardando...' : 'Ingresar mercadería'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}

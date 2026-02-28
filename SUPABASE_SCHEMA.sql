-- =============================================
-- ALMACÉN APP - SUPABASE SCHEMA
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- Tabla de productos
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio_compra NUMERIC(10,2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas (cabecera)
CREATE TABLE ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items de venta (detalle)
CREATE TABLE venta_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  nombre_producto TEXT NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(10,2) NOT NULL
);

-- Tabla de ingresos de mercadería
CREATE TABLE ingresos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id),
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_compra NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar updated_at en productos
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security) - habilitar para producción
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (para uso con anon key en app personal)
-- NOTA: Para producción, reemplazar con políticas basadas en auth.uid()
CREATE POLICY "Allow all for anon" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON venta_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON ingresos FOR ALL USING (true) WITH CHECK (true);

-- Datos de ejemplo para empezar
INSERT INTO productos (nombre, precio_compra, precio_venta, stock) VALUES
  ('Coca Cola 600ml', 350, 600, 24),
  ('Agua mineral 500ml', 150, 300, 48),
  ('Pan lactal', 800, 1200, 10),
  ('Leche 1L', 900, 1400, 20),
  ('Yerba 1/2kg', 1500, 2200, 15),
  ('Azúcar 1kg', 700, 1100, 12),
  ('Aceite girasol 900ml', 1800, 2500, 8),
  ('Fideos spaghetti 500g', 600, 950, 20);

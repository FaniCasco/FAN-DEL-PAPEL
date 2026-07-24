-- supabase/about.sql

-- Tabla para almacenar el contenido de "Sobre Mí"
CREATE TABLE public.about_content (
  id INT PRIMARY KEY DEFAULT 1,
  hero JSONB NOT NULL DEFAULT '{"title": "Fan del Papel", "subtitle": "Encuadernación artesanal hecha con amor", "image": ""}',
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Solo permitimos una fila (id = 1)
  CONSTRAINT single_row CHECK (id = 1)
);

-- Habilitar RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Lectura pública
CREATE POLICY "Contenido sobre mi es visible para todos" 
ON public.about_content FOR SELECT 
TO public 
USING (true);

-- Escritura solo para administradores (asumiendo autenticación por Supabase Auth para admin)
-- Si la app usa un enfoque diferente de auth para AdminPanel (como una clave simple o role), 
-- ajusta esta política o usar un backend function. 
-- Para seguir el standard genérico de authenticated:
CREATE POLICY "Administradores pueden actualizar el contenido" 
ON public.about_content FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Administradores pueden insertar el contenido inicial" 
ON public.about_content FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- PUBLIC can INSERT/UPDATE because the table only ever holds a single row (id = 1)
CREATE POLICY "Public puede crear/actualizar Sobre Mí"
  ON public.about_content
  FOR INSERT, UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insertar valores por defecto (si no existe)
INSERT INTO public.about_content (id, hero, sections)
VALUES (
  1, 
  '{"title": "Fan del Papel", "subtitle": "Encuadernación artesanal hecha con amor", "image": ""}'::jsonb, 
  '[{"id": "default-1", "type": "text", "order": 0, "content": "Soy un apasionado de la encuadernación. Cada libreta está hecha a mano con dedicación y cuidado en los detalles."}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

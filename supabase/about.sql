-- supabase/about.sql
CREATE TABLE IF NOT EXISTS public.about_content (
  id INT PRIMARY KEY DEFAULT 1,
  hero JSONB NOT NULL DEFAULT '{"title": "Fan del Papel", "subtitle": "Encuadernación artesanal hecha con amor", "image": ""}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de Sobre Mí" ON public.about_content;
DROP POLICY IF EXISTS "Inserción pública de Sobre Mí" ON public.about_content;
DROP POLICY IF EXISTS "Actualización pública de Sobre Mí" ON public.about_content;

CREATE POLICY "Lectura pública de Sobre Mí"
  ON public.about_content FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Inserción pública de Sobre Mí"
  ON public.about_content FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Actualización pública de Sobre Mí"
  ON public.about_content FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);


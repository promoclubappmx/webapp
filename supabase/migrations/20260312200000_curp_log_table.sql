-- Migration: Create curp_validation_log table
-- Stores CURP validation queries and full API response data

CREATE TABLE IF NOT EXISTS public.curp_validation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Query data
  curp_consultada text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Core response fields (used in registration)
  estatus text,
  codigo_validacion text,
  curp_respuesta text,
  nombre text,
  apellido_paterno text,
  apellido_materno text,
  sexo text,
  fecha_nacimiento text,
  pais_nacimiento text,
  estado_nacimiento text,
  estatus_curp text,
  codigo_mensaje text,
  doc_probatorio integer,
  
  -- Full remaining data not used in registration (stored as JSONB)
  datos_doc_probatorio jsonb,
  datos_adicionales jsonb
);

-- Enable RLS
ALTER TABLE public.curp_validation_log ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can insert their own logs
CREATE POLICY "Users can insert their own curp logs"
  ON public.curp_validation_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: authenticated users can read their own logs
CREATE POLICY "Users can read their own curp logs"
  ON public.curp_validation_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_curp_validation_log_user_id ON public.curp_validation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_curp_validation_log_curp ON public.curp_validation_log(curp_consultada);
CREATE INDEX IF NOT EXISTS idx_curp_validation_log_created_at ON public.curp_validation_log(created_at DESC);

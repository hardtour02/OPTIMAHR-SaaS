import { createClient } from '@supabase/supabase-js';

// Para Vite, las variables de entorno expuestas al cliente deben tener el prefijo VITE_
// y se acceden a través de import.meta.env
// FIX: Changed import.meta.env to process.env to resolve TypeScript error.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// FIX: Changed import.meta.env to process.env to resolve TypeScript error.
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Esto ahora usará las variables de Vercel si están configuradas correctamente.
// Si no, recurre a valores de marcador de posición para evitar que la aplicación falle
// en el desarrollo local antes de intentar iniciar sesión.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

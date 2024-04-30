import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from '@supabase/ssr'
// export const supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!, 
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

export function supabaseAdmin() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

export const supabase = createClientComponentClient()





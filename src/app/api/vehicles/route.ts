import { fetchVehicles } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(() => fetchVehicles());
}

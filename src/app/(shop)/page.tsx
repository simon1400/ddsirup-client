// NOTE: app/page.tsx handles the "/" route and includes Header/Footer manually.
// This file satisfies Next.js route group structure for the (shop) layout group.
// Routes under (shop)/ other than "/" use (shop)/layout.tsx automatically.
import { redirect } from 'next/navigation';

export default function ShopGroupRoot() {
  // app/page.tsx takes precedence for "/" — this should never be reached
  redirect('/');
}

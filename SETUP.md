# ddsirup/client — Next.js E-shop Frontend

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** + **shadcn/ui**
- **Zustand** — cart state management
- **TanStack Query v5** — server state / data fetching
- **React Hook Form** + **Zod** — checkout form validation
- **Comgate** — Czech payment gateway
- **Strapi v5** — headless CMS backend

## Quick start

```bash
# 1. Copy env file
cp .env.local.example .env.local

# 2. Fill in .env.local values (Strapi URL, Comgate credentials)

# 3. Install dependencies (already done)
npm install

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment variables

See `.env.local.example` for all required variables.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi backend URL (default: http://localhost:1337) |
| `STRAPI_API_TOKEN` | Strapi API token from Admin → Settings → API Tokens |
| `NEXT_PUBLIC_BASE_URL` | Frontend URL for Comgate callbacks |
| `COMGATE_MERCHANT` | Comgate merchant ID |
| `COMGATE_SECRET` | Comgate secret key |
| `COMGATE_TEST` | `true` for test mode, `false` for production |
| `STRAPI_HOST` | Strapi hostname for Next.js Image (production) |

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout (providers, cart drawer)
│   ├── (shop)/                     # Shop route group (Header + Footer layout)
│   │   ├── products/               # Product listing
│   │   ├── products/[slug]/        # Product detail
│   │   ├── cart/                   # Cart page
│   │   ├── checkout/               # Checkout form
│   │   ├── checkout/success/       # Order success
│   │   └── categories/[slug]/      # Category page
│   └── api/
│       └── payment/
│           ├── create/route.ts     # Create Comgate payment + Strapi order
│           └── webhook/route.ts    # Comgate payment status webhook
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/                     # Header, Footer
│   ├── shop/                       # ProductCard, ProductGrid, CartDrawer, AddToCartButton
│   └── checkout/                   # CheckoutForm
├── hooks/                          # TanStack Query hooks
│   ├── use-products.ts
│   ├── use-product.ts
│   └── use-categories.ts
├── lib/
│   ├── strapi.ts                   # Strapi API client (server-side)
│   ├── comgate.ts                  # Comgate payment integration
│   └── utils.ts                    # formatPrice, slugify, etc.
├── providers/
│   └── query-provider.tsx          # TanStack Query provider
├── store/
│   └── cart.store.ts               # Zustand cart store (persisted)
└── types/
    ├── strapi.ts                   # Strapi response types
    ├── product.ts                  # Product, Category types
    ├── cart.ts                     # CartItem, CartTotals
    └── order.ts                    # Order, CheckoutFormData, Address
```

## Comgate integration

1. Create account at [https://portal.comgate.cz](https://portal.comgate.cz)
2. Get merchant ID and secret key
3. Set webhook URL to `https://yourdomain.com/api/payment/webhook`
4. Add credentials to `.env.local`

## Strapi API token

After starting Strapi:
1. Go to `http://localhost:1337/admin`
2. Settings → API Tokens → Create new token
3. Type: Full access (or custom with read products/categories, write orders)
4. Copy token to `STRAPI_API_TOKEN` in `.env.local`

# 🚚 Delivery System

A complete web app to manage product deliveries for a delivery team.
Track products, buyers, drivers, prices and earnings — mark each order as
**delivered** or **cancelled**, and share a **live link** with your whole team.

Built with **Next.js 14**, **TypeScript**, **Prisma** and **Tailwind CSS**.

---

## ✨ Features

- **Add deliveries** with everything you need:
  - Serial number (auto-generated, or type your own)
  - Product name
  - Buyer name & phone number (tap-to-call)
  - City / area & address
  - Product price, delivery price, **auto-calculated total**
  - **Driver gain** (how much the driver earns)
  - Notes
- **Driver / team management** — add multiple drivers and assign orders to them.
- **Status tracking** — `Pending` → `Delivered` or `Cancelled`, with one click.
- **Dashboard stats** — total orders, delivered/cancelled, revenue and drivers' earnings.
- **Search & filters** — by status, driver, or free text (product, buyer, serial, phone).
- **Fully responsive** — works great on phones for drivers on the road.
- **Shareable live link** — deploy once, everyone uses the same live data.

---

## 🏃 Run it locally

```bash
npm install          # install dependencies
npm run db:push      # create the database
npm run db:seed      # (optional) add sample data
npm run dev          # start the app
```

Then open **http://localhost:3000**.

> Useful extras:
> - `npm run db:studio` — a visual editor for your data.
> - Change the currency in `src/lib/utils.ts` (`formatMoney`, default `USD`).

---

## 🌍 Make it a live link to share

The app is ready to deploy. Because it uses a database, pick one of these:

### Option A — Vercel + Neon (free, recommended)

1. Push this project to a **GitHub** repo.
2. Create a free Postgres database at **[neon.tech](https://neon.tech)** and copy its
   connection string.
3. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"   // was: sqlite
     url      = env("DATABASE_URL")
   }
   ```
4. Go to **[vercel.com](https://vercel.com)** → *New Project* → import your repo.
5. Add an environment variable `DATABASE_URL` = your Neon connection string.
6. Deploy. Vercel gives you a public URL like
   `https://your-delivery-system.vercel.app` — **that's your live link to share.** 🎉

   > After the first deploy, run `npx prisma db push` once locally (pointed at your
   > Neon `DATABASE_URL`) to create the tables.

### Option B — Keep SQLite (Railway / Render)

Prefer not to change the database? Deploy to **[Railway](https://railway.app)** or
**[Render](https://render.com)**, which give the app a **persistent disk** so the
SQLite file survives restarts. Add a volume, set the build command to
`npm run build` and start command to `npm run start`.

---

## 🗂️ Project structure

```
prisma/
  schema.prisma      # database models (Driver, Delivery)
  seed.ts            # sample data
src/
  app/
    page.tsx         # main dashboard (table + filters + actions)
    layout.tsx       # root layout
    globals.css      # Tailwind styles
    api/
      deliveries/    # list, create, update, delete deliveries
      drivers/       # list, create, update, delete drivers
      stats/         # dashboard summary numbers
  components/        # DeliveryForm, DriversManager, StatCards, StatusBadge
  lib/               # prisma client + helpers
```

## 🔌 API reference

| Method | Endpoint               | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/api/deliveries`      | List (filters: `status`, `driverId`, `q`) |
| POST   | `/api/deliveries`      | Create a delivery                    |
| PATCH  | `/api/deliveries/:id`  | Update fields or status              |
| DELETE | `/api/deliveries/:id`  | Delete a delivery                    |
| GET    | `/api/drivers`         | List drivers                         |
| POST   | `/api/drivers`         | Add a driver                         |
| PATCH  | `/api/drivers/:id`     | Update a driver                      |
| DELETE | `/api/drivers/:id`     | Remove a driver                      |
| GET    | `/api/stats`           | Dashboard summary                    |

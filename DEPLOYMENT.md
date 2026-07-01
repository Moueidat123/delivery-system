# 🚀 Deploy your Delivery System (get a live link)

Follow these **3 steps** to get a permanent public URL you can share with your whole
team. Total time: ~10 minutes, and everything here is **free**.

---

## Step 1 — Create a free database (Neon)

1. Go to **https://neon.tech** and sign up (Google/GitHub works).
2. Click **Create Project**. Name it `delivery-system`, pick the region closest to you.
3. Open **Connection Details**.
4. In the connection-string dropdown, choose **Direct connection** (not "Pooled").
5. Copy the string. It looks like:
   ```
   postgresql://alex:AbCdEf123@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2 — Add your database URL to the app

Open the **`.env`** file in this project and paste your Neon string:

```
DATABASE_URL="postgresql://...your string...?sslmode=require"
```

Then create the tables and (optionally) add sample data:

```bash
npm run db:push      # creates the tables in your Neon database
npm run db:seed      # optional: adds sample drivers & deliveries
npm run dev          # test locally against the live database
```

> 💡 Tell me **"done"** after you paste the URL and I'll run these for you and verify it works.

## Step 3 — Put it online (GitHub + Vercel)

### 3a. Push to GitHub
1. Create a new empty repo at **https://github.com/new** — name it `delivery-system`,
   and **don't** add a README/gitignore (this project already has them).
2. Run these commands (replace `<your-username>`):
   ```bash
   git remote add origin https://github.com/<your-username>/delivery-system.git
   git branch -M main
   git push -u origin main
   ```
   > The first commit is already created for you.

### 3b. Deploy on Vercel
1. Go to **https://vercel.com** and sign up with GitHub.
2. Click **Add New… → Project** and **import** your `delivery-system` repo.
3. Expand **Environment Variables** and add:
   - **Name:** `DATABASE_URL`
   - **Value:** your Neon connection string (the same one from Step 1)
4. Click **Deploy** and wait ~1 minute.
5. Vercel gives you a URL like **`https://delivery-system-xxxx.vercel.app`**.

🎉 **That's your live link** — share it with your drivers and team. Everyone sees and
updates the same data in real time.

---

## 🔁 Updating later
Every time you `git push` to GitHub, Vercel automatically rebuilds and redeploys. No
extra steps.

## ⚡ Optional: instant temporary link (quick demo today)
Want to show someone right now without deploying? While `npm run dev` is running, open a
second terminal and run:
```bash
npx localtunnel --port 3000
```
It prints a public URL that forwards to your computer. It only works while your computer
and the dev server are on — use the Vercel link for the real, always-on system.

---

## ❓ Troubleshooting
- **Build fails with "Can't reach database server"** → double-check the `DATABASE_URL`
  env var on Vercel matches your Neon **direct** connection string.
- **Tables missing** → the build runs `prisma db push` automatically; make sure
  `DATABASE_URL` is set on Vercel before deploying.
- **Want a visual data editor** → run `npm run db:studio` locally.

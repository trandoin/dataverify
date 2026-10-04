# OmniVerify • Multi-Module Data & Telematics Verification Platform

An enterprise platform for deterministic telematics auditing, SLA compliance verification, dynamic route corridor adherence, and forensic audit reports.

---

## 🚀 Deploying to Render.com (Step-by-Step)

### Step 1: Create a PostgreSQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **PostgreSQL**.
3. Set Name to `omniverify-db`.
4. Choose the **Free tier**.
5. Once created, copy the **Internal Database URL** (e.g. `postgres://user:password@dpg-xxx:5432/omniverify_db`).

---

### Step 2: Deploy Web Service on Render
1. Click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository `dataverify`.
3. Configure the service settings:
   - **Name:** `omniverify`
   - **Environment:** `Node`
   - **Branch:** `main` (or `master`)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(paste the Internal Database URL from Step 1)*
   - `PORT`: `4000`
   - `JWT_SECRET`: `omniverify_super_secret_jwt_key_2026`
5. Click **Create Web Service**.

---

### Step 3: Seed Initial Fleet Data on Render (Optional)
To seed initial fleet data on your cloud database, run from Render's **Shell** tab:
```bash
node update_all_fleet_dynamic.cjs
```

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Backend API:**
   ```bash
   npm start
   ```

3. **Start Vite Dev Server:**
   ```bash
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

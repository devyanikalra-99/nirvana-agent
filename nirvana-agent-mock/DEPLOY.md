# Deploying to GitHub + Vercel

You have two paths. **Path A (web UI)** needs no command line. **Path B (CLI)** is faster if you already use git.

---

## Path A — GitHub website + Vercel (no terminal)

### 1. Create the repo
1. Go to https://github.com/new
2. Name it `nirvana-agent-mock` (keep it **Private**), leave everything else unchecked, click **Create repository**.

### 2. Upload the files
1. On the new empty repo page, click **uploading an existing file**.
2. Unzip the project on your machine, then drag in **everything inside** the `nirvana-agent-mock` folder — including `package.json`, `vite.config.js`, `index.html`, the `src/` folder, `.gitignore`, and `README.md`.
   - Do **not** upload `node_modules` (it isn't included anyway).
3. Click **Commit changes**.

### 3. Import into Vercel
1. Go to https://vercel.com/new
2. Pick **Import Git Repository** and choose `nirvana-agent-mock`.
   (If you don't see it, click **Adjust GitHub App Permissions** and grant access to the repo.)
3. Vercel auto-detects **Vite**. Confirm:
   - Framework Preset: **Vite**
   - Build Command: `vite build` (or `npm run build`)
   - Output Directory: `dist`
4. Click **Deploy**. ~1 minute later you get a live `*.vercel.app` URL.

Every future push to the repo's default branch auto-redeploys.

---

## Path B — Command line

From inside the unzipped `nirvana-agent-mock` folder:

```bash
# sanity check it builds locally first
npm install
npm run build

# init and push to GitHub
git init
git add .
git commit -m "Nirvana Agent mock"
git branch -M main
git remote add origin https://github.com/<your-username>/nirvana-agent-mock.git
git push -u origin main
```

(Create the empty `nirvana-agent-mock` repo at https://github.com/new first so the remote exists.)

Then either import the repo at https://vercel.com/new (as in Path A, step 3), or use the Vercel CLI:

```bash
npm i -g vercel
vercel          # first run links/creates the project
vercel --prod   # promote to production
```

---

## Notes

- **Dependencies:** `react`, `react-dom`, `lucide-react`. Vercel installs these during build; you don't commit `node_modules`.
- **Pinning lucide-react:** it's pinned to `0.383.0` to match the icon set the mock was written against. Safe to bump later.
- **Custom domain / renaming:** in Vercel → Project → Settings → Domains.
- This is a static front-end mock with no backend or secrets, so nothing to configure for env vars.

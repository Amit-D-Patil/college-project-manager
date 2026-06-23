# Full-Stack Deployment Guide: GitHub & Cloud Hosting

This document guides you through pushing your project to **GitHub** and deploying it to production services.

---

## 1. Push Code to GitHub

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com).
2. Click the **New** button to create a new repository.
3. Name it `college-project-manager`, set it to **Public** or **Private**, and click **Create repository**.
4. Copy the repository URL (e.g. `https://github.com/your-username/college-project-manager.git`).

### Step 2: Initialize Git and Push Local Code
Open your terminal in the root project folder `college-project-manager/` and run:
```bash
# Initialize git repository
git init

# Add all files to staging (ignoring node_modules via our .gitignore config)
git add .

# Create initial commit
git commit -m "feat: initial commit of project ERP portal"

# Link to your remote GitHub repository
git branch -M main
git remote add origin https://github.com/your-username/college-project-manager.git

# Push code to GitHub
git push -u origin main
```

---

## 2. Set Up Cloud Database (MongoDB Atlas)

To run the project in production, you need a cloud MongoDB connection string:
1. Register/Login to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Free Shared Cluster**.
3. Under **Database Access**, create a user credentials (e.g., username: `dbUser`, password: `yourPassword`).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (0.0.0.0/0)** (required for Render hosting).
5. Navigate to **Database** -> Click **Connect** on your cluster -> Select **Drivers** -> Copy the connection URI string. It should look like:
   `mongodb+srv://dbUser:<password>@cluster0.abcde.mongodb.net/college_project_db?retryWrites=true&w=majority`

---

## 3. Deploy Backend API Server (Render)

We recommend using [Render](https://render.com) (Free Tier) to host the Express API:
1. Log in to Render using your GitHub account.
2. Click **New +** -> Select **Web Service**.
3. Connect your GitHub repository `college-project-manager`.
4. Configure Web Service settings:
   * **Name**: `college-project-manager-backend`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node src/server.js`
5. Click **Advanced** to add **Environment Variables**:
   * `PORT`: `5000`
   * `NODE_ENV`: `production`
   * `MONGO_URI`: `(Your MongoDB Atlas connection string from Step 2)`
   * `JWT_SECRET`: `(Create a strong random secret key)`
   * `JWT_EXPIRE`: `30d`
6. Click **Create Web Service**. Wait for the build logs to show success.
7. Copy the public URL of your service (e.g., `https://college-project-manager-backend.onrender.com`).

---

## 4. Deploy Frontend Client (Vercel)

We recommend using [Vercel](https://vercel.com) (Free Tier) to host the static React SPA:
1. Log in to Vercel using your GitHub account.
2. Click **Add New...** -> Select **Project**.
3. Import your GitHub repository `college-project-manager`.
4. Configure Project settings:
   * **Root Directory**: Select `frontend`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Click **Deploy**. Vercel will build and assign you a public URL (e.g., `https://college-project-manager.vercel.app`).

### Step 5: Bind Frontend to Production Backend
By default, the frontend points to `http://localhost:5000/api`. To update this for production:
1. Open `frontend/src/utils/api.js` and update the base URL:
   ```diff
   const API = axios.create({
   -  baseURL: 'http://localhost:5000/api',
   +  baseURL: 'https://your-backend-render-url.onrender.com/api',
      timeout: 30000,
   });
   ```
2. Commit and push the changes to GitHub:
   ```bash
   git add .
   git commit -m "config: update production API endpoint"
   git push origin main
   ```
   *Vercel will automatically redeploy the frontend with the updated endpoint.*

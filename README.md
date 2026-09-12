# 👕 Thread Theory

### E-Commerce Website of Clothing with 3D Virtual Try-On

[![Frontend](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=111111)](https://react.dev/)
[![UI](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![API](https://img.shields.io/badge/API-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![3D](https://img.shields.io/badge/3D-Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![AI](https://img.shields.io/badge/Computer%20Vision-MediaPipe-4285F4)](https://ai.google.dev/edge/mediapipe)

> **Thread Theory** is a full-stack academic clothing e-commerce project that combines the MERN stack with WebGL/Three.js and browser-based computer vision to create an interactive shopping experience.

---

## 📌 Project Overview

Thread Theory is designed to improve the traditional online clothing-shopping experience by combining a modern e-commerce storefront with an interactive **3D Virtual Try-On** feature.

The project documentation describes a platform built around:

- Product discovery and catalog browsing
- User registration and authentication
- Shopping cart and checkout workflows
- Wishlist, reviews, order history, and support
- Admin product and inventory management
- Order and fulfillment management
- Business analytics
- Real-time 3D Virtual Try-On using webcam-based pose estimation

The project uses React.js and Tailwind CSS on the frontend, Node.js and Express.js on the backend, MongoDB for data storage, `@react-three/fiber` / `@react-three/drei` for 3D rendering, and `@mediapipe/tasks-vision` for computer-vision pose tracking.

---

## ✨ Main Highlights

### 🛍️ Customer Side

- Responsive clothing catalog
- Product search and filtering
- Category, size, color, fabric, and price filtering
- Product details and sizing information
- Wishlist
- Shopping cart
- Size and color variant selection
- Checkout and payment workflow
- Order history and tracking
- Ratings and reviews
- Customer support and returns

### 🕶️ 3D Virtual Try-On

The core innovation of Thread Theory is the browser-based Virtual Try-On experience.

The documented architecture uses:

```text
Webcam
   ↓
MediaPipe PoseLandmarker
   ↓
Body / Pose Landmarks
   ↓
Position + Scale Calculations
   ↓
React Three Fiber
   ↓
3D .glb Clothing Model
   ↓
Interactive Virtual Try-On
```

The documentation describes pose processing as client-side and uses externally hosted `.glb` assets to keep the main application server lightweight.

### 🛠️ Admin / Staff Side

- Admin authentication
- Product CRUD
- Product variant management
- Size/color stock management
- 3D `.glb` asset URL management
- Order management
- Shipment status updates
- Customer management
- Return/refund workflows
- Business analytics
- Role-based Admin/Staff access

---

# 🧱 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Frontend Build Tool | Vite |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| 3D Rendering | Three.js |
| React 3D | `@react-three/fiber` |
| 3D Utilities | `@react-three/drei` |
| Computer Vision | `@mediapipe/tasks-vision` |
| Authentication | JWT |
| Password Security | bcrypt |
| API Security / Integration | CORS |
| API Testing | Postman |
| Development IDE | Visual Studio Code |
| Database Tools | MongoDB Compass / MongoDB Atlas |
| Deployment Configuration | Vercel configuration is present in the client |

---

# 📂 Actual Repository Structure

This repository is organized with separate **client**, **server**, and **docs** areas:

```text
clothing project/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── vercel.json
│   └── vite.config.js
│
├── docs/
│   ├── MAJOR_PPT.pptx
│   └── MAJOR_PROJECT_DOCUMENTATION.pdf
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── node_modules/
│   ├── public/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
│
└── .gitignore
```

### Important

The root `.gitignore` applies to the complete project. It intentionally does **not** ignore the `docs/` directory, so your academic PPT/PDF documentation can be version-controlled.

---

# 🏗️ Application Architecture

```text
                           THREAD THEORY
                                │
                ┌───────────────┴───────────────┐
                │                               │
          CUSTOMER WEB APP                 ADMIN / STAFF
                │                               │
                └───────────────┬───────────────┘
                                │
                                ▼
                         REACT FRONTEND
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
              Tailwind       MediaPipe      Three.js
                 │          Pose Tracking      │
                 │              │              │
                 └──────────────┼──────────────┘
                                │
                           REST API
                                │
                                ▼
                       NODE.JS + EXPRESS
                                │
                ┌───────────────┼───────────────┐
                │               │               │
             Auth/JWT        Products         Orders
                │               │               │
                └───────────────┼───────────────┘
                                │
                                ▼
                             MongoDB
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/thread-theory.git
cd "clothing project"
```

Replace the GitHub URL and folder name with your actual values.

---

## 2. Install Client Dependencies

```bash
cd client
npm install
```

---

## 3. Install Server Dependencies

Open another terminal from the project root:

```bash
cd server
npm install
```

> Do not upload `node_modules/` to GitHub. The root `.gitignore` already ignores nested `node_modules` directories.

---

# 🔐 Environment Variables

The project currently contains `.env` files under both `client` and `server`.

### Never push real `.env` files

The root `.gitignore` blocks:

```text
client/.env
server/.env
```

A safer repository should contain an example file such as:

```text
client/.env.example
server/.env.example
```

with empty or placeholder values.

For example:

```env
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
```

Use the **exact variable names required by your existing source code**.

---

# ▶️ Running the Project Locally

Because the frontend and backend are separate applications, run them independently.

## Frontend

```bash
cd client
npm run dev
```

Vite will print the local development URL in the terminal.

## Backend

```bash
cd server
npm run dev
```

If the backend package does not define a `dev` script, open:

```text
server/package.json
```

and use the script defined under `"scripts"`.

For example, a backend may use:

```bash
npm start
```

The `package.json` files in this repository are the source of truth for the exact commands.

---

# 🧪 Testing

Recommended testing flow:

```text
Application Starts
       ↓
Homepage Loads
       ↓
Product Search
       ↓
Product Details
       ↓
Select Size / Color
       ↓
Add To Cart
       ↓
Login / Checkout
       ↓
Order Creation
       ↓
Admin Order Management
       ↓
Inventory Update
```

For the Virtual Try-On flow:

```text
Open Try-On
     ↓
Allow Camera
     ↓
Load MediaPipe
     ↓
Detect Pose
     ↓
Load 3D .glb Model
     ↓
Render Clothing
     ↓
Move / Test Tracking
```

---

# 🔒 Security Checklist

Before every GitHub push, verify:

```text
[ ] .env is not staged
[ ] Passwords are not staged
[ ] API keys are not staged
[ ] MongoDB credentials are not staged
[ ] node_modules/ is not staged
[ ] Build output is not staged
[ ] Private certificates are not staged
[ ] Only intended files are staged
```

Run:

```bash
git status
git diff --cached
```

before committing important changes.

---

# 🌿 Recommended Git Workflow

For normal development:

```bash
git status
git pull --rebase origin main

# Make your changes

git status
git add <file-or-folder>
git diff --cached
git commit -m "feat: describe your change"
git push
```

### Example

```bash
git add client/src/
git commit -m "feat: improve storefront experience"
git push
```

For documentation:

```bash
git add README.md docs/
git commit -m "docs: update project documentation"
git push
```

---

# 🧠 Beginner Git Cheat Sheet

| Command | Purpose |
|---|---|
| `git status` | See current changes |
| `git add <file>` | Stage a file |
| `git add .` | Stage all non-ignored changes |
| `git diff` | See unstaged changes |
| `git diff --cached` | Review staged changes |
| `git commit -m "message"` | Create a local commit |
| `git push` | Upload commits to GitHub |
| `git pull --rebase` | Update your local branch |
| `git log --oneline` | View commit history |
| `git remote -v` | See the connected GitHub repository |
| `git branch --show-current` | See your current branch |
| `git switch -c feature/name` | Create a feature branch |

---

# 📦 First GitHub Push

If this folder is **not already a Git repository**:

```bash
git init -b main
git add -A
git diff --cached
git commit -m "feat: initial Thread Theory project"
git remote add origin https://github.com/YOUR-USERNAME/thread-theory.git
git push -u origin main
```

If Git is already initialized:

```bash
git status
git remote -v
```

Do not run `git init` or `git remote add origin` again when they are already configured correctly.

---

# 📝 Project Documentation

The `docs/` directory contains the academic project material.

Recommended layout:

```text
docs/
├── MAJOR_PPT.pptx
└── MAJOR_PROJECT_DOCUMENTATION.pdf
```

The documentation identifies the project as **Thread Theory — E-commerce Website of Clothes**, developed for BCA Semester VI during A.Y. 2025–26. It describes the MERN architecture, 3D rendering, MediaPipe computer vision, project modules, system design, testing, future scope, and conclusion.

---

# 🔮 Future Scope

The project documentation identifies several future enhancement areas:

- AR-based Virtual Try-On
- AI-powered style recommendations
- Multi-currency international checkout
- BNPL / EMI payment support
- Automated logistics tracking
- Progressive Web App (PWA) support

---

# 🎓 Academic Information

**Project Title:** Thread Theory – E-commerce Website of Clothes  
**Course:** Bachelor of Computer Applications (BCA), Semester VI  
**Academic Year:** 2025–26  
**College:** SDJ International College, Vesu  
**Project Guide:** Mr. Smit Parekh

### Project Team

- **Bhingradia Fenil Nitinbhai**
- **Savsani Ronak Anilbhai**
- **Avaiya Nand Rajeshkumar**

---

# 📚 References

The academic documentation references:

- React.js
- Node.js
- Express.js
- MongoDB
- Tailwind CSS
- MDN Web Docs
- JWT
- bcryptjs
- MediaPipe
- Three.js / React Three Fiber

See the complete project documentation inside `docs/`.

---

# ⭐ Project Vision

> **Thread Theory brings the confidence of an interactive fitting-room experience into modern online clothing commerce.**

The combination of a MERN e-commerce platform, real-time 3D visualization, and browser-based computer vision provides the foundation for an immersive digital fashion-shopping experience.

---

## 👨‍💻 Maintained as an Academic Project

This repository contains the source code and documentation for the Thread Theory BCA major project.

**Built with React + Node.js + Express + MongoDB + Three.js + MediaPipe.**

# Thread Theory

> A modern clothing e-commerce platform with an immersive 3D Virtual Try-On experience.

**Thread Theory** is an academic full-stack e-commerce project for clothing retail. The documented system combines the **MERN stack** with **WebGL/Three.js** and **MediaPipe computer vision** to create a responsive shopping experience with product discovery, authentication, cart and checkout workflows, administrative management, and a real-time 3D Virtual Try-On feature.

[![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/API-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Three.js](https://img.shields.io/badge/3D-Three.js-black?logo=three.js)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-blue)](https://ai.google.dev/edge/mediapipe/solutions/guide)

---

## ✨ Why Thread Theory?

Traditional clothing e-commerce depends heavily on static 2D images and sizing charts. Thread Theory is designed to make the shopping experience more interactive by bringing a virtual fitting-room concept into the browser.

The core innovation is the **3D Virtual Try-On Engine**, which uses browser-based pose estimation and 3D rendering to place clothing models over the user's live camera view.

### Key goals

- 🛍️ Premium clothing shopping experience
- 👕 Real-time 3D Virtual Try-On
- 📦 Product, SKU, inventory, and order management
- 🔐 Secure authentication and role-based administration
- 📊 Admin analytics and operational monitoring
- 📱 Responsive, mobile-first interface
- ⚡ Optimized loading for heavy 3D assets

---

## 🚀 Core Features

### Customer Experience

- User registration, login, logout, and profile management
- Product browsing and detailed product pages
- Filtering by category, size, color, fabric, and price
- Wishlist management
- Dynamic shopping cart
- Size and color variant selection
- Secure checkout flow
- Order history and shipment tracking
- Ratings and reviews
- Customer support and return workflows
- **3D Virtual Try-On** using webcam-based pose tracking

### Virtual Try-On

The documented implementation uses:

- `@mediapipe/tasks-vision`
- `PoseLandmarker`
- `FilesetResolver`
- `@react-three/fiber`
- `@react-three/drei`
- `.glb` clothing assets
- WebGL rendering
- Real-time skeletal landmark calculations

The documentation specifies that pose processing is intended to run locally in the browser, while 3D models are retrieved from external GitHub raw URLs.

### Admin / Staff

- Admin authentication and protected routes
- Product CRUD operations
- Size/color stock management
- 3D `.glb` asset URL management
- Inventory monitoring
- Order processing
- Shipment-status management
- Customer management
- Return/refund workflows
- Sales and business analytics
- Role-based Admin/Staff access

---

## 🧩 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, Tailwind CSS |
| Backend | Node.js, Express.js, CORS |
| Database | MongoDB, Mongoose |
| 3D Rendering | Three.js, `@react-three/fiber`, `@react-three/drei` |
| Computer Vision | `@mediapipe/tasks-vision` |
| 3D Assets | `.glb` models via externally hosted URLs |
| Development | Visual Studio Code, Vite |
| API Testing | Postman |
| Database Tools | MongoDB Compass, MongoDB Atlas |

---

## 🏗️ High-Level Architecture

```text
┌───────────────────────────────────────────────┐
│                 CUSTOMER                      │
│  Browser / Mobile / Desktop                  │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              REACT FRONTEND                   │
│  UI + Tailwind + Cart + Auth + Catalog       │
│                                               │
│  ┌─────────────────┐   ┌───────────────────┐  │
│  │ MediaPipe CV    │   │ Three.js / R3F    │  │
│  │ Pose Landmarks  │──►│ 3D Virtual Try-On │  │
│  └─────────────────┘   └───────────────────┘  │
└───────────────────────┬───────────────────────┘
                        │ REST API
                        ▼
┌───────────────────────────────────────────────┐
│            NODE.JS + EXPRESS API              │
│ Auth • Products • Cart • Orders • Admin       │
│ JWT • bcrypt • CORS • Business Logic          │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                  MONGODB                      │
│ Users • Products • Variants • Orders • Data   │
└───────────────────────────────────────────────┘
```

---

## 📁 Repository Organization

A clean MERN repository can be organized like this:

```text
thread-theory/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   ├── package.json
│   └── ...
│
├── docs/
│   └── MAJOR_PROJECT_DOCUMENTATION.pdf
│
├── .gitignore
├── README.md
└── package.json
```

> **Important:** Your actual folder names may differ. Keep the README synchronized with the real repository structure.

---

## 💻 Requirements

The project documentation specifies the following development environment:

- Windows 10/11, macOS, or Linux
- Node.js
- MongoDB / MongoDB Atlas
- Visual Studio Code
- Modern browser with WebGL support
- Postman for API testing
- Webcam for the Virtual Try-On feature

For smooth 3D rendering, the documentation recommends a development machine with approximately **16 GB RAM**, SSD storage, and hardware capable of WebGL rendering.

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
```

### 2. Install dependencies

From the frontend directory:

```bash
cd frontend
npm install
```

From the backend directory:

```bash
cd ../backend
npm install
```

### 3. Configure environment variables

Create the environment file expected by the backend and add your real local/cloud configuration.

Example pattern:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

> Use the exact variable names already expected by your source code. Never commit real passwords, API keys, database credentials, or secret tokens.

### 4. Start the backend

```bash
cd backend
npm run dev
```

### 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Then open the local URL printed by Vite.

> Your `package.json` scripts are the source of truth. If the project uses different scripts such as `npm start`, use the scripts defined in your repository.

---

## 🔐 Security Notes

Before pushing the project to GitHub:

- Do **not** commit `.env` files containing secrets.
- Do **not** commit passwords, API keys, database credentials, or private certificates.
- Keep `node_modules/` out of Git.
- Review staged files before every important commit.
- Use protected admin routes and secure authentication.
- Keep camera/pose processing local to the browser where required by the project design.
- Use HTTPS in production when camera access is required.

Recommended check before commit:

```bash
git status
git diff --cached
```

---

## 🧪 Testing

The project documentation covers:

- Unit testing
- Integration testing
- End-to-end checkout testing
- UI/UX and responsive testing
- Security and JWT session testing
- Admin route protection
- Inventory synchronization
- Return-management workflows
- Performance/load testing

A complete end-to-end flow should cover:

```text
Login
  ↓
Search Product
  ↓
Open Product
  ↓
Choose Size / Color
  ↓
Add to Cart
  ↓
Checkout
  ↓
Payment
  ↓
Order Creation
  ↓
Admin Order Processing
```

---

## 🌐 Virtual Try-On Notes

The Virtual Try-On experience depends on:

1. A camera-enabled device
2. A WebGL-capable browser
3. Browser camera permission
4. MediaPipe pose estimation
5. A compatible 3D `.glb` clothing model

The documented system uses pose landmarks to calculate body positioning and dynamically map the 3D clothing model to the user's movement.

Heavy 3D assets are loaded asynchronously and the documentation describes loading-state handling through Drei utilities such as `useProgress` and `Html`.

---

## 📦 GitHub Workflow

For everyday development:

```bash
git status
git pull --rebase origin main

# Make your changes

git add README.md
git diff --cached
git commit -m "docs: improve project documentation"
git push origin main
```

For a normal code change:

```bash
git add <changed-file>
git diff --cached
git commit -m "feat: update product experience"
git push origin main
```

---

## 🔭 Future Enhancements

The project documentation identifies several future directions:

- AR-based Virtual Try-On
- AI-powered personal style recommendations
- Multi-currency international checkout
- BNPL / EMI payment support
- Automated logistics tracking through shipping APIs
- Progressive Web App (PWA) support and offline caching

---

## 👨‍💻 Academic Project

**Project:** Thread Theory – E-commerce Website of Clothes  
**Course:** Bachelor of Computer Applications (BCA), Semester VI  
**Academic Year:** 2025–26  
**College:** SDJ International College, Vesu  
**Project Guide:** Mr. Smit Parekh

### Project Team

- Bhingradia Fenil Nitinbhai
- Savsani Ronak Anilbhai
- Avaiya Nand Rajeshkumar

---

## 📚 Project Documentation

The complete academic project documentation contains the project description, environment requirements, system analysis, proposed system, data-flow diagrams, UML/use-case diagrams, database design, UI design, testing, future scope, conclusion, and references.

Place the PDF inside:

```text
docs/MAJOR_PROJECT_DOCUMENTATION.pdf
```

and keep this README at the root of the repository.

---

## 🤝 Contributing

For a student/academic project, keep changes organized:

1. Create a feature branch.
2. Make a focused change.
3. Test locally.
4. Review `git diff`.
5. Commit with a clear message.
6. Push the branch.
7. Open a Pull Request when collaboration is required.

Example:

```bash
git switch -c feature/virtual-try-on-improvement
git add .
git commit -m "feat: improve virtual try-on experience"
git push -u origin feature/virtual-try-on-improvement
```

---

## ⭐ Project Vision

Thread Theory aims to combine the convenience of online clothing retail with the confidence of an interactive fitting-room experience.

**Shop smarter. Visualize better. Experience fashion digitally.**

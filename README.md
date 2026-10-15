# Kumar Harsh — Software Engineer Portfolio

A premium, responsive personal portfolio for **Kumar Harsh**, showcasing engineering depth across backend systems, real-time applications, and AI-powered software.

Built strictly with clean semantic **HTML5**, modern **CSS3 custom properties**, and vanilla **JavaScript (ES6+)** with zero external runtime build dependencies.

---

## 🚀 Live Preview & Local Execution

This portfolio requires **no build step**, no `npm install`, and no compilation. It can be run locally using any standard static file server or directly opened in a web browser.

### Option 1: Python HTTP Server (Recommended)
```bash
# In the portfolio root directory:
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

### Option 2: Node.js (npx serve or http-server)
```bash
npx serve .
# or
npx http-server -p 8000
```

### Option 3: Direct File Opening
Double-click `index.html` to open directly in any modern desktop or mobile browser.

---

## 🌐 Deployment Instructions

### GitHub Pages Deployment
1. Initialize a git repository and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: premium portfolio for Kumar Harsh"
   ```
2. Create a GitHub repository named `theharshk.github.io` (for user site) or `portfolio` (for project site).
3. Push to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/theharshk/<repo-name>.git
   git push -u origin main
   ```
4. In GitHub repository settings:
   - Navigate to **Settings** &rarr; **Pages**.
   - Under **Build and deployment**, select **Source: Deploy from a branch**.
   - Select branch `main` and folder `/ (root)`.
   - Click **Save**. The portfolio will be live in 1-2 minutes.

### Netlify Deployment
1. Drag and drop the `portfoolio` folder into the Netlify Drop dashboard (`app.netlify.com/drop`), or
2. Connect your GitHub repository with build command left **blank** and publish directory set to `.`.

---

## 🛠 Project Architecture & Directory Layout

```
portfoolio/
├── index.html              # Semantic HTML5, accessible ARIA roles, SEO & Open Graph meta
├── css/
│   └── style.css           # Design tokens, dark charcoal default, elegant light theme,
│                           # responsive grid/flexbox, typography, and motion accessibility
├── js/
│   └── main.js             # Theme controller, mobile drawer, abstract network canvas,
│                           # rotating hero text, expandable case studies, copy toast
├── assets/
│   └── favicon.svg         # Crisp high-DPI vector SVG favicon with "KH" monogram
└── README.md               # Documentation, architecture, and deployment guide
```

---

## 🎨 Design System & Visual Strategy

- **Default Theme:** Dark Charcoal (`#0b0f17` background with `#131c2d` elevated cards and `#1e293b` borders).
- **Alternative Theme:** Elegant Light (`#f8fafc` background with crisp `#ffffff` cards and high contrast text).
- **Accent:** Precision Teal (`#14b8a6` / `#2dd4bf` / `#0d9488`).
- **Typography:**
  - Body & Headings: `Inter`
  - Technical Labels, Code & Metadata: `JetBrains Mono`
- **Abstract Technical Canvas:** Custom `<canvas>` drawing an interconnected system topology representing microservices, network packets, and nodes with restrained animation and mouse interaction.
- **Accessibility:**
  - Full keyboard focus rings (`:focus-visible`).
  - Screen reader semantic elements (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`).
  - `@media (prefers-reduced-motion: reduce)` support that disables canvas loops and smooth transitions for sensitive users.
  - WCAG AA/AAA color contrast compliance.

---

## 💼 Verified Engineering Experience & Projects

### Experience: Arya.ag (SDET Intern, June 2025 – March 2026)
- Enterprise Java/Spring Boot microservice ecosystems across 4 platforms: WMS (Warehouse), CAMS (Customer), NOMS (Notification), and DOMS (Document Management).
- Centralized log diagnostics for production bottlenecks.
- SQL consistency audits and payload verification.
- TestNG regression test suites and REST API validation.

### Major Projects:
1. **Phone PC Hypnotiser** ([Repository](https://github.com/theharshk/phone-pc-hypnotiser))
   - Java 17, Spring Boot 3, WebSockets, JNA, JUnit 5, Mockito.
   - Multithreaded screen streaming, bounded blocking queue backpressure with client ACK frame dropping, native Win32 `SendInput` API integration via JNA.
2. **HCP CRM — AI-First Field Rep Logging System** ([Repository](https://github.com/theharshk/hcp-crm-ai))
   - Python, FastAPI, LangGraph, LangChain, Groq/Llama, PostgreSQL, React, Redux, Docker Compose.
   - Agentic StateGraph workflows, prompt/context engineering, dynamic tool binding, tool execution latency reduced from ~15s to <50ms.
3. **Enterprise Rental Management System** ([Repository](https://github.com/theharshk/Layered-Microservice-Architecture-Engine))
   - Java 17, Spring Boot 3, MySQL, JWT, Swagger/OpenAPI, Docker, React, TypeScript, Zustand.
   - Clean layered architecture, stateless Spring Security 6 RBAC, scheduled lease expiry cron tasks, and full REST API documentation.
4. **Real-Time AI Chat App** ([Frontend](https://github.com/theharshk/chat-app) | [Backend](https://github.com/theharshk/chatapp-backend))
   - Node.js, Socket.IO, Gemini API.

---

## 📬 Contact & Identity

- **Name:** Kumar Harsh
- **Role:** Software Engineer (Backend Systems, Full-Stack Applications, AI Engineering)
- **Email:** [kharsh.wrk@gmail.com](mailto:kharsh.wrk@gmail.com)
- **Phone:** +91 6202447542
- **GitHub:** [github.com/theharshk](https://github.com/theharshk)
- **LinkedIn:** [linkedin.com/in/harshkumar731](https://www.linkedin.com/in/harshkumar731/)

---

© 2026 Kumar Harsh. All rights reserved.

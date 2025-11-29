# Dynamic Form Builder System

A robust, full-stack application that dynamically renders forms based on a backend JSON schema. This project demonstrates a complete end-to-end flow: from schema definition and dynamic frontend rendering to server-side validation and data persistence.

Built with performance and type safety in mind, utilizing the **TanStack** suite and **Shadcn UI** within a **Turborepo** monorepo structure.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-stable-green.svg)

---

## 🌟 Key Features

### Frontend (Client-Side)
* **Dynamic Rendering**: The form is not hardcoded. It is generated entirely from the API response (`/api/form-schema`), supporting Text, Number, Select, Multi-select, Date, Textarea, and Switch types.
* **Robust Validation**: Implements **Zod** schema validation on the client side for immediate user feedback (Regex, Min/Max lengths, Date constraints).
* **Modern UI**: Built with **Shadcn UI** and **Tailwind CSS** for a fully responsive, accessible, and professional design.
* **Data Management**:
    * **TanStack Query**: Handles server state, caching, and background refetching.
    * **TanStack Form**: Headless form state management for maximum performance.
    * **TanStack Table**: A powerful datatable for submissions with server-side pagination and sorting.

### Backend (Server-Side)
* **Schema Source of Truth**: Serves the JSON configuration that dictates the frontend behavior.
* **Data Persistence**: Uses **SQLite3** for lightweight, serverless, and reliable data storage without complex setup.
* **Security**: Re-validates all incoming data against the schema using Zod on the server to prevent malicious payloads.
* **Pagination API**: Optimized SQL queries to handle large datasets efficiently using `LIMIT` and `OFFSET`.

---

## 🛠️ Technology Stack

| Area | Technologies |
| :--- | :--- |
| **Monorepo** | Turborepo, NPM Workspaces |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Shadcn UI, Lucide React |
| **State/Logic** | TanStack Query (v5), TanStack Form, TanStack Table, Zod |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite3 (via `sqlite3` driver) |

---

## 📂 Project Structure

This project follows a strict monorepo architecture separating concerns between the client and server.

```text
dynamic-form-system/
├── package.json              # Root config / Workspaces
├── turbo.json                # Pipeline configuration
├── backend/                  # Express API
│   ├── src/
│   │   ├── server.js         # Entry point & DB Connection
│   │   └── data/
│   │       └── schema.json   # Form Definition (The "Brain")
│   └── package.json
└── frontend/                 # React Application
    ├── src/
    │   ├── api/              # API Integration layer
    │   ├── components/
    │   │   ├── ui/           # Shadcn UI Components (Button, Card, Input...)
    │   │   ├── DynamicForm.tsx      # Main Form Logic
    │   │   └── SubmissionsTable.tsx # Data Table Logic
    │   ├── types/            # Shared TypeScript Interfaces
    │   ├── App.tsx           # Layout & Routing
    │   └── main.tsx
    ├── tailwind.config.js
    └── vite.config.ts
```
### 🚀 Getting Started
Follow these steps to run the complete system locally.

### 1. Prerequisites
Node.js (v18 or higher)

npm (v9 or higher)

### 2. Installation
Clone the repository and install dependencies for the root, backend, and frontend simultaneously.

```text
git clone [https://github.com/sagar67/dynamic-form-system.git](https://github.com/sagar67/dynamic-form-system.git)
cd dynamic-form-system
npm install
```
### 3. Running the App
This project uses Turborepo to run both the backend and frontend in parallel with a single command.

```
npm run dev
```

  * Frontend: Open http://localhost:5173 in your browser.
  
  * Backend API: Running on http://localhost:3001.

### 📡 API Documentation
### 1. Get Form Definition
Returns the JSON schema used to build the form.

  * **Endpoint**: GET /api/form-schema

  * **Response**:
  
  ```
  {
    "title": "Employee Onboarding",
    "fields": [ ... ]
  }
  ```
### 2. Submit Form Data
  * **Endpoint**: POST /api/submissions
  
  * **Body**: JSON object matching the schema fields.
  
  * **Response**: 201 Created with Submission ID.

### 3. Fetch Submissions
  * **Endpoint**: GET /api/submissions
  
  * **Query Params**:

    * **page**: Page number (default: 1)
    
    * **limit**: Items per page (default: 10)
    
    * **sortOrder**: asc or desc (default: desc)

### 💡 Architecture Decisions
1. SQLite: I chose SQLite because it requires zero configuration from other developers running this project. It creates the database.db file automatically upon server start, making the app highly portable.

2. TanStack Libraries: Instead of using heavy all-in-one frameworks, I used headless libraries (Table, Form). This allowed me to build a completely custom UI using Shadcn without fighting against default styles.

3. Strict Typing: The frontend uses TypeScript with strict mode enabled. Zod schemas are used to infer types dynamically, reducing the risk of runtime errors when handling the dynamic JSON data.

### 🐛 Known Issues / Future Improvements
  * Date Timezones: Currently, dates are stored as ISO strings. In a future update, I plan to normalize all dates to UTC on the backend to prevent timezone offsets on different client machines.
  
  * Mobile Table View: The submissions table is responsive, but for very small screens, a card-based view might be a better UX than a horizontally scrolling table.

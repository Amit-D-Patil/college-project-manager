# College Final Year Project Management System: Installation & Testing Guide

This document describes how to set up, seed, and run the ERP-style Project Lifecycle Management System locally.

---

## Prerequisites
1. **Node.js**: Version 18.x or above.
2. **MongoDB**: Local MongoDB instance running on port `27017` (e.g. MongoDB Community Edition).

---

## Setup Instructions

### 1. Backend Server Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the database seed script to populate default departments, academic years, admin users, faculty guides, and a sample student group:
   ```bash
   node src/db/seed.js
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### 2. Frontend Client Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be hosted on `http://localhost:5173`.*

---

## System Role Testing Accounts

To test the role-based ERP dashboards, use the following preset accounts (passwords: `Welcome@123` unless noted):

| Role | Email | Password | Features to Test |
| :--- | :--- | :--- | :--- |
| **Student (Leader)** | `student1@college.edu` | `Welcome@123` | View team members, register project synopses, upload documents, and submit task files. |
| **Faculty Guide & HOD**| `hod_cs@college.edu` | `Welcome@123` | Input milestone review marks, take attendance, view group deliverables, and access department compliance analytics. |
| **Project Coordinator** | `coordinator_cs@college.edu` | `Welcome@123` | Auto-allocate guides to groups, review project synopsis proposals, upload notices, and download compliance reports. |
| **Principal** | `principal@college.edu` | `Welcome@123` | View campus workload analytics, notice board updates, and download compliance grades reports. |
| **Administrator** | `admin@college.edu` | `Admin@123` | Add academic sessions, configure department codes, and toggle student or faculty account activity status. |

*Quick login buttons are available on the bottom of the Login page to let you sign in with any of these roles in one click.*

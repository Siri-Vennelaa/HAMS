# Hospital Appointment Management System (HAMS)

A full-stack production-grade MERN Hospital Appointment Management System featuring 3 role portals: **Patient**, **Doctor**, and **Admin**. All consultation fees are configured in Indian Rupees (`₹`).

---

## 1. Prerequisites (Install on the New PC)

Before running the project on a new PC, make sure you have:
1. **Node.js (LTS version: v18, v20, or v22)**
   - Download from: [https://nodejs.org/](https://nodejs.org/)
   - Verify installation in terminal:
     ```bash
     node -v
     npm -v
     ```
2. **Web Browser**: Chrome, Edge, Firefox, or Brave.
3. *(Optional)* **VS Code**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## 2. Before Sharing/Copying the Folder

> **IMPORTANT TIP**: Do **NOT** copy `node_modules` folders when transferring to another PC (they contain tens of thousands of files and take a very long time to copy).
> 
> When zipping or copying `hospital-appointment-system`:
> - Ensure `server/.env` is included in your copy.
> - If `node_modules` is present, delete `server/node_modules` and `client/node_modules` before copying/zipping.

---

## 3. Setup Instructions on the New PC

### Step 1: Verify the Environment File
Ensure `server/.env` exists and contains:
```env
PORT=5000
MONGO_URI=mongodb+srv://jvlearninghere_db_user:5l3xobOW7xEa7HAC@cluster0.9red4ev.mongodb.net/hospital_management?appName=Cluster0
JWT_SECRET=supersecretjwtkey_hams_2026_secure
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@hospital.com
ADMIN_PASSWORD=Admin@12345
CLIENT_URL=http://localhost:5173
```

> **MongoDB Atlas Network IP Whitelist Notice**:
> If the new PC is on a different Wi-Fi/network, ensure MongoDB Atlas permits the connection:
> 1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
> 2. Go to **Network Access** under Security.
> 3. Click **Add IP Address** -> Select **Allow Access From Anywhere (`0.0.0.0/0`)** or add the current public IP.

---

### Step 2: Install Dependencies

Open a terminal (PowerShell, Command Prompt, or VS Code terminal):

#### A. Install Backend Dependencies
```bash
cd hospital-appointment-system/server
npm install
```

#### B. Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

### Step 3: Run the Application

You need two terminal windows open:

#### Terminal 1 — Start Backend Server:
```bash
cd hospital-appointment-system/server
npm start
```
*(You will see: `[Server] Hospital Appointment System running on port 5000` & `[MongoDB] Connected successfully`)*

#### Terminal 2 — Start Frontend Application:
```bash
cd hospital-appointment-system/client
npm run dev
```
*(You will see: `Local: http://localhost:5173/`)*

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 4. Default Seeded Accounts

The database already includes pre-seeded accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@hospital.com` | `Admin@12345` |
| **Doctor (Cardiology)** | `sarah.mitchell@hospital.com` | `Doctor@12345` |
| **Doctor (Neurology)** | `james.wilson@hospital.com` | `Doctor@12345` |
| **Doctor (Pediatrics)** | `emily.chen@hospital.com` | `Doctor@12345` |
| **Doctor (Orthopedics)** | `michael.brown@hospital.com` | `Doctor@12345` |
| **Doctor (Dermatology)** | `priya.patel@hospital.com` | `Doctor@12345` |
| **Patient** | `john.doe@example.com` | `Password@123` |

*(You can also register a new patient account directly via the UI at `/register`)*

### Optional: Re-seed Database
To reset the database to initial seed data, run:
```bash
cd server
npm run seed
```

---

## 5. Troubleshooting Common Issues

### Windows PowerShell Execution Policy Error
If running `npm` produces a script execution restriction error:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Or run commands using `npm.cmd` (e.g., `npm.cmd run dev`).

### Port Already in Use
- Port 5000: Used by the backend. Ensure no other application is listening on port 5000.
- Port 5173: Used by Vite frontend.

---

## 6. Accessing via External Link on Any Browser / Phone

1. **Local Wi-Fi Network Access**:
   Any device (smartphone, tablet, laptop) connected to the same Wi-Fi can open:
   ```
   http://<YOUR_LAN_IP>:5000
   ```
   *(Find your IP by running `ipconfig` in Command Prompt).*

2. **Worldwide Public HTTPS Link (Cloudflare Tunnel)**:
   - Double-click **`start-tunnel.bat`** (or run `npx.cmd --yes cloudflared tunnel --url http://localhost:5000`).
   - Copy the generated `https://xxxx.trycloudflare.com` URL.
   - Open that URL in any browser on any PC, iPhone, or Android device anywhere in the world.


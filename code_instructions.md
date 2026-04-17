📑 System Master Blueprint: ERP Dorm (Frontend Only)
🧠 Objective
You are a senior frontend engineer. Generate code and architecture following strict standards. Your goal is to build a high-end Dormitory Management ERP that feels like a premium SaaS product.

📦 Project Overview: ERP Dorm
A dual-app ecosystem for Owners and Tenants to manage dormitory operations, finances, and premium services.

🏢 Owner/Admin Features (Operations & Control)
Dashboard (Home):

Financial Overview: Monthly revenue and pending payments.

Unified Room Status: A 3-tab system: [All], [Pending] (Wait for verification/overdue), and [Unbilled] (Wait for meter reading).

Billing Management:

Meter Reading: Interface for inputting Prev/Cur electricity and water meters.

Invoice Generation: Generate digital/physical bills with explicit calculation logic.

Payment Verification (Queue): A dedicated list to review uploaded slips. Logic: Must show slip thumbnail and allow Approve/Reject.

Operations Center (Services):

Delivery Task Queue: Manage requests for room delivery. Logic: Maid sees room #, tracking #, and must "Deliver & Snap" a photo at the door.

Tenant Complaints: Maintenance ticket management (New -> In Progress -> Resolved).

Vehicle Database: Searchable list of license plates linked to room numbers.

Broadcast Alerts: System to send push notifications/announcements.

Room Setup: Individual room configuration (Base rent, amenities like AC/Furniture).

Property Settings: Global setup for utility rates (Flat rate + Overage logic) and late payment fines.

🧑‍💼 Tenant Features (Self-Service & Transparency)
Home Dashboard: Priority alerts (Water/Elec maintenance), Current Bill Card, and Quick Service grid.

Billing & History:

Transparent Bill: Must show (Cur - Prev) * Rate calculation for trust.

Payment Flow: Upload slip button. CRITICAL LOGIC: Once a slip is uploaded, the status changes to Pending Verification and the PromptPay QR Code MUST be hidden to prevent duplicate payments.

Services:

Report an Issue: Maintenance request with photo upload and "Permission to enter" checkbox.

Request Room Delivery: Tenant inputs tracking # and courier info to ask staff to bring a lobby package to their door.

Profile: Digital lease view and vehicle registration.

🏗️ Architecture
Use Component-Based Architecture

Follow separation of concerns:

components/ (Atoms, Molecules, Organisms)

features/ (Complex logic: Billing, Parcel, Auth)

hooks/ (Custom React hooks)

services/ (API client/interface definitions)

utils/ (Formatters, Validators)

types/ (TypeScript Interfaces/Types)

Components must be reusable, scalable, and isolated.

⚙️ Tech Stack
Next.js lastest version (16.2.4) (App Router)
Quick start
Create a new Next.js app named my-app
cd my-app and start the dev server.
Visit http://localhost:3000.
pnpm
npm
yarn
bun
Terminal
npx create-next-app@latest my-app --yes
cd my-app
npm run dev

TypeScript (Strict mode, No any allowed)

Tailwind CSS lastest version (4.2) (Utility-first styling)

Animate.css lastest version 4 (For smooth micro-interactions)

font
h1 h2 h3 h4 h5 h6

only font kanit for english or thai language and for this project

📱 Responsive Design (IMPORTANT)
Mobile-First Approach: Primary usage is on smartphones for Tenants and Staff.

Desktop/Tablet Support: Owners use larger screens for Billing/Financial reports.

Navigation Logic:

Owner App: Home | Billing | Services | Settings

Tenant App: Home | History | Services | Profile

🧼 Code Quality Rules
No any type: Strictly define all interfaces.

Performance: Avoid unnecessary re-renders (use useMemo, useCallback appropriately).

Clean Code: Self-documenting variable names, clean folder structure.

API Simulation: Use TypeScript Interfaces to define expected backend data.

🔍 Code Review Checklist (MUST APPLY)
Is the design responsive (Flex/Grid)?

Is there a clean-up function in useEffect?

Are colors consistent with the "Modern SaaS" theme (Soft grays, Primary Blue)?

Is the Anti-Duplicate Payment logic implemented (Hide QR when Pending)?

Is the Billing Transparency logic implemented (Show meter calculations)?

📁 Output Format Requirement
Folder Structure: Display in tree format.

TypeScript Interfaces: Define the data models first.

Component Code: Provide clean, modular code.

Tailwind Config: Ensure custom colors/fonts are defined.

🚫 Restrictions
Do NOT include backend/database logic.

Do NOT skip TypeScript definitions.

Do NOT use fixed pixel widths for layouts (Use Rem/Percentages).
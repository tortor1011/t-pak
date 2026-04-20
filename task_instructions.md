## 🚨 Scope Limitation (IMPORTANT)

For this task:
- ONLY implement **OWNER / ADMIN APP**
- DO NOT generate Tenant or Staff features yet
- Ignore all Tenant and Staff flows even if mentioned above

Focus only on:
- Dashboard
- Room Management
- Billing & Financial System
- Complaint Management
- Tenant Lifecycle (Move-in / Move-out)

---

## 🧠 Execution Strategy

- Start from **Dashboard (Main Entry)**
- Then implement flows in this order:
  1. Dashboard
  2. Room Management (Filtering: All / Pending / Unbilled)
  3. Billing Lifecycle (Meter → Generate → Verify → Debt)
  4. Complaint Management
  5. Financial Reporting

---

## 📦 Expected Output (STRICT)

1. Folder Structure (Scalable ERP-level)
2. Key Pages (Owner only)
3. Core Components
4. Example Code (TypeScript + Next.js + Tailwind)
5. State Management Design (VERY IMPORTANT)

---

## 🔁 State Management Rule (CRITICAL)

Billing Status must drive the entire UI:

- Unpaid → Show QR / Payment needed
- Pending → Hide QR / Show Verification Queue
- Paid → Move to history + generate receipt

All UI must react based on this state.
# Dormitory ERP System: Complete User Flow & Screen Specifications

This document provides a deep-dive architecture of the **Estate Clarity** Dormitory ERP System, designed for **Building Owners/Admins**, **Tenants**, and **Operations Staff**.

---

## 🏗️ USER PERSONA 1: OWNER / ADMIN APP
*The "Command Center" for property management, focused on financial oversight and operational efficiency.*

### Flow A: Daily Monitoring & Management
1.  **Dashboard (Main):**
    *   **Purpose:** High-level oversight of revenue and room status.
    *   **Key Features:** Monthly revenue card, quick-access "Management Console" (Read Meters, Print Bills, Complaints), and a searchable room list with status filters (All, Pending, Unbilled).
    *   **Reference:** {{DATA:SCREEN:SCREEN_175}}
2.  **Room Status Filtering:**
    *   **Purpose:** Drill down into specific operational needs.
    *   **States:**
        *   **Pending:** Focused on rooms requiring payment verification or reminders. {{DATA:SCREEN:SCREEN_138}}
        *   **Unbilled:** Focused on rooms that need meter readings to generate this month's bill. {{DATA:SCREEN:SCREEN_154}}

### Flow B: Financials & Billing Lifecycle
1.  **Meter Reading (OCR):**
    *   **Purpose:** Record utility usage using mobile camera.
    *   **Key Features:** OCR viewfinder, manual override fields, historical reading reference, and "Save & Next" flow.
    *   **Reference:** {{DATA:SCREEN:SCREEN_93}}
2.  **Generate Bills:**
    *   **Purpose:** Bulk creation of invoices for unbilled rooms.
    *   **Key Features:** "Select All" logic, estimated revenue summary, and one-tap generation/notification.
    *   **Reference:** {{DATA:SCREEN:SCREEN_183}}
3.  **Slip Verification (AI-Powered):**
    *   **Purpose:** Approve digital payments uploaded by tenants.
    *   **Key Features:** Thunder API auto-detection (Amount/Date matching), slip thumbnail preview, and "Approve & Mark Paid" action.
    *   **Reference:** {{DATA:SCREEN:SCREEN_127}}
4.  **Debt Collection:**
    *   **Purpose:** Monitor and act on outstanding arrears.
    *   **Key Features:** Total outstanding summary, prioritized overdue list, and individual/bulk reminder buttons (LINE/App Push).
    *   **Reference:** {{DATA:SCREEN:SCREEN_121}}
5.  **Financial Reporting:**
    *   **Purpose:** Long-term profit/loss analysis.
    *   **Key Features:** Revenue vs. Expense cards, monthly trend bar charts, and data export (Excel/PDF).
    *   **Reference:** {{DATA:SCREEN:SCREEN_156}}

### Flow C: Operational Services
1.  **Complaint Management:**
    *   **Purpose:** Handle maintenance requests.
    *   **Key Features:** Tabbed view (Open/Resolved), priority badges (NEW/IN PROGRESS), and photo evidence thumbnails.
    *   **Reference:** {{DATA:SCREEN:SCREEN_134}}
2.  **Parcel Registration (Smart Match):**
    *   **Purpose:** Log incoming packages.
    *   **Key Features:** Scanner to identify room/name, "Smart Match" alert if tenant pre-notified, and instant tenant notification.
    *   **Reference:** {{DATA:SCREEN:SCREEN_109}}
3.  **Parking Management:**
    *   **Purpose:** Track resident vehicles.
    *   **Key Features:** Capacity tracking, searchable plate directory, and verification status (Verified/Unregistered).
    *   **Reference:** {{DATA:SCREEN:SCREEN_137}}

### Flow D: Tenant Lifecycle
1.  **Move-in Onboarding:**
    *   **Purpose:** Create new tenant profile and lease.
    *   **Key Features:** ID card upload, contract duration settings, and initial meter reading capture.
    *   **Reference:** {{DATA:SCREEN:SCREEN_125}}
2.  **Move-out & Refund:**
    *   **Purpose:** Close lease and settle deposit.
    *   **Key Features:** Final utility calculation, manual damage deductions, and transparent net refund summary.
    *   **Reference:** {{DATA:SCREEN:SCREEN_102}}

---

## 👤 USER PERSONA 2: TENANT APP
*A self-service portal focused on transparency and convenience.*

### Flow A: Dashboard & Payments
1.  **Home Dashboard:**
    *   **Purpose:** Central hub for announcements and active billing.
    *   **Key Features:** Priority building alerts (top banner), active bill card (฿ amount, Due date), and quick service grid.
    *   **Reference:** {{DATA:SCREEN:SCREEN_176}}
2.  **Billing States:**
    *   **Unpaid:** Shows PromptPay QR code for scanning.
    *   **Pending Verification:** **CRITICAL:** QR code is hidden; shows "Processing" status and blurred slip to prevent duplicate payment. {{DATA:SCREEN:SCREEN_61}}
3.  **Bill Transparency:**
    *   **Purpose:** View detailed invoice breakdown.
    *   **Key Features:** Prev vs. Cur meter reading details, calculation logic (Units @ Rate), and PDF download.
    *   **Reference:** {{DATA:SCREEN:SCREEN_119}}
4.  **Payment History:**
    *   **Purpose:** Archive of past transactions.
    *   **Key Features:** Status badges, total paid summary, and instant receipt viewing.
    *   **Reference:** {{DATA:SCREEN:SCREEN_91}}

### Flow B: Service Requests
1.  **Maintenance Reporting:**
    *   **Purpose:** Notify owner of issues.
    *   **Key Features:** Category dropdown, photo upload, and "Permission to Enter" toggle.
    *   **Reference:** {{DATA:SCREEN:SCREEN_160}}
2.  **Parcel Pickup:**
    *   **Purpose:** Track arrived packages.
    *   **Key Features:** Photo confirmation of package at counter, removal of QR-code claim for high-efficiency room-based pickup.
    *   **Reference:** {{DATA:SCREEN:SCREEN_170}}
3.  **Expected Package Notification:**
    *   **Purpose:** Pre-alert owner of incoming orders.
    *   **Key Features:** Shopee/Lazada order screenshot upload and courier details.
    *   **Reference:** {{DATA:SCREEN:SCREEN_117}}

### Flow C: Profile & Lease
1.  **Account Settings:**
    *   **Purpose:** Manage personal data.
    *   **Key Features:** Verified contact info, editable vehicle plate number, and digital lease agreement access.
    *   **Reference:** {{DATA:SCREEN:SCREEN_59}}

---

## 📦 USER PERSONA 3: STAFF / MAID APP
*Simplified task-based interface for building workers.*

1.  **Package Delivery Proof:**
    *   **Purpose:** Accountable in-building delivery.
    *   **Key Features:** Target room number, large photo capture area, and safety confirmation checkbox to unlock completion.
    *   **Reference:** {{DATA:SCREEN:SCREEN_146}}

---

## 🎨 DESIGN SYSTEM: ESTATE CLARITY
*   **Typography:** Public Sans (High legibility, especially for elderly users).
*   **Colors:** Primary Blue (#2563EB) for actions, Success Green for "Paid/Verified", Warning Red/Orange for "Overdue/Unbilled".
*   **Components:** Rounded-XL cards, subtle shadows, and high-contrast input fields.
*   **Logic:** Strict "No-Duplicate" payment flow and "Smart Match" logistics.

additional content
State Management Mapping:

ควรระบุว่าสถานะบิล (Status) คือตัวคุม UI ทั้งระบบ เช่น:

Unbilled -> แสดงในหน้า Unbilled (Owner) / ไม่แสดงบิล (Tenant)

Unpaid -> แสดง QR Code (Tenant) / แสดงในหน้า Overdue (Owner)

Pending -> [CRITICAL] ซ่อน QR Code (Tenant) / แสดงใน Verification Queue (Owner)

Paid -> ย้ายไป History (Both) / ออกใบเสร็จ PDF

The "Staff-Maid" Connection:

ระบุลอจิกการส่งต่องาน (Hand-off): เมื่อ Tenant กด Request Room Delivery -> งานต้องไปเด้งที่หน้า Package Delivery Proof ของ Staff ทันที (Real-time Task Injection)

Global UI Consistency (The "SaaS Feel"):

ระบุว่าทุกหน้าต้องใช้ Standard Spacing (8px grid) และ Soft Shadows เพื่อให้งานออกมาดูพรีเมียม ไม่ดูเป็นแอปที่เขียนขึ้นมาแบบลวกๆ
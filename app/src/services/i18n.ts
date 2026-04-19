export type Language = 'th' | 'en';

export type TranslationParams = Record<string, string | number>;

export const DEFAULT_LANGUAGE: Language = 'th';
export const LANGUAGE_STORAGE_KEY = 'estate_clarity.language.v1';
export const LANGUAGE_UPDATED_EVENT = 'estate_clarity.language_updated';

const SUPPORTED_LANGUAGES: ReadonlySet<Language> = new Set(['th', 'en']);

export const TRANSLATIONS_TH = {
  'common.appTitle': 'ผู้จัดการหอพัก',
  'common.logout': 'ออกจากระบบ',
  'common.all': 'ทั้งหมด',
  'common.pending': 'รอตรวจ',
  'common.rooms': 'ห้อง',
  'common.room': 'ห้อง',
  'common.vacant': 'ห้องว่าง',
  'common.occupied': 'มีผู้พักอาศัย',
  'common.noneFound': 'ไม่พบข้อมูล',
  'common.april2026': 'เมษายน 2026',

  'nav.home': 'หน้าแรก',
  'nav.billing': 'บิล',
  'nav.services': 'บริการ',
  'nav.settings': 'ตั้งค่า',

  'sidebar.brandName': 'Estate Clarity',
  'sidebar.brandTagline': 'ระบบจัดการหอพัก',
  'sidebar.profileName': 'ผู้ดูแลระบบ',
  'sidebar.profileGroup': 'กลุ่มทรัพย์สิน A',

  'drawer.profileName': 'ผู้ดูแลระบบ',
  'drawer.profileRole': 'หัวหน้าฝ่ายดูแล',
  'drawer.profileGroup': 'กลุ่มทรัพย์สิน A',

  'status.paid': 'ชำระแล้ว',
  'status.pending': 'รอตรวจสอบ',
  'status.unpaid': 'ค้างชำระ',

  'search.roomPlaceholder': 'ค้นหาห้อง...',
  'roomCard.vacant': 'ห้องว่าง',

  'dashboard.monthlyRevenue': 'รายได้รวมรายเดือน',
  'dashboard.pendingPayments': 'ยอดค้างชำระ',
  'dashboard.ofRooms': 'จาก {{total}} ห้อง',
  'dashboard.availableNow': 'พร้อมให้เช่าขณะนี้',
  'dashboard.occupancyRate': 'อัตราการเข้าพัก',
  'dashboard.managementConsole': 'ศูนย์ควบคุมงาน',
  'dashboard.readMeters': 'จดมิเตอร์',
  'dashboard.printBills': 'พิมพ์บิล',
  'dashboard.complaints': 'คำร้องซ่อม',
  'dashboard.roomStatus': 'สถานะห้อง',
  'dashboard.verifySlip': 'ตรวจสลิป',
  'dashboard.remind': 'เตือนชำระ',
  'dashboard.noRoomsFound': 'ไม่พบห้องที่ตรงเงื่อนไข',

  'billing.monthlyRevenue': 'รายได้รายเดือน',
  'billing.collected': 'เก็บแล้ว',
  'billing.pending': 'รอเก็บ',
  'billing.lifecycle': 'วงจรการจัดการบิล',
  'billing.readMetersTitle': 'จดมิเตอร์',
  'billing.readMetersDescription': 'บันทึกการใช้ไฟฟ้าและน้ำประปา',
  'billing.generateBillsTitle': 'สร้างบิล',
  'billing.generateBillsDescription': 'ออกใบแจ้งหนี้สำหรับห้องที่ยังไม่ออกบิล',
  'billing.verifySlipsTitle': 'ตรวจสลิป',
  'billing.verifySlipsWaiting': 'มี {{count}} สลิปรอการตรวจ',
  'billing.verifySlipsEmpty': 'ไม่มีสลิปรอตรวจ',
  'billing.debtCollectionTitle': 'ติดตามหนี้ค้าง',
  'billing.debtCollectionWaiting': 'มี {{count}} ห้องที่ค้างชำระ',
  'billing.debtCollectionEmpty': 'ไม่มีห้องค้างชำระ',

  'page.generateBillsTitle': 'สร้างบิล',
  'generate.totalPending': 'รายการรอดำเนินการ',
  'generate.estimatedRevenue': 'รายได้โดยประมาณ',
  'generate.includesAdditionalCharges': 'รวมค่าบริการเสริม {{amount}} จากกฎที่เปิดใช้งาน {{count}} รายการ',
  'generate.generateInProgress': 'กำลังสร้างใบแจ้งหนี้...',
  'generate.generateAndSend': 'สร้างและส่งใบแจ้งหนี้ทั้งหมด',
  'generate.autoNotifyHint': 'คำนวณค่าสาธารณูปโภคอัตโนมัติ และแจ้งผู้เช่าผ่าน SMS และอีเมล',
  'generate.selectRooms': 'เลือกห้อง',
  'generate.selectAll': 'เลือกทั้งหมด ({{count}})',
  'generate.deselectAll': 'ยกเลิกเลือกทั้งหมด',
  'generate.meterDate': 'มิเตอร์: 1 เม.ย.',
  'generate.basePlusExtra': 'ฐาน {{base}} + เพิ่ม {{extra}}',
  'generate.generatedFeedbackWithExtra': 'สร้างใบแจ้งหนี้ {{count}} รายการ รวม {{total}} (รวมค่าบริการเสริม {{extra}})',
  'generate.generatedFeedback': 'สร้างใบแจ้งหนี้ {{count}} รายการ รวม {{total}}',
  'generate.deliveryMode': 'วิธีส่งบิล',
  'generate.tabOnlineDelivery': 'ส่งบิลออนไลน์',
  'generate.tabPrintPdf': 'พิมพ์บิล PDF',
  'generate.onlineModeHint': 'ระบบจะแจ้งเตือนไปที่แอปลูกหอและ LINE OA ตามช่องทางที่คุณเปิดไว้',
  'generate.physicalModeHint': 'ระบบจะรวมบิลทั้งหมดในหน้าเดียว เพื่อพิมพ์หรือบันทึกเป็น PDF ไปส่งหน้าห้อง',
  'generate.selectChannel': 'เลือกช่องทางแจ้งเตือน',
  'generate.channelSelectionHint': 'เปิดหรือปิดแต่ละช่องทางก่อนกดส่ง',
  'generate.channelApp': 'แอปลูกหอ',
  'generate.channelLine': 'LINE OA',
  'generate.selectAtLeastOneChannel': 'กรุณาเลือกอย่างน้อย 1 ช่องทางก่อนส่งบิลออนไลน์',
  'generate.sendingOnline': 'กำลังส่งบิลออนไลน์...',
  'generate.preparingPdf': 'กำลังเตรียมไฟล์สำหรับพิมพ์...',
  'generate.sendOnlineCta': 'สร้างและส่งบิลออนไลน์',
  'generate.printPdfCta': 'สร้างและพิมพ์บิล PDF',
  'generate.onlineSentFeedback': 'เข้าคิวแจ้งเตือน {{queued}} รายการ สำหรับ {{count}} ห้องแล้ว',
  'generate.pdfReadyFeedback': 'เตรียมเอกสารบิลรวม {{count}} ห้อง (รวม {{total}}) พร้อมพิมพ์แล้ว',
  'generate.noOnlineEligibleRooms': 'ยังไม่มีห้องที่เชื่อมต่อระบบหอสำหรับการส่งบิลออนไลน์',
  'generate.noPhysicalEligibleRooms': 'ยังไม่มีห้องที่ต้องพิมพ์บิลกระดาษ',
  'generate.connectionOnline': 'เชื่อมต่อระบบหอ',
  'generate.connectionPhysical': 'บิลกระดาษ',
  'generate.onlineNotificationTitle': 'บิลห้อง {{room}} พร้อมชำระ',
  'generate.onlineNotificationBody': 'บิลห้อง {{room}} ยอด {{total}} ถูกสร้างแล้ว',
  'generate.popupBlocked': 'ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาต Pop-up ก่อน',
  'generate.printDocumentTitle': 'ใบแจ้งหนี้แบบพิมพ์รวม',
  'generate.printDocumentSubtitle': 'สำหรับลูกหอที่ไม่ได้เชื่อมต่อแอปหอ',
  'generate.printGeneratedAt': 'เวลาที่สร้าง',
  'generate.printDueDate': 'ครบกำหนดชำระ',

  'page.verifyPaymentsTitle': 'ตรวจสอบการชำระเงิน',
  'verify.queueTitle': 'คิวตรวจสอบสลิป',
  'verify.pendingCount': 'รอ {{count}} รายการ',
  'verify.approvedFeedback': 'ห้อง {{room}} อนุมัติแล้วและอัปเดตเป็นชำระแล้ว',
  'verify.rejectedFeedback': 'ห้อง {{room}} ถูกปฏิเสธและย้ายกลับไปสถานะค้างชำระ',
  'verify.match': 'ตรงยอด',
  'verify.aiDetected': 'AI ตรวจพบ: {{amount}}',
  'verify.paymentSlip': 'สลิปการชำระเงิน',
  'verify.approving': 'กำลังอนุมัติ...',
  'verify.approve': 'อนุมัติ',
  'verify.rejecting': 'กำลังปฏิเสธ...',
  'verify.reject': 'ปฏิเสธ',
  'verify.allClearTitle': 'เรียบร้อยทั้งหมด',
  'verify.allClearDescription': 'ไม่มีสลิปรอการตรวจสอบ',

  'page.debtCollectionTitle': 'ติดตามหนี้ค้าง',
  'debt.totalOutstanding': 'ยอดค้างรวม',
  'debt.sendBulkReminder': 'ส่งเตือนแบบกลุ่ม',
  'debt.sendingReminders': 'กำลังส่งการแจ้งเตือน...',
  'debt.bulkReminderFeedback': 'ส่งแจ้งเตือนแบบกลุ่มให้ {{count}} ห้องแล้ว',
  'debt.singleReminderFeedback': 'ส่งแจ้งเตือนไปยังห้อง {{room}} แล้ว',
  'debt.noPhoneAvailable': 'ไม่มีเบอร์โทรสำหรับห้องนี้',
  'debt.markedSettledFeedback': 'ห้อง {{room}} ถูกอัปเดตเป็นชำระครบแล้ว',
  'debt.overdueRooms': 'ห้องค้างชำระ',
  'debt.noActiveDebts': 'ไม่มีหนี้ค้างที่ต้องติดตาม',
  'debt.noActiveDebtsDescription': 'ยอดค้างทั้งหมดถูกชำระเรียบร้อยแล้ว',
  'debt.monthOverdue': 'ค้าง {{count}} เดือน',
  'debt.monthsOverdue': 'ค้าง {{count}} เดือน',
  'debt.lastReminder': 'แจ้งเตือนล่าสุด: {{time}}',
  'debt.noReminderSent': 'ยังไม่เคยส่งแจ้งเตือน',
  'debt.reminderSentCount': 'ส่งแจ้งเตือนแล้ว {{count}} ครั้ง',
  'debt.sending': 'กำลังส่ง...',
  'debt.sendReminder': 'ส่งแจ้งเตือน',
  'debt.callTenant': 'โทรหาผู้เช่า',
  'debt.noPhone': 'ไม่มีเบอร์',
  'debt.settling': 'กำลังปิดยอด...',
  'debt.markSettled': 'ทำเครื่องหมายว่าปิดยอดแล้ว',

  'page.meterReadingTitle': 'จดค่าน้ำ-ค่าไฟ',
  'meter.invalidValue': 'ห้อง {{room}} มีค่ามิเตอร์ไม่ถูกต้อง',
  'meter.electricityMustIncrease': 'ห้อง {{room}} ต้องกรอกค่าไฟมากกว่าหรือเท่าค่าเดิม',
  'meter.waterMustIncrease': 'ห้อง {{room}} ต้องกรอกค่าน้ำมากกว่าหรือเท่าค่าเดิม',
  'meter.completeAllReadings': 'กรอกมิเตอร์ให้ครบก่อนบันทึก ยังขาด {{count}} ห้อง',
  'meter.savedFeedback': 'บันทึกข้อมูลมิเตอร์ครบ {{count}} ห้องแล้ว',
  'meter.roomColumn': 'ห้อง',
  'meter.prevElectric': 'ค่าไฟเดือนก่อน',
  'meter.currentElectric': 'ค่าไฟเดือนนี้',
  'meter.prevWater': 'ค่าน้ำเดือนก่อน',
  'meter.currentWater': 'ค่าน้ำเดือนนี้',
  'meter.saving': 'กำลังบันทึก...',
  'meter.save': 'บันทึกข้อมูล',

  'page.moveInTitle': 'เลือกห้องสำหรับย้ายเข้า',
  'page.moveOutTitle': 'เลือกห้องสำหรับย้ายออก',

  'roomDetail.notFound': 'ไม่พบห้องนี้',
  'roomDetail.title': 'รายละเอียดห้อง {{room}}',
  'roomDetail.vacantRoom': 'ห้องว่าง',
  'roomDetail.call': 'โทร',
  'roomDetail.chat': 'แชต',
  'roomDetail.moveInDate': 'วันที่ย้ายเข้า',
  'roomDetail.moveInDateValue': '1 ต.ค. 2025',
  'roomDetail.contractExpires': 'สัญญาสิ้นสุด',
  'roomDetail.contractExpiresValue': '30 ก.ย. 2026',
  'roomDetail.lastRecordedMeter': 'มิเตอร์ล่าสุด (มีนาคม 2026)',
  'roomDetail.electricity': 'ไฟฟ้า',
  'roomDetail.water': 'น้ำ',
  'roomDetail.baseRoomRate': 'ค่าเช่าห้องพื้นฐาน',
  'roomDetail.additionalChargeAssignment': 'การตั้งค่าค่าบริการเพิ่มเติม',
  'roomDetail.globalRules': 'กฎส่วนกลาง',
  'roomDetail.roomOverride': 'ตั้งค่าเฉพาะห้อง',
  'roomDetail.appliedThisMonth': 'ยอดที่ใช้เดือนนี้',
  'roomDetail.calculatedFromEffectiveRules': 'คำนวณจากกฎค่าบริการที่มีผลใช้งาน',
  'roomDetail.vacantNoAdditionalCharges': 'ห้องว่างจะไม่คิดค่าบริการเพิ่มเติม',
  'roomDetail.noActiveRulesApply': 'ขณะนี้ไม่มีกฎค่าบริการที่ใช้งานอยู่สำหรับห้องนี้',
  'roomDetail.perMonth': '{{amount}} ต่อเดือน',
  'roomDetail.ignoredOverrideRuleIds': 'รหัสกฎที่ถูกข้าม',
  'roomDetail.followsGlobalRules': 'ห้องนี้ใช้กฎค่าบริการเพิ่มเติมส่วนกลางทั้งหมดจากการตั้งค่าอาคาร',
  'roomDetail.usesCustomSelection': 'ห้องนี้ใช้ชุดกฎค่าบริการเพิ่มเติมแบบกำหนดเองจากการตั้งค่าห้องแบบกลุ่ม',
  'roomDetail.billingHistory': 'ประวัติบิล',
  'roomDetail.viewAll': 'ดูทั้งหมด',
  'roomDetail.noBillingHistory': 'ยังไม่มีประวัติบิลสำหรับห้องนี้',
  'roomDetail.sendManualReminder': 'ส่งเตือนด้วยตนเอง',
  'roomDetail.terminateLease': 'ยุติสัญญาเช่า',
  'roomDetail.confirmLeaseTermination': 'ยืนยันการยุติสัญญาเช่า?',
  'roomDetail.finalRefundMessage': 'ระบบจะคำนวณยอดคืนสุดท้ายสำหรับห้อง {{room}}',
  'roomDetail.confirmTermination': 'ยืนยันการยุติสัญญา',
  'roomDetail.keepLease': 'คงสัญญาเดิม',
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS_TH;

type TranslationDictionary = Record<TranslationKey, string>;

export const TRANSLATIONS_EN: TranslationDictionary = {
  'common.appTitle': 'Dormitory Manager',
  'common.logout': 'Logout',
  'common.all': 'All',
  'common.pending': 'Pending',
  'common.rooms': 'Rooms',
  'common.room': 'Room',
  'common.vacant': 'Vacant',
  'common.occupied': 'Occupied',
  'common.noneFound': 'No data found',
  'common.april2026': 'April 2026',

  'nav.home': 'Home',
  'nav.billing': 'Billing',
  'nav.services': 'Services',
  'nav.settings': 'Settings',

  'sidebar.brandName': 'Estate Clarity',
  'sidebar.brandTagline': 'Dormitory ERP',
  'sidebar.profileName': 'Admin Manager',
  'sidebar.profileGroup': 'Property Group A',

  'drawer.profileName': 'Admin Manager',
  'drawer.profileRole': 'Senior Overseer',
  'drawer.profileGroup': 'Property Group A',

  'status.paid': 'PAID',
  'status.pending': 'PENDING',
  'status.unpaid': 'UNPAID',

  'search.roomPlaceholder': 'Search room...',
  'roomCard.vacant': 'Vacant',

  'dashboard.monthlyRevenue': 'Total Monthly Revenue',
  'dashboard.pendingPayments': 'Pending Payments',
  'dashboard.ofRooms': 'of {{total}} rooms',
  'dashboard.availableNow': 'available now',
  'dashboard.occupancyRate': 'Occupancy Rate',
  'dashboard.managementConsole': 'Management Console',
  'dashboard.readMeters': 'Read Meters',
  'dashboard.printBills': 'Print Bills',
  'dashboard.complaints': 'Complaints',
  'dashboard.roomStatus': 'Room Status',
  'dashboard.verifySlip': 'Verify Slip',
  'dashboard.remind': 'Remind',
  'dashboard.noRoomsFound': 'No rooms found',

  'billing.monthlyRevenue': 'Monthly Revenue',
  'billing.collected': 'Collected',
  'billing.pending': 'Pending',
  'billing.lifecycle': 'Billing Lifecycle',
  'billing.readMetersTitle': 'Read Meters',
  'billing.readMetersDescription': 'Record electricity and water usage',
  'billing.generateBillsTitle': 'Generate Bills',
  'billing.generateBillsDescription': 'Create invoices for unbilled rooms',
  'billing.verifySlipsTitle': 'Verify Slips',
  'billing.verifySlipsWaiting': '{{count}} slips waiting for review',
  'billing.verifySlipsEmpty': 'No slips waiting for review',
  'billing.debtCollectionTitle': 'Debt Collection',
  'billing.debtCollectionWaiting': '{{count}} rooms with outstanding balance',
  'billing.debtCollectionEmpty': 'No rooms with outstanding balance',

  'page.generateBillsTitle': 'Generate Bills',
  'generate.totalPending': 'Total Pending',
  'generate.estimatedRevenue': 'Estimated Revenue',
  'generate.includesAdditionalCharges': 'Includes {{amount}} additional charges from {{count}} active rules',
  'generate.generateInProgress': 'Generating Invoices...',
  'generate.generateAndSend': 'Generate and Send All Invoices',
  'generate.autoNotifyHint': 'Automatically calculates utilities and notifies tenants via SMS and Email.',
  'generate.selectRooms': 'Select Rooms',
  'generate.selectAll': 'Select All ({{count}})',
  'generate.deselectAll': 'Deselect All',
  'generate.meterDate': 'Meter: Apr 01',
  'generate.basePlusExtra': 'Base {{base}} + Extra {{extra}}',
  'generate.generatedFeedbackWithExtra': 'Generated {{count}} invoice(s) totaling {{total}} (including {{extra}} additional charges)',
  'generate.generatedFeedback': 'Generated {{count}} invoice(s) totaling {{total}}',
  'generate.deliveryMode': 'Delivery Mode',
  'generate.tabOnlineDelivery': 'Online Delivery',
  'generate.tabPrintPdf': 'Print PDF',
  'generate.onlineModeHint': 'Bills are queued to tenant app and LINE OA based on enabled channels.',
  'generate.physicalModeHint': 'Bills are merged into one printable document for offline hand delivery.',
  'generate.selectChannel': 'Select Channels',
  'generate.channelSelectionHint': 'Toggle channels on or off before sending.',
  'generate.channelApp': 'Tenant App',
  'generate.channelLine': 'LINE OA',
  'generate.selectAtLeastOneChannel': 'Select at least one channel before sending online bills.',
  'generate.sendingOnline': 'Sending online bills...',
  'generate.preparingPdf': 'Preparing print-ready file...',
  'generate.sendOnlineCta': 'Generate and Send Online Bills',
  'generate.printPdfCta': 'Generate and Print PDF Bills',
  'generate.onlineSentFeedback': 'Queued {{queued}} notification(s) for {{count}} room(s).',
  'generate.pdfReadyFeedback': 'Prepared one merged bill set for {{count}} room(s) totaling {{total}}.',
  'generate.noOnlineEligibleRooms': 'No rooms are currently connected for online billing delivery.',
  'generate.noPhysicalEligibleRooms': 'No rooms currently require printed paper bills.',
  'generate.connectionOnline': 'Connected',
  'generate.connectionPhysical': 'Paper Bill',
  'generate.onlineNotificationTitle': 'Room {{room}} bill is ready',
  'generate.onlineNotificationBody': 'Room {{room}} bill totaling {{total}} has been generated.',
  'generate.popupBlocked': 'Unable to open print window. Please allow pop-ups and try again.',
  'generate.printDocumentTitle': 'Merged Printable Bills',
  'generate.printDocumentSubtitle': 'For tenants not connected to dorm application',
  'generate.printGeneratedAt': 'Generated At',
  'generate.printDueDate': 'Due Date',

  'page.verifyPaymentsTitle': 'Verify Payments',
  'verify.queueTitle': 'Verification Queue',
  'verify.pendingCount': '{{count}} pending',
  'verify.approvedFeedback': 'Room {{room}} was approved and marked as paid.',
  'verify.rejectedFeedback': 'Room {{room}} was rejected and moved back to unpaid.',
  'verify.match': 'MATCH',
  'verify.aiDetected': 'AI detected: {{amount}}',
  'verify.paymentSlip': 'Payment Slip',
  'verify.approving': 'Approving...',
  'verify.approve': 'Approve',
  'verify.rejecting': 'Rejecting...',
  'verify.reject': 'Reject',
  'verify.allClearTitle': 'All Clear!',
  'verify.allClearDescription': 'No slips waiting for verification',

  'page.debtCollectionTitle': 'Debt Collection',
  'debt.totalOutstanding': 'Total Outstanding',
  'debt.sendBulkReminder': 'Send Bulk Reminder',
  'debt.sendingReminders': 'Sending Reminders...',
  'debt.bulkReminderFeedback': 'Bulk reminder sent to {{count}} room(s).',
  'debt.singleReminderFeedback': 'Reminder sent to Room {{room}}.',
  'debt.noPhoneAvailable': 'No phone number is available for this room.',
  'debt.markedSettledFeedback': 'Room {{room}} marked as settled.',
  'debt.overdueRooms': 'Overdue Rooms',
  'debt.noActiveDebts': 'No Active Debts',
  'debt.noActiveDebtsDescription': 'All overdue balances are currently cleared.',
  'debt.monthOverdue': '{{count}} MONTH OVERDUE',
  'debt.monthsOverdue': '{{count}} MONTHS OVERDUE',
  'debt.lastReminder': 'Last reminder: {{time}}',
  'debt.noReminderSent': 'No reminder sent yet',
  'debt.reminderSentCount': '{{count}} reminder(s) sent',
  'debt.sending': 'Sending...',
  'debt.sendReminder': 'Send Reminder',
  'debt.callTenant': 'Call Tenant',
  'debt.noPhone': 'No Phone',
  'debt.settling': 'Settling...',
  'debt.markSettled': 'Mark as Settled',

  'page.meterReadingTitle': 'Meter Reading',
  'meter.invalidValue': 'Room {{room}} has an invalid meter value.',
  'meter.electricityMustIncrease': 'Room {{room}} electricity reading must be greater than or equal to the previous value.',
  'meter.waterMustIncrease': 'Room {{room}} water reading must be greater than or equal to the previous value.',
  'meter.completeAllReadings': 'Please complete all readings before saving. {{count}} room(s) still missing values.',
  'meter.savedFeedback': 'Saved meter readings for {{count}} room(s).',
  'meter.roomColumn': 'Room',
  'meter.prevElectric': 'Previous Electricity',
  'meter.currentElectric': 'Current Electricity',
  'meter.prevWater': 'Previous Water',
  'meter.currentWater': 'Current Water',
  'meter.saving': 'Saving...',
  'meter.save': 'Save Data',

  'page.moveInTitle': 'Select Room for Move-in',
  'page.moveOutTitle': 'Select Room for Move-out',

  'roomDetail.notFound': 'Room not found',
  'roomDetail.title': 'Room {{room}} Details',
  'roomDetail.vacantRoom': 'Vacant Room',
  'roomDetail.call': 'Call',
  'roomDetail.chat': 'Chat',
  'roomDetail.moveInDate': 'Move-in Date',
  'roomDetail.moveInDateValue': 'Oct 01, 2025',
  'roomDetail.contractExpires': 'Contract Expires',
  'roomDetail.contractExpiresValue': 'Sep 30, 2026',
  'roomDetail.lastRecordedMeter': 'LAST RECORDED METER (March 2026)',
  'roomDetail.electricity': 'Electricity',
  'roomDetail.water': 'Water',
  'roomDetail.baseRoomRate': 'Base Room Rate',
  'roomDetail.additionalChargeAssignment': 'Additional Charge Assignment',
  'roomDetail.globalRules': 'Global Rules',
  'roomDetail.roomOverride': 'Room Override',
  'roomDetail.appliedThisMonth': 'Applied This Month',
  'roomDetail.calculatedFromEffectiveRules': 'Calculated from effective charge rules',
  'roomDetail.vacantNoAdditionalCharges': 'Vacant room has no additional charges',
  'roomDetail.noActiveRulesApply': 'No active additional charge rules currently apply to this room.',
  'roomDetail.perMonth': '{{amount}} per month',
  'roomDetail.ignoredOverrideRuleIds': 'Ignored override rule ids',
  'roomDetail.followsGlobalRules': 'This room currently follows all active global additional charge rules from Property Settings.',
  'roomDetail.usesCustomSelection': 'This room currently uses a custom additional charge selection from Bulk Room Setup.',
  'roomDetail.billingHistory': 'Billing History',
  'roomDetail.viewAll': 'View All',
  'roomDetail.noBillingHistory': 'No billing history available for this room.',
  'roomDetail.sendManualReminder': 'Send Manual Reminder',
  'roomDetail.terminateLease': 'Terminate Lease',
  'roomDetail.confirmLeaseTermination': 'Confirm Lease Termination?',
  'roomDetail.finalRefundMessage': 'This will calculate the final refund amount for room {{room}}.',
  'roomDetail.confirmTermination': 'Confirm Termination',
  'roomDetail.keepLease': 'Keep Lease',
};

const TRANSLATION_DICTIONARIES: Record<Language, TranslationDictionary> = {
  th: TRANSLATIONS_TH,
  en: TRANSLATIONS_EN,
};

export function isLanguage(value: string | null | undefined): value is Language {
  if (!value) {
    return false;
  }

  return SUPPORTED_LANGUAGES.has(value as Language);
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function loadLanguagePreference(): Language {
  if (!isBrowser()) {
    return DEFAULT_LANGUAGE;
  }

  const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(raw) ? raw : DEFAULT_LANGUAGE;
}

export function saveLanguagePreference(language: Language): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(new Event(LANGUAGE_UPDATED_EVENT));
}

export function applyLanguageToDocument(language: Language): void {
  if (!isBrowser()) {
    return;
  }

  document.documentElement.lang = language;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, String(value));
  }, template);
}

export function translate(
  key: TranslationKey,
  language: Language,
  params?: TranslationParams
): string {
  const translation =
    TRANSLATION_DICTIONARIES[language][key] ??
    TRANSLATION_DICTIONARIES[DEFAULT_LANGUAGE][key] ??
    key;

  return interpolate(translation, params);
}

const dict = {
  en: {
    // App
    appName: "AMAL", appNameAr: "أمل", tagline: "Your Life, Optimized",
    // Navigation
    dashboard: "Home", expenses: "Expenses", invoices: "Invoices", 
    fleet: "Fleet", groceries: "Groceries", settings: "Settings",
    more: "More Services",
    // Actions
    add: "Add", save: "Save", cancel: "Cancel", delete: "Delete", 
    edit: "Edit", confirm: "Confirm", remove: "Remove", done: "Done",
    // Fields
    name: "Name", nameAr: "Name (Arabic)", amount: "Amount", 
    price: "Price", cost: "Cost", total: "Total",
    startDate: "Start Date", endDate: "End Date", days: "Days", 
    duration: "Duration", monthly: "Monthly",
    tag: "Category", status: "Status", group: "Group",
    search: "Search", filter: "Filter", sort: "Sort",
    list: "List", board: "Board", timeline: "Timeline", 
    grid: "Grid", today: "Today",
    // Expense
    uploadImage: "Upload Image", extractedText: "Extracted Text",
    parsedItems: "Parsed Items", addAsExpense: "Add as Expense",
    addAllItems: "Add All", noItems: "No items found",
    // Settings
    currency: "Currency", language: "Language", 
    arabic: "العربية", english: "English",
    export: "Export", import: "Import", reset: "Reset Data",
    manageTags: "Manage Categories", newTag: "New Category",
    tagName: "Category Name", tagNameAr: "Category Name (Arabic)",
    color: "Color", statuses: "Statuses", commaSeparated: "comma separated",
    addTag: "Add Category", addOption: "Add Option",
    optionNameEn: "Name (English)", optionNameAr: "Name (Arabic)",
    // Properties / Parents
    properties: "Properties", property: "Property",
    newProperty: "New Property", propertyName: "Property Name",
    propertyNumber: "Property Number", linkToParent: "Link to Property",
    expensesLinked: "Linked Expenses",
    // Status
    urgent: "Urgent", upcoming: "Upcoming", overview: "Overview",
    low: "Low", ok: "OK", good: "Good", worn: "Worn", 
    damaged: "Damaged", retired: "Retired",
    service: "Service", fuel: "Fuel", annual: "Annual", repair: "Repair",
    fixed: "Fixed", variable: "Variable", subscription: "Subscription",
    oneTime: "One-time", investment: "Investment", savings: "Savings",
    // AI
    aiEnhance: "AI Enhancement", useAI: "Use AI",
    aiSettings: "AI Settings", enableAI: "Enable AI",
    aiProvider: "Provider", customEndpoint: "Custom Endpoint",
    model: "Model", apiKey: "API Key", processingMode: "Processing Mode",
    textOnly: "Text only", imageOnly: "Image only", textAndImage: "Text + Image",
    systemPrompt: "System Prompt", authType: "Auth Type",
    bearer: "Bearer", custom: "Custom", saveAI: "Save AI Config",
    aiSaved: "AI configuration saved", aiDisabled: "AI is disabled",
    testAI: "Test AI", processing: "Processing...",
    // Invoice
    invoiceName: "Invoice Name", generatedName: "Auto-generated",
    linkToInvoice: "Link to Invoice", searchInvoice: "Search invoice...",
    noEndDate: "No end date", includeInTimeline: "Include in timeline",
    itemAdded: "Item added", itemRemoved: "Item removed",
    allItemsAdded: "All items added", groupForItems: "Group for items",
    changeGroup: "Change group", editItem: "Edit Item",
    itemGroup: "Item Group", invoiceImage: "Invoice Image",
    tapToView: "Tap to view",
    // Attachment
    attachment: "Attachment", attachInvoice: "Attach Document",
    attachmentName: "Attachment Name", attachmentNumber: "Attachment #",
    uploadAttachment: "Upload Attachment", attached: "Attached",
    // Empty states
    noExpenses: "No expenses yet", noParents: "No properties yet",
    noInvoices: "No invoices yet", noItems: "No items",
    // Misc
    items: "items", perMonth: "/mo", deleteConfirm: "Delete this?",
    version: "AMAL v4.0", back: "Back", all: "All",
    // Dashboard
    monthlySpend: "Monthly Spend", activeItems: "Active Items",
    upcomingEvents: "Upcoming", budgetHealth: "Budget Health",
    quickActions: "Quick Actions", recentActivity: "Recent Activity",
    seeAll: "See All", welcomeBack: "Welcome back",
    // Fleet
    fleetOverview: "Fleet Overview", addCar: "Add Car",
    carName: "Car Name", plateNumber: "Plate Number",
    vinNumber: "VIN", mileage: "Mileage",
    lastService: "Last Service", nextService: "Next Service",
    parts: "Parts", partNumber: "Part #", partName: "Part Name",
    installDate: "Installed", lifespan: "Lifespan (km)",
    legalDocs: "Legal Documents", docType: "Document Type",
    expiryDate: "Expiry Date", renew: "Renew",
    insurance: "Insurance", registration: "Registration",
    inspection: "Inspection", ownership: "Ownership",
    // Groceries
    groceryList: "Grocery List", addItem: "Add Item",
    quantity: "Qty", unit: "Unit", store: "Store",
    optimize: "Optimize", bestPrice: "Best Price",
    totalSavings: "Total Savings", shoppingRoute: "Shopping Route",
    comparePrices: "Compare Prices", suggestedStores: "Suggested Stores",
  },
  ar: {
    appName: "AMAL", appNameAr: "أمل", tagline: "حياتك، محسّنة",
    dashboard: "الرئيسية", expenses: "المصروفات", invoices: "الفواتير",
    fleet: "المركبات", groceries: "المشتريات", settings: "الإعدادات",
    more: "خدمات إضافية",
    add: "إضافة", save: "حفظ", cancel: "إلغاء", delete: "حذف",
    edit: "تعديل", confirm: "تأكيد", remove: "إزالة", done: "تم",
    name: "الاسم", nameAr: "الاسم (عربي)", amount: "المبلغ",
    price: "السعر", cost: "التكلفة", total: "الإجمالي",
    startDate: "تاريخ البدء", endDate: "تاريخ الانتهاء", days: "الأيام",
    duration: "المدة", monthly: "شهري",
    tag: "التصنيف", status: "الحالة", group: "المجموعة",
    search: "بحث", filter: "تصفية", sort: "ترتيب",
    list: "قائمة", board: "لوحة", timeline: "الخط الزمني",
    grid: "شبكة", today: "اليوم",
    uploadImage: "رفع صورة", extractedText: "النص المستخرج",
    parsedItems: "البنود المستخرجة", addAsExpense: "إضافة كمصروف",
    addAllItems: "إضافة الكل", noItems: "لا يوجد بنود",
    currency: "العملة", language: "اللغة",
    arabic: "العربية", english: "الإنجليزية",
    export: "تصدير", import: "استيراد", reset: "إعادة الضبط",
    manageTags: "إدارة التصنيفات", newTag: "تصنيف جديد",
    tagName: "اسم التصنيف", tagNameAr: "اسم التصنيف (عربي)",
    color: "اللون", statuses: "الحالات", commaSeparated: "مفصولة بفاصلة",
    addTag: "إضافة تصنيف", addOption: "إضافة خيار",
    optionNameEn: "الاسم (إنجليزي)", optionNameAr: "الاسم (عربي)",
    properties: "الممتلكات", property: "الممتلك",
    newProperty: "ممتلك جديد", propertyName: "اسم الممتلك",
    propertyNumber: "رقم الممتلك", linkToParent: "ربط بممتلك",
    expensesLinked: "المصروفات المرتبطة",
    urgent: "عاجل", upcoming: "قادم", overview: "نظرة عامة",
    low: "منخفض", ok: "جيد", good: "ممتاز", worn: "مستهلك",
    damaged: "تالف", retired: "متقاعد",
    service: "صيانة", fuel: "وقود", annual: "سنوي", repair: "إصلاح",
    fixed: "ثابت", variable: "متغير", subscription: "اشتراك",
    oneTime: "لمرة واحدة", investment: "استثمار", savings: "مدخرات",
    aiEnhance: "تحسين بالذكاء", useAI: "استخدام AI",
    aiSettings: "إعدادات الذكاء", enableAI: "تفعيل الذكاء",
    aiProvider: "المزود", customEndpoint: "نقطة النهاية",
    model: "النموذج", apiKey: "مفتاح API", processingMode: "طريقة المعالجة",
    textOnly: "نص فقط", imageOnly: "صورة فقط", textAndImage: "نص + صورة",
    systemPrompt: "تعليمات النظام", authType: "نوع المصادقة",
    bearer: "Bearer", custom: "مخصص", saveAI: "حفظ إعدادات AI",
    aiSaved: "تم الحفظ", aiDisabled: "الذكاء الاصطناعي معطل",
    testAI: "اختبار AI", processing: "جاري المعالجة...",
    invoiceName: "اسم الفاتورة", generatedName: "اسم تلقائي",
    linkToInvoice: "ربط بفاتورة", searchInvoice: "ابحث عن فاتورة...",
    noEndDate: "بدون تاريخ انتهاء", includeInTimeline: "تضمين في الخط الزمني",
    itemAdded: "تم الإضافة", itemRemoved: "تم الإزالة",
    allItemsAdded: "تم إضافة الكل", groupForItems: "المجموعة للبنود",
    changeGroup: "تغيير المجموعة", editItem: "تعديل البند",
    itemGroup: "مجموعة البند", invoiceImage: "صورة الفاتورة",
    tapToView: "اضغط للعرض",
    attachment: "مرفق", attachInvoice: "إرفاق مستند",
    attachmentName: "اسم المرفق", attachmentNumber: "رقم المرفق",
    uploadAttachment: "رفع مرفق", attached: "تم الإرفاق",
    noExpenses: "لا توجد مصروفات", noParents: "لا توجد ممتلكات",
    noInvoices: "لا توجد فواتير", noItems: "لا يوجد بنود",
    items: "بند", perMonth: "/شهر", deleteConfirm: "هل تريد الحذف؟",
    version: "أمل v4.0", back: "رجوع", all: "الكل",
    monthlySpend: "المصروف الشهري", activeItems: "العناصر النشطة",
    upcomingEvents: "القادمة", budgetHealth: "صحة الميزانية",
    quickActions: "إجراءات سريعة", recentActivity: "النشاط الأخير",
    seeAll: "عرض الكل", welcomeBack: "أهلاً بعودتك",
    fleetOverview: "نظرة عامة على المركبات", addCar: "إضافة مركبة",
    carName: "اسم المركبة", plateNumber: "رقم اللوحة",
    vinNumber: "رقم الهيكل", mileage: "المسافة",
    lastService: "آخر صيانة", nextService: "الصيانة القادمة",
    parts: "القطع", partNumber: "رقم القطعة", partName: "اسم القطعة",
    installDate: "تاريخ التركيب", lifespan: "العمر (كم)",
    legalDocs: "الوثائق القانونية", docType: "نوع الوثيقة",
    expiryDate: "تاريخ الانتهاء", renew: "تجديد",
    insurance: "تأمين", registration: "تسجيل",
    inspection: "فحص", ownership: "ملكية",
    groceryList: "قائمة المشتريات", addItem: "إضافة عنصر",
    quantity: "الكمية", unit: "الوحدة", store: "المتجر",
    optimize: "تحسين", bestPrice: "أفضل سعر",
    totalSavings: "إجمالي التوفير", shoppingRoute: "مسار التسوق",
    comparePrices: "مقارنة الأسعار", suggestedStores: "المتاجر المقترحة",
  }
};

let currentLang = "en";

export function setLang(l) {
  currentLang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  try { localStorage.setItem("amal_lang", l); } catch(e) {}
}

export function loadLang() {
  try {
    const saved = localStorage.getItem("amal_lang");
    if (saved && dict[saved]) { setLang(saved); return saved; }
  } catch(e) {}
  setLang("en");
  return "en";
}

export function t(key) {
  return (dict[currentLang] && dict[currentLang][key]) || key;
}

export function getLang() { return currentLang; }
export function isRTL() { return currentLang === "ar"; }

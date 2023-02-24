"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _arSA = _interopRequireDefault(require("date-fns/locale/ar-SA"));

var Calendar = {
  sunday: 'ح',
  monday: 'ن',
  tuesday: 'ث',
  wednesday: 'ر',
  thursday: 'خ',
  friday: 'ج',
  saturday: 'س',
  ok: 'حسناً',
  today: 'اليوم',
  yesterday: 'أمس',
  hours: 'ساعات',
  minutes: 'دقائق',
  seconds: 'ثواني',
  formattedMonthPattern: 'MMM, yyyy',
  formattedDayPattern: 'MMM dd, yyyy',
  dateLocale: _arSA.default
};
var _default = {
  common: {
    loading: 'جاري التحميل...',
    emptyMessage: 'لا يوجد المزيد من البيانات'
  },
  Plaintext: {
    unfilled: 'شاغرة',
    notSelected: 'لم يتم اختياره',
    notUploaded: 'لم يتم الرفع'
  },
  Pagination: {
    more: 'المزيد',
    prev: 'السابق',
    next: 'التالي',
    first: 'الأول',
    last: 'الأخير',
    limit: 'صفحة / {0}',
    total: 'الإجمالي: {0}',
    skip: 'اذهب إل {0}'
  },
  Calendar: Calendar,
  DatePicker: (0, _extends2.default)({}, Calendar),
  DateRangePicker: (0, _extends2.default)({}, Calendar, {
    last7Days: 'أخر 7 أيام'
  }),
  Picker: {
    noResultsText: 'لا يوجد نتائج',
    placeholder: 'إختيار',
    searchPlaceholder: 'البحث',
    checkAll: 'الجميع'
  },
  InputPicker: {
    newItem: 'عنصر جديد',
    createOption: 'إنشاء العنصر "{0}"'
  },
  Uploader: {
    inited: 'تم البدء',
    progress: 'جاري الرفع',
    error: 'خطأ',
    complete: 'تم الإنتهاء',
    emptyFile: 'فارغ',
    upload: 'رفع'
  },
  CloseButton: {
    closeLabel: 'اغلق'
  },
  Breadcrumb: {
    expandText: 'عرض المسار'
  },
  Toggle: {
    on: 'إيقاف',
    off: 'تشغيل'
  }
};
exports.default = _default;
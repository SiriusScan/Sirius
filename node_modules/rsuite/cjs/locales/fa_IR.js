"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _faIR = _interopRequireDefault(require("date-fns/locale/fa-IR"));

var Calendar = {
  sunday: 'ی',
  monday: 'د',
  tuesday: 'س',
  wednesday: 'چ',
  thursday: 'پ',
  friday: 'ج',
  saturday: 'ش',
  ok: 'تایید',
  today: 'امروز',
  yesterday: 'دیروز',
  hours: 'ساعت',
  minutes: 'دقیقه',
  seconds: 'ثانیه',
  formattedMonthPattern: 'MMM, yyyy',
  formattedDayPattern: 'MMM dd, yyyy',
  dateLocale: _faIR.default
};
var _default = {
  common: {
    loading: 'در حال بارگذاری...',
    emptyMessage: 'داده ایی پیدا نشد'
  },
  Plaintext: {
    unfilled: 'خالی',
    notSelected: 'انتخاب نشده',
    notUploaded: 'اپلود نشده'
  },
  Pagination: {
    more: 'بیشتر',
    prev: 'قبلی',
    next: 'بعدی',
    first: 'اول',
    last: 'اخر',
    limit: '{0} / صفحه',
    total: 'مجموع ردیف ها: {0}',
    skip: 'برو به{0}'
  },
  Calendar: Calendar,
  DatePicker: (0, _extends2.default)({}, Calendar),
  DateRangePicker: (0, _extends2.default)({}, Calendar, {
    last7Days: '7 روز اخر'
  }),
  Picker: {
    noResultsText: 'نتیجه ایی یافت نشد',
    placeholder: 'انتخاب',
    searchPlaceholder: 'جستجو',
    checkAll: 'همه'
  },
  InputPicker: {
    newItem: 'گزینه جدید',
    createOption: 'ساخت گزینه "{0}"'
  },
  Uploader: {
    inited: 'اولیه',
    progress: 'در حال اپلود',
    error: 'مشکل',
    complete: 'تمام شد',
    emptyFile: 'خالی',
    upload: 'اپلود'
  },
  CloseButton: {
    closeLabel: 'بستن'
  },
  Breadcrumb: {
    expandText: 'نمایش مسیر'
  },
  Toggle: {
    on: 'باز کردن',
    off: 'بستن'
  }
};
exports.default = _default;
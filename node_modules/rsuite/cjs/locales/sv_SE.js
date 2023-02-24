"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _sv = _interopRequireDefault(require("date-fns/locale/sv"));

var Calendar = {
  sunday: 'Sö',
  monday: 'Må',
  tuesday: 'Ti',
  wednesday: 'On',
  thursday: 'To',
  friday: 'Fr',
  saturday: 'Lö',
  ok: 'OK',
  today: 'I dag',
  yesterday: 'I går',
  hours: 'Timmar',
  minutes: 'Minuter',
  seconds: 'Sekunder',

  /**
   * Format of the string is based on Unicode Technical Standard #35:
   * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   **/
  formattedMonthPattern: 'MMM yyyy',
  formattedDayPattern: 'dd MMM yyyy',
  dateLocale: _sv.default
};
var _default = {
  common: {
    loading: 'Laddar...',
    emptyMessage: 'Kunde inte hitta data'
  },
  Plaintext: {
    unfilled: 'Ofylld',
    notSelected: 'Ej valt',
    notUploaded: 'Ej uppladdad'
  },
  Pagination: {
    more: 'Mer',
    prev: 'Föregående',
    next: 'Nästa',
    first: 'Första',
    last: 'Sista',
    limit: '{0} / sida',
    total: 'totalt: {0}',
    skip: 'Gå til{0}'
  },
  Calendar: Calendar,
  DatePicker: (0, _extends2.default)({}, Calendar),
  DateRangePicker: (0, _extends2.default)({}, Calendar, {
    last7Days: 'Senaste 7 dagarna'
  }),
  Picker: {
    noResultsText: 'Inga resultat funna',
    placeholder: 'Välj',
    searchPlaceholder: 'Sök',
    checkAll: 'Alla'
  },
  InputPicker: {
    newItem: 'Ny inkorg',
    createOption: 'Skapa meddelande "{0}"'
  },
  Uploader: {
    inited: 'Första',
    progress: 'Uppladdning',
    error: 'Fel',
    complete: 'Färdig',
    emptyFile: 'Tom',
    upload: 'Ladda upp'
  },
  CloseButton: {
    closeLabel: 'Stänga av'
  },
  Breadcrumb: {
    expandText: 'Visa väg'
  },
  Toggle: {
    on: 'På',
    off: 'Av'
  }
};
exports.default = _default;
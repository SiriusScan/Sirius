"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _es = _interopRequireDefault(require("date-fns/locale/es"));

var Calendar = {
  sunday: 'Do',
  monday: 'Lu',
  tuesday: 'Ma',
  wednesday: 'Mi',
  thursday: 'Ju',
  friday: 'Vi',
  saturday: 'Sá',
  ok: 'Aceptar',
  today: 'Hoy',
  yesterday: 'Ayer',
  hours: 'Horas',
  minutes: 'Minutos',
  seconds: 'Segundos',

  /**
   * Format of the string is based on Unicode Technical Standard #35:
   * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   **/
  formattedMonthPattern: 'MMM yyyy',
  formattedDayPattern: 'dd MMM yyyy',
  dateLocale: _es.default
};
var _default = {
  common: {
    loading: 'Cargando...',
    emptyMessage: 'Sin datos'
  },
  Plaintext: {
    unfilled: 'Sin llenar',
    notSelected: 'No seleccionado',
    notUploaded: 'No subido'
  },
  Pagination: {
    more: 'Más',
    prev: 'Anterior',
    next: 'Siguiente',
    first: 'Primero',
    last: 'Último',
    limit: '{0} / páginas',
    total: 'Total: {0}',
    skip: 'Ir{0}'
  },
  Calendar: Calendar,
  DatePicker: (0, _extends2.default)({}, Calendar),
  DateRangePicker: (0, _extends2.default)({}, Calendar, {
    last7Days: 'Últimos 7 días'
  }),
  Picker: {
    noResultsText: 'No se encontraron resultados',
    placeholder: 'Seleccionar',
    searchPlaceholder: 'Buscar',
    checkAll: 'Todos'
  },
  InputPicker: {
    newItem: 'Nuevo',
    createOption: 'Crear opción "{0}"'
  },
  Uploader: {
    inited: 'Inicial',
    progress: 'Subiendo',
    error: 'Error',
    complete: 'Terminado',
    emptyFile: 'Vacío',
    upload: 'Subir'
  },
  CloseButton: {
    closeLabel: 'Apagar'
  },
  Breadcrumb: {
    expandText: 'Mostrar ruta'
  },
  Toggle: {
    on: 'Encender',
    off: 'Apagar'
  }
};
exports.default = _default;
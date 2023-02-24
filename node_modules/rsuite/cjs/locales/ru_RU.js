"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _ru = _interopRequireDefault(require("date-fns/locale/ru"));

var Calendar = {
  sunday: 'Вс',
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  ok: 'ОК',
  today: 'Сегодня',
  yesterday: 'Вчера',
  hours: 'Часов',
  minutes: 'Минут',
  seconds: 'Секунд',
  formattedMonthPattern: 'MMM, yyyy',
  formattedDayPattern: 'MMM dd, yyyy',
  dateLocale: _ru.default
};
var _default = {
  common: {
    loading: 'Загрузка...',
    emptyMessage: 'Данные не найдены'
  },
  Plaintext: {
    unfilled: 'незаполненной',
    notSelected: 'Није изабран',
    notUploaded: 'Није отпремљено'
  },
  Pagination: {
    more: 'Больше',
    prev: 'Предыдущая',
    next: 'Следующая',
    first: 'Первая',
    last: 'Последняя',
    limit: '{0} / страниц',
    total: 'всего: {0}',
    skip: 'Идти к{0}'
  },
  Calendar: Calendar,
  DatePicker: (0, _extends2.default)({}, Calendar),
  DateRangePicker: (0, _extends2.default)({}, Calendar, {
    last7Days: 'Последние 7 дней'
  }),
  Picker: {
    noResultsText: 'Результаты не найдены',
    placeholder: 'Выбрать',
    searchPlaceholder: 'Поиск',
    checkAll: 'Все'
  },
  InputPicker: {
    newItem: 'Новый',
    createOption: 'Создать опцию "{0}"'
  },
  Uploader: {
    inited: 'Начало',
    progress: 'Выгрузка',
    error: 'Ошибка',
    complete: 'Завершенно',
    emptyFile: 'Пусто',
    upload: 'Загрузить'
  },
  CloseButton: {
    closeLabel: 'неисправность'
  },
  Breadcrumb: {
    expandText: 'Показать путь'
  },
  Toggle: {
    on: 'Вкл',
    off: 'Выкл'
  }
};
exports.default = _default;
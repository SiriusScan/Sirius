## [5.8.2](https://github.com/rsuite/rsuite-table/compare/5.8.1...5.8.2) (2023-01-11)


### Bug Fixes

* change table width function wrap debounce ([#392](https://github.com/rsuite/rsuite-table/issues/392)) ([a79dd36](https://github.com/rsuite/rsuite-table/commit/a79dd36dd26486831bc4c68373f21efae4218cc7))



## [5.8.1](https://github.com/rsuite/rsuite-table/compare/5.8.0...5.8.1) (2022-11-21)


### Bug Fixes

* **Column:** fix cannot customize columns ([#388](https://github.com/rsuite/rsuite-table/issues/388)) ([7cfb8f9](https://github.com/rsuite/rsuite-table/commit/7cfb8f910dba08322426760bfaa92073180343b4))
* **Row:** fix the style error of header hover ([#386](https://github.com/rsuite/rsuite-table/issues/386)) ([9238a34](https://github.com/rsuite/rsuite-table/commit/9238a3494873cda209f893440bcd63af89f2596d))
* **Table:** fix virtualized table white screen issue in react 18 ([#387](https://github.com/rsuite/rsuite-table/issues/387)) ([f10f92b](https://github.com/rsuite/rsuite-table/commit/f10f92bd3192759f89418c323485c55d62b1af6b))



# [5.8.0](https://github.com/rsuite/rsuite-table/compare/5.7.2...5.8.0) (2022-11-03)


### Features

* **Column:** support for show  full text when hovering over a cell ([#376](https://github.com/rsuite/rsuite-table/issues/376)) ([2d5066a](https://github.com/rsuite/rsuite-table/commit/2d5066a73e4660ca69437afd3bc9fdc2927bdfb8))



## [5.7.2](https://github.com/rsuite/rsuite-table/compare/5.7.1...5.7.2) (2022-09-29)


### Bug Fixes

* **Loader:** fix custom loader always showing ([#370](https://github.com/rsuite/rsuite-table/issues/370)) ([1774eee](https://github.com/rsuite/rsuite-table/commit/1774eeef38b4195f1797e960ffdeb2592609629e))



## [5.7.1](https://github.com/rsuite/rsuite-table/compare/5.7.0...5.7.1) (2022-09-07)


### Bug Fixes

* fixes an issue where the width of cells outputted from useCellDescriptor does not always update as columns in input change.' ([#364](https://github.com/rsuite/rsuite-table/issues/364)) ([cf1682d](https://github.com/rsuite/rsuite-table/commit/cf1682d836f1e5657db93e9ce4d8975dce760786))
* **Table:** fix virtualized table scrolling exception ([#366](https://github.com/rsuite/rsuite-table/issues/366)) ([a0c1696](https://github.com/rsuite/rsuite-table/commit/a0c1696baf75f092d7b3c40368e9e7e0db61bbaa))



# [5.7.0](https://github.com/rsuite/rsuite-table/compare/5.6.1...5.7.0) (2022-08-23)


### Bug Fixes

* **autoHeight:** fix table height calculation error when autoHeight ([#362](https://github.com/rsuite/rsuite-table/issues/362)) ([9cca913](https://github.com/rsuite/rsuite-table/commit/9cca913cd5aaf394fd657d0eb4c5435ec73c66b3))
* **autoHeight:** fixed scroll event not updating after autoHeight value changed ([#360](https://github.com/rsuite/rsuite-table/issues/360)) ([bb368bd](https://github.com/rsuite/rsuite-table/commit/bb368bd213c8c1dc61327889a57aad2f7c6d1028))
* **Cell:** add rowData required validation for custom Cell ([#361](https://github.com/rsuite/rsuite-table/issues/361)) ([fcab314](https://github.com/rsuite/rsuite-table/commit/fcab3144d9fadd9b643f887c7a306a8c85649113))


### Features

* adapt to react 18 ([#359](https://github.com/rsuite/rsuite-table/issues/359)) ([433e8d3](https://github.com/rsuite/rsuite-table/commit/433e8d317f0343757d4157dad4ff48a909c51278))



## [5.6.1](https://github.com/rsuite/rsuite-table/compare/5.6.0...5.6.1) (2022-07-12)


### Bug Fixes

* add debounce to onScroll ([#352](https://github.com/rsuite/rsuite-table/issues/352)) ([793c830](https://github.com/rsuite/rsuite-table/commit/793c830d599a7844c18e635115bf45272baf5059))



# [5.6.0](https://github.com/rsuite/rsuite-table/compare/5.5.1...5.6.0) (2022-06-27)


### Bug Fixes

* **Table:** fix classPrefix bug due to context parameter ([#349](https://github.com/rsuite/rsuite-table/issues/349)) ([cf875f5](https://github.com/rsuite/rsuite-table/commit/cf875f5c715419e790fc0338c22f8804ded1b962))


### Features

* **Table:** add support for wordWrap property values ([#348](https://github.com/rsuite/rsuite-table/issues/348)) ([f6f65c1](https://github.com/rsuite/rsuite-table/commit/f6f65c1ef4682926f57e198127b3cb9b692b4ab8))



## [5.5.1](https://github.com/rsuite/rsuite-table/compare/5.5.0...5.5.1) (2022-06-01)


### Bug Fixes

* rowHeight using is fixed in useTableDimension ([#343](https://github.com/rsuite/rsuite-table/issues/343)) ([6fb5a69](https://github.com/rsuite/rsuite-table/commit/6fb5a69c15e609d170f7b6edcee555d1b4f7379c))



# [5.5.0](https://github.com/rsuite/rsuite-table/compare/5.4.1...5.5.0) (2022-04-21)


### Features

* **HeaderCell:** support renderSortIcon on `<HeaderCell>` ([#341](https://github.com/rsuite/rsuite-table/issues/341)) ([18d6567](https://github.com/rsuite/rsuite-table/commit/18d65673845daea6cd106d3121b2023de293d9b9))


### Performance Improvements

* **Table:** improved rendering of scrollbars ([#340](https://github.com/rsuite/rsuite-table/issues/340)) ([2b04ada](https://github.com/rsuite/rsuite-table/commit/2b04adad36f4df4c1224f87c4ab090031cc766b5))



## [5.4.1](https://github.com/rsuite/rsuite-table/compare/5.4.0...5.4.1) (2022-04-14)


### Bug Fixes

* **Table:** fix table height not reset after fillHeight is changed ([#337](https://github.com/rsuite/rsuite-table/issues/337)) ([2156358](https://github.com/rsuite/rsuite-table/commit/215635882124441b261a84c70e44d861f482c0f5))



# [5.4.0](https://github.com/rsuite/rsuite-table/compare/5.3.6...5.4.0) (2022-04-07)

### Bug Fixes

- **Column:** fix rowSpan cell layer covering fixed columns ([#331](https://github.com/rsuite/rsuite-table/issues/331)) ([16fab36](https://github.com/rsuite/rsuite-table/commit/16fab369dd263c794624163e5b2fb666a59ee5c9))
- fix lint error on typescript versions prior to 4.4 ([#329](https://github.com/rsuite/rsuite-table/issues/329)) ([991bc2f](https://github.com/rsuite/rsuite-table/commit/991bc2fe0ae4186cf3b2c144a5278cc870478542))
- **Table:** fix `affixHorizontalScrollbar` to be shown when Table component was initially rendered with empty data ([21a3f07](https://github.com/rsuite/rsuite-table/commit/21a3f07b666f72b2f9361c464f70b8e54b638255))
- **Table:** fix `affixHorizontalScrollbar` to stay when user drags it ([21a3f07](https://github.com/rsuite/rsuite-table/commit/21a3f07b666f72b2f9361c464f70b8e54b638255))
- **Table:** fix horizontal scroll can not scroll to the end ([#336](https://github.com/rsuite/rsuite-table/issues/336)) ([ecd2494](https://github.com/rsuite/rsuite-table/commit/ecd249448269139f4882771133ffb68aa67bc68f))

### Features

- **Table:** add support for `fillHeight` on `<Table>` ([#330](https://github.com/rsuite/rsuite-table/issues/330)) ([7db9a13](https://github.com/rsuite/rsuite-table/commit/7db9a1303a7ac36abc291c697e9bffee22d0bd18))

## [5.3.6](https://github.com/rsuite/rsuite-table/compare/5.3.5...5.3.6) (2022-03-10)

### Bug Fixes

- **Columns:** fix Fragment render in nested array ([#327](https://github.com/rsuite/rsuite-table/issues/327)) ([a29e38c](https://github.com/rsuite/rsuite-table/commit/a29e38ce565af662f8577ce8b32026fd4f15cda1))

## [5.3.5](https://github.com/rsuite/rsuite-table/compare/5.3.4...5.3.5) (2022-03-03)

### Bug Fixes

- **scroll:** fix horizontal scroll position exception ([#323](https://github.com/rsuite/rsuite-table/issues/323)) ([aef4bd5](https://github.com/rsuite/rsuite-table/commit/aef4bd5ee12398aab225c026abd114bbe62c59ef))

## [5.3.4](https://github.com/rsuite/rsuite-table/compare/5.3.3...5.3.4) (2022-02-24)

### Bug Fixes

- **rerender:** fix table infinite rerender ([#319](https://github.com/rsuite/rsuite-table/issues/319)) ([da4b36b](https://github.com/rsuite/rsuite-table/commit/da4b36b8f361fbcbcb4327fd093ef9a33cb9e06b))

## [5.3.3](https://github.com/rsuite/rsuite-table/compare/5.3.2...5.3.3) (2022-02-10)

### Bug Fixes

- **ssr:** fix server-side rendering warning ([#310](https://github.com/rsuite/rsuite-table/issues/310)) ([e188ef7](https://github.com/rsuite/rsuite-table/commit/e188ef71f814f718e97b29320d377e8250f323b5))
- **ts:** fix errors checked in typescript strict mode ([#305](https://github.com/rsuite/rsuite-table/issues/305)) ([ba059bd](https://github.com/rsuite/rsuite-table/commit/ba059bd4dc9bc09af99659416407ae42e99bb0b0))
- **useScrollListener:** can't perform a React state update on an unmounted component ([#306](https://github.com/rsuite/rsuite-table/issues/306)) ([f2104f1](https://github.com/rsuite/rsuite-table/commit/f2104f111103d4229a2f7800a0f11641b0641703))

## [5.3.2](https://github.com/rsuite/rsuite-table/compare/5.3.1...5.3.2) (2022-01-13)

### Bug Fixes

- **ssr:** fix `window` is not defined for Table Columns ([#294](https://github.com/rsuite/rsuite-table/issues/294)) ([42e1189](https://github.com/rsuite/rsuite-table/commit/42e1189671bfe1687c7894df7ba5e67aa8a0bc24))

## [5.3.1](https://github.com/rsuite/rsuite-table/compare/5.3.0...5.3.1) (2022-01-06)

### Bug Fixes

- **Table:** fix rowSpan is invalid in ie brower ([#293](https://github.com/rsuite/rsuite-table/issues/293)) ([ea49e51](https://github.com/rsuite/rsuite-table/commit/ea49e513746fb4b44077d3baafbd27886e744aab))

## [5.3.0](https://github.com/rsuite/rsuite-table/compare/5.2.2...5.3.0) (2021-12-23)

### Features

- **Table:** support renderRow on <Table> ([#287](https://github.com/rsuite/rsuite-table/issues/287)) ([732a35e](https://github.com/rsuite/rsuite-table/commit/732a35e5567048bdf6cc1a21d6887f0481913b46))

## [5.2.2](https://github.com/rsuite/rsuite-table/compare/5.2.1...5.2.2) (2021-12-03)

### Bug Fixes

- **Column:** fix alignment is overwritten in ColumnGroup ([#282](https://github.com/rsuite/rsuite-table/issues/282)) ([0ea6a71](https://github.com/rsuite/rsuite-table/commit/0ea6a7100360f80de820e4f53996a03ee3bf7c3e))

## [5.2.1](https://github.com/rsuite/rsuite-table/compare/5.2.0...5.2.1) (2021-11-25)

### Bug Fixes

- **scrollbar:** enhanced verification of the number of columns ([#275](https://github.com/rsuite/rsuite-table/issues/275)) ([a666996](https://github.com/rsuite/rsuite-table/commit/a666996dbf68b1a12ad565911345af8b55a9398c))
- **scrollbar:** fix scroll left reset ([#273](https://github.com/rsuite/rsuite-table/issues/273)) ([dab0f27](https://github.com/rsuite/rsuite-table/commit/dab0f2796c3168dc8fc0bc480b15f63cd04fe5af))
- **tree:** fix unrecalculated row height after tree node is expanded ([#277](https://github.com/rsuite/rsuite-table/issues/277)) ([3788875](https://github.com/rsuite/rsuite-table/commit/378887509981db5cfc3a98e47c2751cc0559f3f8))
- **wordWrap:** fix can't word wrap in tree table ([#274](https://github.com/rsuite/rsuite-table/issues/274)) ([58436e4](https://github.com/rsuite/rsuite-table/commit/58436e47e85d03dad274bc30f0052432a544b79d))

## [5.2.0](https://github.com/rsuite/rsuite-table/compare/5.1.0...5.2.0) (2021-11-18)

### Bug Fixes

- **Table:** fix scroll bar not re-rendering after table resize ([#267](https://github.com/rsuite/rsuite-table/issues/267)) ([185f759](https://github.com/rsuite/rsuite-table/commit/185f759536b2686472995acb72e838827716ec21))

### Features

- **Column:** added support for nested values of dataKey on Column ([#268](https://github.com/rsuite/rsuite-table/issues/268)) ([50ec875](https://github.com/rsuite/rsuite-table/commit/50ec875891fa33fc677a7c9e2e07a4af060773a5))

### Performance Improvements

- **TreeTable:** improve the performance of tree table ([#266](https://github.com/rsuite/rsuite-table/issues/266)) ([25eeee6](https://github.com/rsuite/rsuite-table/commit/25eeee62c2c5539e956d4bcf3643b951002ae36f))

## [5.1.0](https://github.com/rsuite/rsuite-table/compare/5.0.3...5.1.0) (2021-11-12)

### Features

- **Table:** added support function type for shouldUpdateScroll ([#262](https://github.com/rsuite/rsuite-table/issues/262)) ([a05bf8e](https://github.com/rsuite/rsuite-table/commit/a05bf8e7b3d86b73cb79c1a7354ebfc08d90f376))
- **Touch:** support momentum scroll when touch ([#263](https://github.com/rsuite/rsuite-table/issues/263)) ([23982ed](https://github.com/rsuite/rsuite-table/commit/23982ed093cfc8eab4ba32223e9439547a8dcd3d))

## 5.0.3

-build(deps): bump dom-lib to 3.0.0 #260

## [5.0.2](https://github.com/rsuite/rsuite-table/compare/5.0.1...5.0.2) (2021-10-28)

### Bug Fixes

- **scroll:** fix `resizable` will affect the scroll bar reset ([#258](https://github.com/rsuite/rsuite-table/issues/258)) ([8bf2ae6](https://github.com/rsuite/rsuite-table/commit/8bf2ae65c13b2b43336e2b0805e119af216aa9c5))
- **Table:** fix scroll event not working ([#257](https://github.com/rsuite/rsuite-table/issues/257)) ([7212e66](https://github.com/rsuite/rsuite-table/commit/7212e66cd6c6f48fd1b114fb9b823b9b31045af6))
- **Table:** remove default value of rowKey ([#259](https://github.com/rsuite/rsuite-table/issues/259)) ([191ffda](https://github.com/rsuite/rsuite-table/commit/191ffda3cba90a06c062d70737a46bfd4df537f9))

## [5.0.1](https://github.com/rsuite/rsuite-table/compare/5.0.0...5.0.1) (2021-10-20)

### Bug Fixes

- 🐛 Add the `children` type definition for Column ([#254](https://github.com/rsuite/rsuite-table/issues/254)) ([6b7a69e](https://github.com/rsuite/rsuite-table/commit/6b7a69e2e6d267231b8848017abbfe98d5b0e08a))
- 🐛 fix scrollbar is not updated after tree node is expanded ([#253](https://github.com/rsuite/rsuite-table/issues/253)) ([323110c](https://github.com/rsuite/rsuite-table/commit/323110c8b0779e245fa67de2f96a12fbc4ff8bb4)), closes [#249](https://github.com/rsuite/rsuite-table/issues/249)

### Features

- **a11y:** add aria-busy attribute to loading table ([#251](https://github.com/rsuite/rsuite-table/issues/251)) ([e41e2cf](https://github.com/rsuite/rsuite-table/commit/e41e2cf7a6814e7c1e32a5a6acc044d87aeb0b4b))

## [5.0.0-beta.3](https://github.com/rsuite/rsuite-table/compare/5.0.0-beta.2...5.0.0-beta.3) (2021-09-17)

### Bug Fixes

- **table:** fix cell text does not wrap when `wordWrap` ([#246](https://github.com/rsuite/rsuite-table/issues/246)) ([572b1cd](https://github.com/rsuite/rsuite-table/commit/572b1cd43f0dc56f61b51419ee1cbb34160b3cce))
- **table:** fix that `flexGrow` and `wordWrap` cannot be used together ([#247](https://github.com/rsuite/rsuite-table/issues/247)) ([f91aa2b](https://github.com/rsuite/rsuite-table/commit/f91aa2bea9e5e1bd8bb4640b8e632a1655b7d4cd))
- **table:** fix the redundant scroll bar height ([#248](https://github.com/rsuite/rsuite-table/issues/248)) ([26fa42f](https://github.com/rsuite/rsuite-table/commit/26fa42ff653a79b54e81051de52ae6d02356efc4))

## [5.0.0-beta.2](https://github.com/rsuite/rsuite-table/compare/5.0.0-beta.1...5.0.0-beta.2) (2021-09-16)

### Bug Fixes

- **column:** fix that `rowSpan` cannot be used in multiple Columns ([#245](https://github.com/rsuite/rsuite-table/issues/245)) ([5095062](https://github.com/rsuite/rsuite-table/commit/50950620e40ae8549761390aa40af30e114dbe65))

## [5.0.0-beta.1](https://github.com/rsuite/rsuite-table/compare/5.0.0-alpha.6...5.0.0) (2021-09-16)

### Bug Fixes

- **affix:** fix scrollbar not re-rendering after data update ([#237](https://github.com/rsuite/rsuite-table/issues/237)) ([5a759d6](https://github.com/rsuite/rsuite-table/commit/5a759d6d2115448e805df554c2eb62ab228f9026))
- **autoHeight:** fix the extra scroll bar width after autoHeight ([#236](https://github.com/rsuite/rsuite-table/issues/236)) ([3ef47cb](https://github.com/rsuite/rsuite-table/commit/3ef47cbb4a65a39da02c31fbb10387a9f0e31303))
- **Cell:** fix that the content cannot be styled through `style` ([#234](https://github.com/rsuite/rsuite-table/issues/234)) ([7823adb](https://github.com/rsuite/rsuite-table/commit/7823adb7dbf77a031a35aa9b151a03331d092f53))
- **Cell:** fix the problem that style padding value is overwritten ([#238](https://github.com/rsuite/rsuite-table/issues/238)) ([8b307c2](https://github.com/rsuite/rsuite-table/commit/8b307c2682c45ade7549519b3f49b1783e178a2d))
- some props of TableProps should be optional. ([#240](https://github.com/rsuite/rsuite-table/issues/240)) ([f8bf9c8](https://github.com/rsuite/rsuite-table/commit/f8bf9c85cdcf77fa9d4a1a85c9fbad0fbe46b710))
- **table:** fix scroll listener not updated after data update ([#242](https://github.com/rsuite/rsuite-table/issues/242)) ([75aef50](https://github.com/rsuite/rsuite-table/commit/75aef50ac89e8ac8a9ea688c10ed0a8db56c1a20)), closes [#239](https://github.com/rsuite/rsuite-table/issues/239)

### Features

- **ColumnGroup:** support `groupHeaderHeight` on `<ColumnGroup>` ([#235](https://github.com/rsuite/rsuite-table/issues/235)) ([680035a](https://github.com/rsuite/rsuite-table/commit/680035ab0b17a13cefa6b91943a4aed65e3e471a))
- **column:** support `rowSpan` on `<Column>` ([#243](https://github.com/rsuite/rsuite-table/issues/243)) ([a6e08c2](https://github.com/rsuite/rsuite-table/commit/a6e08c2dfa8f3341205c090a846cfe65a73d4658))
- **Table:** refactor: use react hooks to refactor Table. (#232)
- **icons:** refactor(icons): replace all icon with @rsuite/icons. (#180)
- **resize:** honor minWidth setting when resizing columns. (#201)

## 3.14.3

- **Bugfix**: Fix the type definition error of typescript (#195)
- **Bugfix**: Fixed ColumnGroup does not support `classPrefix` (#193)
- **Bugfix**: Fixed Row missing custom rowKey (#191)
- **Bugfix**: Fixed the unhandled scroll bar width when the Cell is fixed on the right (#189)

## 3.14.2

- **Bugfix**: Fix the table height problem caused by affixHeader (#185)

## 3.14.1

- **Improve**: Use ARIA to improve accessibility (#178)
- **Bugfix**: Fix Cell rendering redundant padding when it is not a tree column (#179)
- **Bugfix**: fix(HeaderCell): missing children prop type (#177)

## 3.14.0

- **Improve**: Add accessibility properties.
- **Bugfix**: Fix not working with `gatsbyjs`.
- **Bugfix**: Fixed invalid custom column width when dragging the column.
- **Bugfix**: Fix the problem that the vertical scroll bar is not displayed after the Tree is expanded.
- **Bugfix**: Fix the problem that the data is not updated after the isTree property is changed.

## 3.13.2

- **Bugfix**: Fix that after turning on virtualization and turning off shouldUpdateScroll, there will be a React error with page stack overflow. #163 #164

## 3.13.1

- **Bugfix**: Fixed an issue that exceeded the maximum update depth

## 3.13.0

- **Feature**: Add an optional onRowContextMenu property
- **Feature**: Add ColumnGroup
- **Bugfix**: Fix rsuite#1044

## 3.12.0

- **Feature**: Support `shouldUpdateScroll` on `<Table>`

## 3.11.3

- **Bugfix**: Improved to `children` compatible with complex structures.

## 3.11.2

- **Bugfix**: Fix the problem that the table header has no shadow.

## 3.11.1

- **Bugfix**: Fix the situation where the `affixHeader` cannot be applied to non-fixed columns.

## 3.11.0

- **Bugfix**: Fix `resizable` to be compatible with `affixHeader`
- **Feature**: Support `onDataUpdated` on `<Table>`
- **Improve**: Improved `wordWrap` property for compatibility with `rowHeight`.

## 3.10.1

- **Bugfix**: Fix the problem that the position will be reset after clicking the scroll bar

## 3.10.0

- **Feature**: Support affixHorizontalScrollbar on Table

## 3.9.5

- **Bugfix**: Fixed the problem that the scroll bar is not reset when the data is updated.

## 3.9.3

- **Bugfix**: Fixed the problem that the `resizable` property of the columns of the table would not work.

## 3.9.2

- **Bugfix**: Fixed incorrect scroll bar position when manually triggering the scroll method.
- **Bugfix**: Fixed table cannot adjust column width.
- **Bugfix**: Fixed misalignment of table header text.

## 3.9.0

- **Feature**: Added `expanded` parameter in `renderTreeToggle`.
- **Feature**: Added support `treeCol` on `<Column>`.
- **Chore**: Migrate from Flow to Typescript.
- **Breaking**: Remove the `setRowHeight` property,`rowHeight` supports function values.

## 3.8.4

- Fixed an issue where `scrollTop` would not work

## 3.8.3

- `<Table>` The "empty" status is not displayed by default when loading

## 3.8.2

- Fix RTL related bugs #121

## 3.8.1

- Improve the performance of virtualized table #120

## 3.8.0

- Added support for css import #118
- Fixed the `affixHeader` feature, which does not hide the table header when the scrolling range is outside the Table body #109
- Added support for RTL #101
- Fix #114 #116

## 3.7.1

- Fix move scrollbar issues #106

## 3.7.0

- Support for `affixHeader` on `<Table>`

## 3.6.1

- Fix \_constants is not defined #103

## 3.6.0

- Added support for RTL #101

## 3.5.9

- Fixed scroll position after data update #100

## 3.5.8

- Fixed a rendering error when the column in the table was null #99
- Fixed a problem with scrolling white screen after changing height #97

## 3.5.7

- Fixed component not re-rendered after `sortType` update.
- Fix the position of the scroll bar when the height of the table changes
- Fix validation of merged cells for custom children

## 3.5.6

- Fixed an issue where the scrollbar position was not updated after the data was updated

## 3.5.5

- Fix `expandedRowKeys` not controlled (#90)
- Support event parameter in `onRowClick` (#89)
- Custom function parameters in `<Cell>` support `rowIndex` (#88)

## 3.5.4

- Fix `expandedRowKeys` is invalid when rowKey is 0

## 3.5.3

- Fix: Unable to preventDefault inside passive event listener due to target being treated as passive

## 3.5.2

- Fixed a scrollbar being reset in the case of `virtualized`

## 3.5.1

- Fixed scrollbar position not updated after data update

## 3.5.0

- Support `renderEmpty` and `renderLoading` on `<Table>`
- Support `verticalAlign` on `<Table.Column>`
- Fix: Unable to preventDefault inside passive event listener due to target being treated as passive

## 3.4.11

- Fixed a scrollbar event invalid on the internal elements of the table

## 3.4.10

- Fixed icon style problem with Table Tree
- Fixed invalid `autoHeight` property when table data is empty

## 3.4.9

- Fixed an error that occurred when the tree table word wrap

## 3.4.8

- Fix IE 10 compatibility issues

## 3.4.7

> January 30, 2019

- Fixed a passively triggered onScroll event that caused the scrollbar to be misaligned
- Cache data for Tree

## 3.4.4

- Fix typos

## 3.4.3

> January 23, 2019

- Fix dynamic column not updated

## 3.4.1

> January 17, 2019

- Fix scrollbar position

## 3.4.0

> January 17, 2019

- Support virtualized, effectively render large tabular data #55

## 3.3.2

> January 9, 2019

- The `children` property support function for `<Cell>` in `<Table>`

## 3.3.1

> January 3, 2019

- Support fixed column to the right

## 3.3.0 (deprecate)

> December 29, 2018

- Support fixed column to the right

## 3.2.0

- Support server side rendering
- Refactored the logic of sorting

## 3.1.7

- Feature: Support `rowClassName` on Table
- Feature: Support `defaultSortType` on `<Table>` and let `sortType` be controlled
- Chore: Update element-resize-event

## 3.1.6

- Bugfix: The scroll bar is not reset after the column has changed

## 3.1.5

- Bugfix: Column Widths change affects the scroll bar ([#rsuite-224])

[rsuite-224]: https://github.com/rsuite/rsuite/issues/224

## 3.1.3

- Bugfix: The default value of `sortType` on `<Table>` should be `desc` ([#40])

[40]: https://github.com/rsuite/rsuite-table/pull/40

## 3.1.2

- Bugfix: `flexGrow` is invalid when there is only one column ([#39])

[39]: https://github.com/rsuite/rsuite-table/pull/39

## 3.1.1

- Feature: Support `onResize` on `<Table.Column>` ([#37])
- Bugfix: The scrollbar position is reset when the data is loaded ([#36])

[37]: https://github.com/rsuite/rsuite-table/pull/37
[36]: https://github.com/rsuite/rsuite-table/pull/36

## 3.1.0

- Chore: Migrated to new lifecycle method

## 3.0.7

- Chore: filter the ref value of `null` for `tableRows`([#33])

[32]: https://github.com/rsuite/rsuite-table/pull/33

## 3.0.6

- Chore: Remove dependency for `rsuite-theme` ([#32])

[32]: https://github.com/rsuite/rsuite-table/pull/32

## 3.0.5

> 2018-7-3

- Feature: Support `showHeader` on `<Table>` ([#30])
- Feature: Support `autoHeight` and `minHeight` on `<Table>` ([#29])
- Feature: Support `cellBordered` on `<Table>` ([#28])

[30]: https://github.com/rsuite/rsuite-table/pull/30
[29]: https://github.com/rsuite/rsuite-table/pull/29
[28]: https://github.com/rsuite/rsuite-table/pull/28

## 3.0.4

> 2018-6-26

- Feature: Support `loadAnimation` on `<Table>` ([#27])
- Bugfix: The position was updated incorrectly when the scrollbar was clicked on `<Table>` ([#26])

[27]: https://github.com/rsuite/rsuite-table/pull/27
[26]: https://github.com/rsuite/rsuite-table/pull/26

## 3.0.3

> 2018-6-25

- Chore: Allowed header height can be 0 ([#25])
- Chore: Update style for loading ([#25])
- Bugfix: Set minimum height for table body ([#24])

[25]: https://github.com/rsuite/rsuite-table/pull/25
[24]: https://github.com/rsuite/rsuite-table/pull/24

## 3.0.2

> 2018-6-10

- Support `bodyRef` on `<Table>` ([#23])
- When the height of the content is updated, reset the scroll bar position ([#22])

[23]: https://github.com/rsuite/rsuite-table/pull/23
[22]: https://github.com/rsuite/rsuite-table/pull/22

## 3.0.1

- Update shouldComponentUpdate check

## 2.0.1

- 修复多个 bug
- 修改 renderTreeToggle
- 支持 `bordered` 属性
- 支持 `treeToggle` 和 `treeToggleBy` 属性
- 支持 touch events
- `<Column>` 支持 `colSpan` 属性, 可以合并列单元格
- Scrollbar 支持点击滚动到指定位置
- 更新 `rsuite-theme`, 解决分页按钮禁用样式问题

## 2.0.0

- 升级 React 版本 15.\* ,同时兼容 0.14.9 版本
- 删除 Minxin, 改用高阶组件
- 改进表格许多性能问题
- 添加了对 `loading` 状态的支持
- 添加了 `编辑的表格` 的示例

## 1.1.11

- 自定义滚动条代替系统原生滚动，大幅提高了滚动表格时候的性能

## 1.1.8

- Column 设置默认宽度为 100
- 修复，在 Column 是 null 时候报错
- 修复，在动态列时候 flexGrow 值无效

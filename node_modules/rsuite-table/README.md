# rsuite-table

A React table component.

[![npm][npm-badge]][npm]

[![Travis][build-badge]][build] [![Coverage Status][coverage-badge]][coverage]

## Features

- Support virtualized.
- Support fixed header, fixed column.
- Support custom adjustment column width.
- Support for custom cell content.
- Support for displaying a tree form.
- Support for sorting.
- Support for expandable child nodes
- Support for RTL

## Preview

- Fixed Column

![](https://user-images.githubusercontent.com/1203827/51730134-4b87c500-20b1-11e9-8140-d0c1ee79bb7b.png)

- Custom Cell

![](https://user-images.githubusercontent.com/1203827/51730187-7eca5400-20b1-11e9-827f-60a7532923c9.png)

- Tree Table

![](https://user-images.githubusercontent.com/1203827/51730250-bb964b00-20b1-11e9-82e3-2391fbb6266b.png)

- Expandable

![](https://user-images.githubusercontent.com/1203827/51730456-86d6c380-20b2-11e9-8331-462fda0eeaa0.png)

[More Examples](https://rsuitejs.com/en/components/table)

## Install

```sh
npm i rsuite-table --save
```

### Usage

```tsx
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/lib/less/index.less'; // or 'rsuite-table/dist/css/rsuite-table.css'

const dataList = [
  { id: 1, name: 'a', email: 'a@email.com', avartar: '...' },
  { id: 2, name: 'b', email: 'b@email.com', avartar: '...' },
  { id: 3, name: 'c', email: 'c@email.com', avartar: '...' }
];

const ImageCell = ({ rowData, dataKey, ...rest }) => (
  <Cell {...rest}>
    <img src={rowData[dataKey]} width="50" />
  </Cell>
);

const App = () => (
  <Table data={dataList}>
    <Column width={100} sortable fixed resizable>
      <HeaderCell>ID</HeaderCell>
      <Cell dataKey="id" />
    </Column>

    <Column width={100} sortable resizable>
      <HeaderCell>Name</HeaderCell>
      <Cell dataKey="name" />
    </Column>

    <Column width={100} sortable resizable>
      <HeaderCell>Email</HeaderCell>
      <Cell>
        {(rowData, rowIndex) => {
          return <a href={`mailto:${rowData.email}`}>{rowData.email}</a>;
        }}
      </Cell>
    </Column>

    <Column width={100} resizable>
      <HeaderCell>Avartar</HeaderCell>
      <ImageCell dataKey="avartar" />
    </Column>
  </Table>
);
```

## API

### `<Table>`

| Property                 | Type `(Default)`                                                   | Description                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| affixHeader              | boolean,number                                                     | Affix the table header to the specified position on the page                                                                        |
| affixHorizontalScrollbar | boolean,number                                                     | Affix the table horizontal scrollbar to the specified position on the page                                                          |
| autoHeight               | boolean                                                            | The height of the table will be automatically expanded according to the number of data rows, and no vertical scroll bar will appear |
| bordered                 | boolean                                                            | Show border                                                                                                                         |
| cellBordered             | boolean                                                            | Show cell border                                                                                                                    |
| data \*                  | object[]                                                           | Table data                                                                                                                          |
| defaultExpandAllRows     | boolean                                                            | Expand all nodes By default                                                                                                         |
| defaultExpandedRowKeys   | string[]                                                           | Specify the default expanded row by `rowkey`                                                                                        |
| defaultSortType          | enum: 'desc', 'asc'                                                | Sort type                                                                                                                           |
| expandedRowKeys          | string[]                                                           | Specify the default expanded row by `rowkey` (Controlled)                                                                           |
| fillHeight               | boolean                                                            | Force the height of the table to be equal to the height of its parent container. Cannot be used together with autoHeight.           |
| headerHeight             | number`(40)`                                                       | Table Header Height                                                                                                                 |
| height                   | number`(200)`                                                      | Table height                                                                                                                        |
| hover                    | boolean `(true)`                                                   | The row of the table has a mouseover effect                                                                                         |
| isTree                   | boolean                                                            | Show as Tree table                                                                                                                  |
| loading                  | boolean                                                            | Show loading                                                                                                                        |
| locale                   | object: { emptyMessage: `('No data')`, loading: `('Loading...')` } | Messages for empty data and loading states                                                                                          |
| minHeight                | number `(0)`                                                       | Minimum height                                                                                                                      |
| onExpandChange           | (expanded:boolean,rowData:object)=>void                            | Tree table, the callback function in the expanded node                                                                              |
| onRowClick               | (rowData:object, event: SyntheticEvent)=>void                      | Click the callback function after the row and return to `rowDate`                                                                   |
| onRowContextMenu         | (rowData:object, event: SyntheticEvent)=>void                      | Invoke the callback function on contextMenu and pass the `rowData`                                                                  |
| onScroll                 | (scrollX:object, scrollY:object)=>void                             | Callback function for scroll bar scrolling                                                                                          |
| onSortColumn             | (dataKey:string, sortType:string)=>void                            | Click the callback function of the sort sequence to return the value `sortColumn`, `sortType`                                       |
| renderEmpty              | (info: React.ReactNode) => React.ReactNode                         | Customized data is empty display content                                                                                            |
| renderLoading            | (loading: React.ReactNode) => React.ReactNode                      | Customize the display content in the data load                                                                                      |
| renderRow                | (children?: ReactNode, rowData?: RowDataType) => ReactNode         | Custom row element                                                                                                                  |
| renderRowExpanded        | (rowDate?: Object) => React.ReactNode                              | Customize what you can do to expand a zone                                                                                          |
| renderTreeToggle         | (icon:node,rowData:object,expanded:boolean)=> node                 | Tree table, the callback function in the expanded node                                                                              |
| rowClassName             | string , (rowData:object)=>string                                  | Add an optional extra class name to row                                                                                             |
| rowExpandedHeight        | number `(100)`                                                     | Set the height of an expandable area                                                                                                |
| rowHeight                | number`(46)`, (rowData: object) => number                          | Row height                                                                                                                          |
| rowKey                   | string `('key')`                                                   | Each row corresponds to the unique `key` in `data`                                                                                  |
| rtl                      | boolean                                                            | Right to left                                                                                                                       |
| shouldUpdateScroll       | boolean,(event)=>({x,y}) `(true)`                                  | Use the return value of `shouldUpdateScroll` to determine whether to update the scroll after the table size is updated.             |
| showHeader               | boolean `(true)`                                                   | Display header                                                                                                                      |
| sortColumn               | string                                                             | Sort column name ˝                                                                                                                  |
| sortType                 | enum: 'desc', 'asc'                                                | Sort type (Controlled)                                                                                                              |
| virtualized              | boolean                                                            | Effectively render large tabular data                                                                                               |
| width                    | number                                                             | Table width                                                                                                                         |
| wordWrap                 | boolean,'break-all','break-word','keep-all'                        | Whether to appear line breaks where text overflows its content box.                                                                 |

### `<Column>`

| Property      | Type `(Default)`                                 | Description                                                                                                 |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| align         | enum: 'left','center','right'                    | Alignment                                                                                                   |
| colSpan       | number                                           | Merges column cells to merge when the `dataKey` value for the merged column is `null` or `undefined`.       |
| fixed         | boolean, 'left', 'right'                         | Fixed column                                                                                                |
| flexGrow      | number                                           | Set the column width automatically adjusts, when set `flexGrow` cannot set `resizable` and `width` property |
| minWidth      | number`(200)`                                    | When you use `flexGrow`, you can set a minimum width by `minwidth`                                          |
| onResize      | (columnWidth?: number, dataKey?: string) => void | Callback after column width change                                                                          |
| resizable     | boolean                                          | Customizable Resize Column width                                                                            |
| rowSpan       | (rowData: any) => number                         | Merges rows on the specified column.                                                                        |
| sortable      | boolean                                          | Sortable                                                                                                    |
| treeCol       | boolean                                          | A column of a tree.                                                                                         |
| verticalAlign | enum: 'top', 'middle', 'bottom'                  | Vertical alignment                                                                                          |
| width         | number                                           | Column width                                                                                                |
| fullText      | boolean                                          | Whether to display the full text of the cell content when the mouse is hovered                              |

> `sortable` is used to define whether the column is sortable, but depending on what `key` sort needs to set a `dataKey` in `Cell`.
> The sort here is the service-side sort, so you need to handle the logic in the ' Onsortcolumn ' callback function of `<Table>`, and the callback function returns `sortColumn`, `sortType` values.

### `<ColumnGroup>`

| Property          | Type `(Default)`                | Description                                                                                             |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| align             | enum: 'left','center','right'   | Alignment                                                                                               |
| fixed             | boolean, 'left', 'right'        | Fixed column                                                                                            |
| groupHeaderHeight | number                          | The height of the header of the merged cell group. The default value is 50% of the table `headerHeight` |
| header            | React.ReactNode                 | Group header                                                                                            |
| verticalAlign     | enum: 'top', 'middle', 'bottom' | Vertical alignment                                                                                      |

### `<HeaderCell>`

| Property       | Type `(Default)`              | Description                                  |
| -------------- | ----------------------------- | -------------------------------------------- |
| children       | React.ReactNode               | The table column header displays the content |
| renderSortIcon | (sortType) => React.ReactNode | Custom render sort icons on column headers   |

### `<Cell>`

| Property | Type `(Default)` | Description                                  |
| -------- | ---------------- | -------------------------------------------- |
| dataKey  | string           | Data binding `key`, but also a sort of `key` |
| rowData  | object           | Row data                                     |
| rowIndex | number           | Row number                                   |

#### There are three ways to use `<Cell>`, as follows:

- 1.Associate the fields in the data with `dataKey`.

```tsx
<Column width="{100}" align="center">
  <HeaderCell>Name</HeaderCell>
  <Cell dataKey="name" />
</Column>
```

- 2.Customize a `<Cell>`.

```tsx
const NameCell = ({ rowData, ...props }) => (
  <Cell {...props}>
    <a href={`mailto:${rowData.email}`}>{rowData.name}<a>
  </Cell>
);

<Column width={100} align="center">
  <HeaderCell>Name</HeaderCell>
  <NameCell />
</Column>
```

- 3.Customize functions directly within the `<Cell>`.

```tsx
<Column width={100} align="center">
  <HeaderCell>Name</HeaderCell>
  <Cell>
    {(rowData, rowIndex) => {
      return <a href={`mailto:${rowData.email}`}>{rowData.name}</a>;
    }}
  </Cell>
</Column>
```

(For nested data read this: https://github.com/rsuite/rsuite-table/issues/158)

## Methods

- scrollTop(top:number = 0)
- scrollLeft(left:number = 0)

[npm-badge]: https://img.shields.io/npm/v/rsuite-table.svg?style=flat-square
[npm]: https://www.npmjs.com/package/rsuite-table
[build-badge]: https://img.shields.io/travis/rsuite/rsuite-table.svg?style=flat-square
[build]: https://travis-ci.org/rsuite/rsuite-table
[coverage-badge]: https://img.shields.io/coveralls/rsuite/rsuite-table.svg?style=flat-square
[coverage]: https://coveralls.io/github/rsuite/rsuite-table

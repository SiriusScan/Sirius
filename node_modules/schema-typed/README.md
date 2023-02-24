# schema-typed

Schema for data modeling & validation

[![npm][npm-badge]][npm] [![GitHub Actions][actions-svg]][actions-home] [![Coverage Status][soverage-svg]][soverage]

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [Getting Started](#getting-started)
  - [Multiple verification](#multiple-verification)
  - [Custom verification](#custom-verification)
    - [Multi-field cross validation](#multi-field-cross-validation)
    - [Asynchronous check](#asynchronous-check)
  - [Validate nested objects](#validate-nested-objects)
  - [Combine](#combine)
- [API](#api)
  - [SchemaModel](#schemamodel)
    - [`static combine(...models)`](#static-combinemodels)
    - [`check(data: object)`](#checkdata-object)
    - [`checkAsync(data: object)`](#checkasyncdata-object)
    - [`checkForField(fieldName: string, data: object)`](#checkforfieldfieldname-string-data-object)
    - [`checkForFieldAsync(fieldName: string, data: object)`](#checkforfieldasyncfieldname-string-data-object)
  - [MixedType()](#mixedtype)
    - [`isRequired(errorMessage?: string, trim: boolean = true)`](#isrequirederrormessage-string-trim-boolean--true)
    - [`isRequiredOrEmpty(errorMessage?: string, trim: boolean = true)`](#isrequiredoremptyerrormessage-string-trim-boolean--true)
    - [`addRule(onValid: Function, errorMessage?: string, priority: boolean)`](#addruleonvalid-function-errormessage-string-priority-boolean)
    - [`when(condition: (schemaSpec: SchemaDeclaration<DataType, ErrorMsgType>) => Type)`](#whencondition-schemaspec-schemadeclarationdatatype-errormsgtype--type)
    - [`check(value: ValueType, data?: DataType):CheckResult`](#checkvalue-valuetype-data-datatypecheckresult)
    - [`checkAsync(value: ValueType, data?: DataType):Promise<CheckResult>`](#checkasyncvalue-valuetype-data-datatypepromisecheckresult)
  - [StringType(errorMessage?: string)](#stringtypeerrormessage-string)
    - [`isEmail(errorMessage?: string)`](#isemailerrormessage-string)
    - [`isURL(errorMessage?: string)`](#isurlerrormessage-string)
    - [`isOneOf(items: string[], errorMessage?: string)`](#isoneofitems-string-errormessage-string)
    - [`containsLetter(errorMessage?: string)`](#containslettererrormessage-string)
    - [`containsUppercaseLetter(errorMessage?: string)`](#containsuppercaselettererrormessage-string)
    - [`containsLowercaseLetter(errorMessage?: string)`](#containslowercaselettererrormessage-string)
    - [`containsLetterOnly(errorMessage?: string)`](#containsletteronlyerrormessage-string)
    - [`containsNumber(errorMessage?: string)`](#containsnumbererrormessage-string)
    - [`pattern(regExp: RegExp, errorMessage?: string)`](#patternregexp-regexp-errormessage-string)
    - [`rangeLength(minLength: number, maxLength: number, errorMessage?: string)`](#rangelengthminlength-number-maxlength-number-errormessage-string)
    - [`minLength(minLength: number, errorMessage?: string)`](#minlengthminlength-number-errormessage-string)
    - [`maxLength(maxLength: number, errorMessage?: string)`](#maxlengthmaxlength-number-errormessage-string)
  - [NumberType(errorMessage?: string)](#numbertypeerrormessage-string)
    - [`isInteger(errorMessage?: string)`](#isintegererrormessage-string)
    - [`isOneOf(items: number[], errorMessage?: string)`](#isoneofitems-number-errormessage-string)
    - [`pattern(regExp: RegExp, errorMessage?: string)`](#patternregexp-regexp-errormessage-string-1)
    - [`range(minLength: number, maxLength: number, errorMessage?: string)`](#rangeminlength-number-maxlength-number-errormessage-string)
    - [`min(min: number, errorMessage?: string)`](#minmin-number-errormessage-string)
    - [`max(max: number, errorMessage?: string)`](#maxmax-number-errormessage-string)
  - [ArrayType(errorMessage?: string)](#arraytypeerrormessage-string)
    - [`isRequiredOrEmpty(errorMessage?: string)`](#isrequiredoremptyerrormessage-string)
    - [`rangeLength(minLength: number, maxLength: number, errorMessage?: string)`](#rangelengthminlength-number-maxlength-number-errormessage-string-1)
    - [`minLength(minLength: number, errorMessage?: string)`](#minlengthminlength-number-errormessage-string-1)
    - [`maxLength(maxLength: number, errorMessage?: string)`](#maxlengthmaxlength-number-errormessage-string-1)
    - [`unrepeatable(errorMessage?: string)`](#unrepeatableerrormessage-string)
    - [`of(type: object)`](#oftype-object)
  - [DateType(errorMessage?: string)](#datetypeerrormessage-string)
    - [`range(min: Date, max: Date, errorMessage?: string)`](#rangemin-date-max-date-errormessage-string)
    - [`min(min: Date, errorMessage?: string)`](#minmin-date-errormessage-string)
    - [`max(max: Date, errorMessage?: string)`](#maxmax-date-errormessage-string)
  - [ObjectType(errorMessage?: string)](#objecttypeerrormessage-string)
    - [`shape(fields: object)`](#shapefields-object)
  - [BooleanType(errorMessage?: string)](#booleantypeerrormessage-string)
- [⚠️ Notes](#-notes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
npm install schema-typed --save
```

## Usage

### Getting Started

```js
import { SchemaModel, StringType, DateType, NumberType, ObjectType, ArrayType } from 'schema-typed';

const model = SchemaModel({
  username: StringType().isRequired('Username required'),
  email: StringType().isEmail('Email required'),
  age: NumberType('Age should be a number').range(18, 30, 'Over the age limit'),
  tags: ArrayType().of(StringType('The tag should be a string').isRequired()),
  role: ObjectType().shape({
    name: StringType().isRequired('Name required'),
    permissions: ArrayType().isRequired('Permissions required')
  })
});

const checkResult = model.check({
  username: 'foobar',
  email: 'foo@bar.com',
  age: 40,
  tags: ['Sports', 'Games', 10],
  role: { name: 'administrator' }
});

console.log(checkResult);
```

`checkResult` return structure is:

```js
{
  username: { hasError: false },
  email: { hasError: false },
  age: { hasError: true, errorMessage: 'Over the age limit' },
  tags: {
    hasError: true,
    array: [
      { hasError: false },
      { hasError: false },
      { hasError: true, errorMessage: 'The tag should be a string' }
    ]
  },
  role: {
    hasError: true,
    object: {
      name: { hasError: false },
      permissions: { hasError: true, errorMessage: 'Permissions required' }
    }
  }
};
```

### Multiple verification

```js
StringType()
  .minLength(6, "Can't be less than 6 characters")
  .maxLength(30, 'Cannot be greater than 30 characters')
  .isRequired('This field required');
```

### Custom verification

Customize a rule with the `addRule` function.

If you are validating a string type of data, you can set a regular expression for custom validation by the `pattern` method.

```js
const model = SchemaModel({
  field1: StringType().addRule((value, data) => {
    return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
  }, 'Please enter legal characters'),
  field2: StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, 'Please enter legal characters')
});

model.check({ field1: '', field2: '' });

/**
{
  field1: {
    hasError: true,
    errorMessage: 'Please enter legal characters'
  },
  field2: {
    hasError: true,
    errorMessage: 'Please enter legal characters'
  }
};
**/
```

#### Multi-field cross validation

E.g: verify that the two passwords are the same.

```js
const model = SchemaModel({
  password1: StringType().isRequired('This field required'),
  password2: StringType().addRule((value, data) => {
    if (value !== data.password1) {
      return false;
    }
    return true;
  }, 'The passwords are inconsistent twice')
});

model.check({ password1: '123456', password2: 'root' });

/**
{
  password1: { hasError: false },
  password2: {
    hasError: true,
    errorMessage: 'The passwords are inconsistent twice'
  }
}
**/
```

#### Asynchronous check

For example, verify that the mailbox is duplicated

```js
function asyncCheckEmail(email) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (email === 'foo@domain.com') {
        resolve(false);
      } else {
        resolve(true);
      }
    }, 500);
  });
}

const model = SchemaModel({
  email: StringType()
    .isEmail('Please input the correct email address')
    .addRule((value, data) => {
      return asyncCheckEmail(value);
    }, 'Email address already exists')
    .isRequired('This field cannot be empty')
});

model.checkAsync({ email: 'foo@domain.com' }).then(checkResult => {
  console.log(checkResult);
  /**
  {
    email: {
      hasError: true,
      errorMessage: 'Email address already exists'
    }
  };
  **/
});
```

### Validate nested objects

Validate nested objects, which can be defined using the `ObjectType().shape` method. E.g:

```js
const model = SchemaModel({
  id: NumberType().isRequired('This field required'),
  name: StringType().isRequired('This field required'),
  info: ObjectType().shape({
    email: StringType().isEmail('Should be an email'),
    age: NumberType().min(18, 'Age should be greater than 18 years old')
  })
});

const user = {
  id: 1,
  name: '',
  info: { email: 'schema-type', age: 17 }
};

model.check(data);

/**
 {
  "id": { "hasError": false },
  "name": { "hasError": true, "errorMessage": "This field required" },
  "info": {
    "hasError": true,
    "object": {
      "email": { "hasError": true, "errorMessage": "Should be an email" },
      "age": { "hasError": true, "errorMessage": "Age should be greater than 18 years old" }
    }
  }
}
*/
```

### Combine

`SchemaModel` provides a static method `combine` that can be combined with multiple `SchemaModel` to return a new `SchemaModel`.

```js
const model1 = SchemaModel({
  username: StringType().isRequired('This field required'),
  email: StringType().isEmail('Should be an email')
});

const model2 = SchemaModel({
  username: StringType().minLength(7, "Can't be less than 7 characters"),
  age: NumberType().range(18, 30, 'Age should be greater than 18 years old')
});

const model3 = SchemaModel({
  groupId: NumberType().isRequired('This field required')
});

const model4 = SchemaModel.combine(model1, model2, model3);

model4.check({
  username: 'foobar',
  email: 'foo@bar.com',
  age: 40,
  groupId: 1
});
```

## API

### SchemaModel

SchemaModel is a JavaScript schema builder for data model creation and validation.

#### `static combine(...models)`

A static method for merging multiple models.

```js
const model1 = SchemaModel({
  username: StringType().isRequired('This field required')
});

const model2 = SchemaModel({
  email: StringType().isEmail('Please input the correct email address')
});

const model3 = SchemaModel.combine(model1, model2);
```

#### `check(data: object)`

Check whether the data conforms to the model shape definition. Return a check result.

```js
const model = SchemaModel({
  username: StringType().isRequired('This field required'),
  email: StringType().isEmail('Please input the correct email address')
});

model.check({
  username: 'root',
  email: 'root@email.com'
});
```

#### `checkAsync(data: object)`

Asynchronously check whether the data conforms to the model shape definition. Return a check result.

```js
const model = SchemaModel({
  username: StringType()
    .isRequired('This field required')
    .addRule(value => {
      return new Promise(resolve => {
        // Asynchronous processing logic
      });
    }, 'Username already exists'),
  email: StringType().isEmail('Please input the correct email address')
});

model
  .checkAsync({
    username: 'root',
    email: 'root@email.com'
  })
  .then(result => {
    // Data verification result
  });
```

#### `checkForField(fieldName: string, data: object)`

Check whether a field in the data conforms to the model shape definition. Return a check result.

```js
const model = SchemaModel({
  username: StringType().isRequired('This field required'),
  email: StringType().isEmail('Please input the correct email address')
});

const data = {
  username: 'root'
};

model.checkForField('username', data);
```

#### `checkForFieldAsync(fieldName: string, data: object)`

Asynchronously check whether a field in the data conforms to the model shape definition. Return a check result.

```js
const model = SchemaModel({
  username: StringType()
    .isRequired('This field required')
    .addRule(value => {
      return new Promise(resolve => {
        // Asynchronous processing logic
      });
    }, 'Username already exists'),
  email: StringType().isEmail('Please input the correct email address')
});

const data = {
  username: 'root'
};

model.checkForFieldAsync('username', data).then(result => {
  // Data verification result
});
```

### MixedType()

Creates a type that matches all types. All types inherit from this base type.

#### `isRequired(errorMessage?: string, trim: boolean = true)`

```js
MixedType().isRequired('This field required');
```

#### `isRequiredOrEmpty(errorMessage?: string, trim: boolean = true)`

```js
MixedType().isRequiredOrEmpty('This field required');
```

#### `addRule(onValid: Function, errorMessage?: string, priority: boolean)`

```js
MixedType().addRule((value, data) => {
  return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
}, 'Please enter a legal character.');
```

#### `when(condition: (schemaSpec: SchemaDeclaration<DataType, ErrorMsgType>) => Type)`

Define data verification rules based on conditions.

```js
const model = SchemaModel({
  age: NumberType().min(18, 'error'),
  contact: MixedType().when(schema => {
    const checkResult = schema.age.check();
    return checkResult.hasError
      ? StringType().isRequired('Please provide contact information')
      : StringType();
  })
});

/**
{ 
  age: { hasError: false }, 
  contact: { hasError: false } 
}
*/
model.check({ age: 18, contact: '' });

/*
{
  age: { hasError: true, errorMessage: 'error' },
  contact: {
    hasError: true,
    errorMessage: 'Please provide contact information'
  }
}
*/
model.check({ age: 17, contact: '' });
```

#### `check(value: ValueType, data?: DataType):CheckResult`

```js
const type = MixedType().addRule(v => {
  if (typeof v === 'number') {
    return true;
  }
  return false;
}, 'Please enter a valid number');

type.check('1'); //  { hasError: true, errorMessage: 'Please enter a valid number' }
type.check(1); //  { hasError: false }
```

#### `checkAsync(value: ValueType, data?: DataType):Promise<CheckResult>`

```js
const type = MixedType().addRule(v => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (typeof v === 'number') {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
}, 'Please enter a valid number');

type.checkAsync('1').then(checkResult => {
  //  { hasError: true, errorMessage: 'Please enter a valid number' }
});
type.checkAsync(1).then(checkResult => {
  //  { hasError: false }
});
```

### StringType(errorMessage?: string)

Define a string type. Supports all the same methods as [MixedType](#mixedtype).

#### `isEmail(errorMessage?: string)`

```js
StringType().isEmail('Please input the correct email address');
```

#### `isURL(errorMessage?: string)`

```js
StringType().isURL('Please enter the correct URL address');
```

#### `isOneOf(items: string[], errorMessage?: string)`

```js
StringType().isOneOf(['Javascript', 'CSS'], 'Can only type `Javascript` and `CSS`');
```

#### `containsLetter(errorMessage?: string)`

```js
StringType().containsLetter('Must contain English characters');
```

#### `containsUppercaseLetter(errorMessage?: string)`

```js
StringType().containsUppercaseLetter('Must contain uppercase English characters');
```

#### `containsLowercaseLetter(errorMessage?: string)`

```js
StringType().containsLowercaseLetter('Must contain lowercase English characters');
```

#### `containsLetterOnly(errorMessage?: string)`

```js
StringType().containsLetterOnly('English characters that can only be included');
```

#### `containsNumber(errorMessage?: string)`

```js
StringType().containsNumber('Must contain numbers');
```

#### `pattern(regExp: RegExp, errorMessage?: string)`

```js
StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, 'Please enter legal characters');
```

#### `rangeLength(minLength: number, maxLength: number, errorMessage?: string)`

```js
StringType().rangeLength(6, 30, 'The number of characters can only be between 6 and 30');
```

#### `minLength(minLength: number, errorMessage?: string)`

```js
StringType().minLength(6, 'Minimum 6 characters required');
```

#### `maxLength(maxLength: number, errorMessage?: string)`

```js
StringType().maxLength(30, 'The maximum is only 30 characters.');
```

### NumberType(errorMessage?: string)

Define a number type. Supports all the same methods as [MixedType](#mixedtype).

#### `isInteger(errorMessage?: string)`

```js
NumberType().isInteger('It can only be an integer');
```

#### `isOneOf(items: number[], errorMessage?: string)`

```js
NumberType().isOneOf([5, 10, 15], 'Can only be `5`, `10`, `15`');
```

#### `pattern(regExp: RegExp, errorMessage?: string)`

```js
NumberType().pattern(/^[1-9][0-9]{3}$/, 'Please enter a legal character.');
```

#### `range(minLength: number, maxLength: number, errorMessage?: string)`

```js
NumberType().range(18, 40, 'Please enter a number between 18 - 40');
```

#### `min(min: number, errorMessage?: string)`

```js
NumberType().min(18, 'Minimum 18');
```

#### `max(max: number, errorMessage?: string)`

```js
NumberType().max(40, 'Maximum 40');
```

### ArrayType(errorMessage?: string)

Define a array type. Supports all the same methods as [MixedType](#mixedtype).

#### `isRequiredOrEmpty(errorMessage?: string)`

```js
ArrayType().isRequiredOrEmpty('This field required');
```

#### `rangeLength(minLength: number, maxLength: number, errorMessage?: string)`

```js
ArrayType().rangeLength(1, 3, 'Choose at least one, but no more than three');
```

#### `minLength(minLength: number, errorMessage?: string)`

```js
ArrayType().minLength(1, 'Choose at least one');
```

#### `maxLength(maxLength: number, errorMessage?: string)`

```js
ArrayType().maxLength(3, "Can't exceed three");
```

#### `unrepeatable(errorMessage?: string)`

```js
ArrayType().unrepeatable('Duplicate options cannot appear');
```

#### `of(type: object)`

```js
ArrayType().of(StringType('The tag should be a string').isRequired());
```

### DateType(errorMessage?: string)

Define a date type. Supports all the same methods as [MixedType](#mixedtype).

#### `range(min: Date, max: Date, errorMessage?: string)`

```js
DateType().range(
  new Date('08/01/2017'),
  new Date('08/30/2017'),
  'Date should be between 08/01/2017 - 08/30/2017'
);
```

#### `min(min: Date, errorMessage?: string)`

```js
DateType().min(new Date('08/01/2017'), 'Minimum date 08/01/2017');
```

#### `max(max: Date, errorMessage?: string)`

```js
DateType().max(new Date('08/30/2017'), 'Maximum date 08/30/2017');
```

### ObjectType(errorMessage?: string)

Define a object type. Supports all the same methods as [MixedType](#mixedtype).

#### `shape(fields: object)`

```js
ObjectType().shape({
  email: StringType().isEmail('Should be an email'),
  age: NumberType().min(18, 'Age should be greater than 18 years old')
});
```

### BooleanType(errorMessage?: string)

Define a boolean type. Supports all the same methods as [MixedType](#mixedtype).

## ⚠️ Notes

Default check priority:

- 1.isRequired
- 2.All other checks are executed in sequence

If the third argument to addRule is `true`, the priority of the check is as follows:

- 1.addRule
- 2.isRequired
- 3.Predefined rules (if there is no isRequired, value is empty, the rule is not executed)

[npm-badge]: https://img.shields.io/npm/v/schema-typed.svg
[npm]: https://www.npmjs.com/package/schema-typed
[actions-svg]: https://github.com/rsuite/schema-typed/workflows/Node.js%20CI/badge.svg?branch=master
[actions-home]: https://github.com/rsuite/schema-typed/actions/workflows/nodejs-ci.yml
[soverage-svg]: https://coveralls.io/repos/github/rsuite/schema-typed/badge.svg?branch=master
[soverage]: https://coveralls.io/github/rsuite/schema-typed?branch=master

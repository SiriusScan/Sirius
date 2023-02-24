import {
  BooleanType,
  NumberType,
  StringType,
  DateType,
  ArrayType,
  ObjectType,
  Schema,
  SchemaModel
} from '../src';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSING SCENARIO 1: Should not fail if proper check types are used

interface PassObj {
  s: string;
}
interface Pass {
  n?: number;
  b?: boolean;
  s?: string;
  d?: Date;
  a?: Array<string>;
  o: PassObj;
}

const passSchema = new Schema<Pass>({
  n: NumberType(),
  b: BooleanType(),
  s: StringType(),
  d: DateType(),
  a: ArrayType(),
  o: ObjectType()
});

passSchema.check({ a: ['a'], b: false, d: new Date(), n: 0, o: { s: '' }, s: '' });
passSchema.checkAsync({ a: ['a'], b: false, d: new Date(), n: 0, o: { s: '' }, s: '' });
passSchema.checkForField('o', { o: { s: '1' } });
passSchema.checkForFieldAsync('o', { o: { s: '1' } });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSING SCENARIO 2: Should allows combine proper schemas

SchemaModel.combine<{ x: string; y: string }>(
  new Schema<{ x: string }>({ x: StringType() }),
  new Schema<{ y: string }>({ y: StringType() })
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSING SCENARIO 3: Should allows adding custom rules which have proper types on callback

SchemaModel<{ password1: string; password2: string }>({
  password1: StringType(),
  password2: StringType().addRule(
    (value, data) => value.toLowerCase() === data.password1.toLowerCase()
  )
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSING SCENARIO 4: Should allows to use custom error message type
SchemaModel<{ a: string }, number>({
  a: StringType<{ a: string }, number>().addRule(() => ({
    hasError: true,
    errorMessage: 500
  }))
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSING SCENARIO 5: Should allows to use NumberType on string field
SchemaModel<{ a: string }>({
  a: NumberType<{ a: string }>()
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSING SCENARIO 6: Should allows to use DataType on string field
SchemaModel<{ a: string }>({
  a: DateType<{ a: string }>()
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PASSING SCENARIO 7: Should allow other types to be included in ArrayType

ArrayType().of(NumberType());
ArrayType().of(ObjectType());
ArrayType().of(ArrayType());
ArrayType().of(BooleanType());
ArrayType().of(StringType());
ArrayType().of(DateType());

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 1: Should fail if type check is not matching declared type

interface F1 {
  a: string;
}
new Schema<F1>({
  // $ExpectError
  a: BooleanType()
  // TS2322: Type 'BooleanType<F1, string>' is not assignable to type 'StringType<F1, string> | DateType<F1, string> | NumberType<F1, string>'.
  //   Type 'BooleanType<F1, string>' is missing the following properties from type 'NumberType<F1, string>': isInteger, pattern, isOneOf, range, and 2 more.
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 2: Should fail if checks declaration provides check for undeclared property

interface F2 {
  a: string;
}
new Schema<F2>({
  // $ExpectError
  b: NumberType()
  // TS2345: Argument of type '{ b: NumberType<any>; }' is not assignable to parameter of type 'SchemaDeclaration<F2>'.
  //   Object literal may only specify known properties, and 'b' does not exist in type 'SchemaDeclaration<F2>'.
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 3: Should fail if custom rule check will not fallow proper type for value

interface F3 {
  a: string;
}
new Schema<F3>({
  // $ExpectError
  a: StringType().addRule((v: number) => true)
  // TS2345: Argument of type '(v: number) => true' is not assignable to parameter of type '(value: string, data: any) => boolean | void | CheckResult<string> | Promise<boolean> | Promise<void> | Promise<CheckResult<string>>'.
  //   Types of parameters 'v' and 'value' are incompatible.
  //     Type 'string' is not assignable to type 'number'.
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 4: Should fail if custom rule check will not fallow proper type for data

interface F4 {
  a: string;
}
new Schema<F4>({
  // $ExpectError
  a: StringType<F4>().addRule((v: string, d: number) => true)
  // TS2345: Argument of type '(v: string, d: number) => true' is not assignable to parameter of type '(value: string, data: F4) => boolean | void | CheckResult<string> | Promise<boolean> | Promise<void> | Promise<CheckResult<string>>'.
  //   Types of parameters 'd' and 'data' are incompatible.
  //     Type 'F4' is not assignable to type 'number'.
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 5: Should fail if check and checkAsync function is called with not matching type

interface F5 {
  a: string;
}
const schemaF5 = new Schema<F5>({
  a: StringType()
});

// $ExpectError
schemaF5.check({ c: 12 });
// TS2345: Argument of type '{ c: number; }' is not assignable to parameter of type 'F5'.
//   Object literal may only specify known properties, and 'c' does not exist in type 'F5'.

// $ExpectError
schemaF5.checkAsync({ c: 12 });
// TS2345: Argument of type '{ c: number; }' is not assignable to parameter of type 'F5'.
//   Object literal may only specify known properties, and 'c' does not exist in type 'F5'.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 6: Should fail if checkForField function is called with non existing property name

interface F6 {
  a: string;
}
const schemaF6 = new Schema<F6>({
  a: StringType()
});

// $ExpectError
schemaF6.checkForField('c', 'a');
// TS2345: Argument of type '"c"' is not assignable to parameter of type '"a"'.

// $ExpectError
schemaF6.checkForFieldAsync('c', 'a');
// TS2345: Argument of type '"c"' is not assignable to parameter of type '"a"'.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 7: Should fail if check and checkAsync function is called with not matching type, when type is inferred

const schemaF7 = new Schema({
  a: StringType()
});

// $ExpectError
schemaF7.check({ c: 12 });
// TS2345: Argument of type '{ c: number; }' is not assignable to parameter of type '{ a: unknown; }'.
//   Object literal may only specify known properties, and 'c' does not exist in type '{ a: unknown; }'.

// $ExpectError
schemaF7.checkAsync({ c: 12 });
// TS2345: Argument of type '{ c: number; }' is not assignable to parameter of type '{ a: unknown; }'.
//   Object literal may only specify known properties, and 'c' does not exist in type '{ a: unknown; }'.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 8: Should fail if checkForField function is called with non existing property name, when type is inferred

const schemaF8 = new Schema({
  a: StringType()
});

// $ExpectError
schemaF8.checkForField('c', { a: 'str' });
// TS2345: Argument of type '"c"' is not assignable to parameter of type '"a"'.

// $ExpectError
schemaF8.checkForFieldAsync('c', { a: 'str' });
// TS2345: Argument of type '"c"' is not assignable to parameter of type '"a"'.

// $ExpectError
schemaF8.checkForField('a', { c: 'str' });
// TS2345: Argument of type '{ c: string; }' is not assignable to parameter of type '{ a: unknown; }'.

// $ExpectError
schemaF8.checkForFieldAsync('a', { c: 'str' });
// TS2345: Argument of type '{ c: string; }' is not assignable to parameter of type '{ a: unknown; }'.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FAIL SCENARIO 9: Should fail if ObjectType will get not matched shape

interface F9 {
  a: string;
}
ObjectType<F9>().shape({
  // $ExpectError
  a: BooleanType()
  // TS2322: Type 'BooleanType<F9, string>' is not assignable to type 'StringType<F9, string> | DateType<F9, string> | NumberType<F9, string>'.
  //   Type 'BooleanType<F9, string>' is missing the following properties from type 'NumberType<F9, string>': isInteger, pattern, isOneOf, range, and 2 more.
});
ObjectType<F9>().shape({
  // $ExpectError
  b: NumberType()
  // TS2345: Argument of type '{ b: NumberType<any>; }' is not assignable to parameter of type 'SchemaDeclaration<F9>'.
  //   Object literal may only specify known properties, and 'b' does not exist in type 'SchemaDeclaration<F9>'.
});

interface F10 {
  a: {
    b: number;
  };
}
const schemaF10 = new Schema<F10>({
  a: ObjectType().shape({
    b: NumberType()
  })
});

schemaF10.check({ a: { b: 1 } });

// $ExpectError
const checkResultF10 = schemaF10.check({ a: { b: '1' } });

checkResultF10.a.object?.b.errorMessage;
checkResultF10.a.object?.b.hasError;

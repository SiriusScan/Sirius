declare function makeEmptyFunction(arg: any): () => any;
declare function emptyFunction(): void;
declare namespace emptyFunction {
    var thatReturns: typeof makeEmptyFunction;
    var thatReturnsFalse: () => any;
    var thatReturnsTrue: () => any;
    var thatReturnsNull: () => any;
    var thatReturnsThis: () => undefined;
    var thatReturnsArgument: (arg: any) => any;
}
export default emptyFunction;

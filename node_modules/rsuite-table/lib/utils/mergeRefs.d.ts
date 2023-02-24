import React from 'react';
declare type CallbackRef<T> = (ref: T | null) => void;
declare type Ref<T> = React.MutableRefObject<T> | CallbackRef<T>;
export default function mergeRefs<T>(refA?: Ref<T | null> | null, refB?: Ref<T | null> | null): React.RefCallback<T>;
export {};

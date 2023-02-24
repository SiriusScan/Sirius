/// <reference types="react" />
/**
 * A hook for controlled value management.
 * In the case of passing the controlled value, the controlled value is returned, otherwise the value in state is returned.
 * Generally used for a component including controlled and uncontrolled modes.
 * @param controlledValue
 * @param defaultValue
 * @param formatValue
 */
declare function useControlled<T = undefined>(controlledValue?: T, defaultValue?: T): [T, (value: React.SetStateAction<T>) => void, boolean];
export default useControlled;

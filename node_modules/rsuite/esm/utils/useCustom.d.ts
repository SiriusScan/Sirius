import { CustomValue } from '../CustomProvider/CustomProvider';
/**
 * A hook to get custom configuration of `<CustomProvider>`
 * @param keys
 */
declare function useCustom<T = any>(keys?: string | string[], overrideLocale?: any): CustomValue<T>;
export default useCustom;

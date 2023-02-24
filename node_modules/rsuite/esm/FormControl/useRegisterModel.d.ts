import type { FieldRuleType } from '../Form/useSchemaModel';
import type { CheckType } from 'schema-typed';
declare function useRegisterModel(name: string, pushFieldRule: (n: string, r: FieldRuleType) => void, removeFieldRule: (n: string) => void, rule?: CheckType<unknown, any>): void;
export default useRegisterModel;

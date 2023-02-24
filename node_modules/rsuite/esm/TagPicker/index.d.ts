import { InputPickerProps, TriggerType } from '../InputPicker/InputPicker';
import type { PickerComponent } from '../Picker/types';
import type { TagProps } from '../Tag';
export interface TagPickerProps extends InputPickerProps {
    /**  Tag related props. */
    tagProps?: TagProps;
    /**
     * Set the trigger for creating tags. only valid when creatable
     */
    trigger?: TriggerType | TriggerType[];
}
declare const TagPicker: PickerComponent<TagPickerProps>;
export default TagPicker;

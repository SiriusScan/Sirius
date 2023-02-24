import { InputProps } from '../Input';
import type { TextMaskProps } from './TextMask';
import { RsRefForwardingComponent } from '../@types/common';
export declare type MaskedInputProps = Omit<TextMaskProps, 'onChange'> & Omit<InputProps, 'type'>;
declare const MaskedInput: RsRefForwardingComponent<'input', MaskedInputProps>;
export default MaskedInput;

import * as Icons from '@icon-park/vue-next';

export interface SelectOption {
   label: string;
   value: any;
   disabled?: boolean;
   icon?: keyof typeof Icons;
}

export const TOGGLE_OPTION_INJECT_KEY = Symbol('toggleOption');

export type ToggleOption = (value: any) => void;

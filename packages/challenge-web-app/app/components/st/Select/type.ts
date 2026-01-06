import type { DefineComponent } from 'vue';

export interface ISelectOption {
   label: string;
   value: any;
   disabled?: boolean;
   icon?: DefineComponent;
   imageUrl?: string;
   description?: string;
}

export const TOGGLE_OPTION_INJECT_KEY = Symbol('toggleOption');

export type ToggleOption = (value: any) => void;

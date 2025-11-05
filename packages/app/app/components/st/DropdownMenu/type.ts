import type { DefineComponent } from 'vue';

export type MenuItem = {
   icon?: DefineComponent;
   label: string;
   action: () => void;
};

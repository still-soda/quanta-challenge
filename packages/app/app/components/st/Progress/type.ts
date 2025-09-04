import type { DefineComponent } from 'vue';

export interface IProgressStep {
   status: Status;
   Icon?: DefineComponent;
   title?: string;
   color?: string;
}

export type Status = 'waiting' | 'inProgress' | 'completed' | 'error';

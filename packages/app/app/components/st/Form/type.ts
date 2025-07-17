export type FormItemStatus = 'default' | 'error' | 'success';

export interface IAssignFormItemOptions {
   name: string;
   setStatus: (status: FormItemStatus) => void;
}

export const assignFormItemKey = Symbol('assignFormItem');

export interface IRule {
   name: string;
   required?: boolean;
   validator?: (value: any) => boolean;
}

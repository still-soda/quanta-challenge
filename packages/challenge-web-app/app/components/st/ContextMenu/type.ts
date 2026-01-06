export type ContextMenuStatus = 'opened' | 'closed';

export type ContextMenuPosition = { x: number; y: number };

export enum ContextMenuButton {
   LEFT = 0,
   MIDDLE = 1,
   RIGHT = 2,
}

export type ContextMenuProvideValue = {
   status: Ref<ContextMenuStatus>;
   position: Ref<ContextMenuPosition>;
   targetElement: Ref<HTMLElement | null>;
};

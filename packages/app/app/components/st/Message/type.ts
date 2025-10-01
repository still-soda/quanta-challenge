import type { DefineComponent } from 'vue';

export type PlacementHorizontal = 'left' | 'center' | 'right';
export type PlacementVertical = 'top' | 'center' | 'bottom';
export type Placement =
   | `${PlacementVertical}-${PlacementHorizontal}`
   | 'center';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export type Message = {
   id: string;
   title: string;
   content?: string | DefineComponent;
   type?: MessageType;
   closeText?: string;
   closable?: boolean;
   minWidth?: number | string;
   placement?: Placement;
   duration?: number;
   loading?: boolean;
};

export type AddMessageOptions = Omit<Message, 'id'>;

export type MessageOperation = {
   id: string;
   message: Message;
   close: () => void;
   unloading: () => void;
   closed: boolean;
};

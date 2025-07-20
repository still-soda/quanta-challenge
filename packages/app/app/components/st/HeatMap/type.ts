export interface HeatMapData {
   data: string;
   submissions: number;
}

export interface HeatMapProps {
   currentYear: number;
   data: Array<HeatMapData>;
   rows?: number;
   loading?: boolean;
}

export const monthText = [
   '一月',
   '二月',
   '三月',
   '四月',
   '五月',
   '六月',
   '七月',
   '八月',
   '九月',
   '十月',
   '十一月',
   '十二月',
] as const;

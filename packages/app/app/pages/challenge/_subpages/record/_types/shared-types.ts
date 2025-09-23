import { $Enums } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';

export type CommitRecordType = {
   id: number;
   createdAt: string;
   result: $Enums.JudgeResult;
};

export type CommitDetailType = {
   user: {
      name: string | null;
      avatar: {
         name: string;
         createdAt: Date;
         updatedAt: Date;
         id: string;
         thumbhash: string | null;
         refCount: number;
      } | null;
   };
   info: JsonValue;
   result: $Enums.JudgeResult;
   createdAt: string;
   problem: {
      pid: number;
      title: string;
   };
   id: number;
   score: number;
   pendingTime: number;
   judgingTime: number;
};

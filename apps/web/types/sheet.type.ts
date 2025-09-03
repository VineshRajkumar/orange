
import type { draw_elementsType, Action } from "@repo/backend-common";
export type { draw_elementsType, Action };

export type SheetDataType = {
  title: string;
  data: draw_elementsType[] | null;
  ownerId: string;
  roomId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SheetWithId = SheetDataType & { id: string };

export type loadDataType = {
    id: string
    sheets: SheetWithId[]
    username: string
}


import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SheetDataType } from "@/types/sheet.type";


type SheetStore = {
  // sheetData will be like
  // sheetData = {
  //   sheetId1: { title: "...", data: [...], ... },
  //   sheetId2: { title: "...", data: [...], ... },
  // };

  sheetData: Record<string, SheetDataType>;
  getSheets: () => void;
  getSheet: (id: string) => SheetDataType | undefined;
  saveSheet: (id: string, sheet: SheetDataType) => void;
  saveSheets: (sheets: Record<string, SheetDataType>) => void;
  deleteSheet: (id: string) => void;
};

//persist is used to revent any changes when the page is constantly refreshed -> so that if user is logged in it will save its data
//Note :- persist stores data in localstore so dont store cookies or sentive info

export const useSheetStore = create(
  persist<SheetStore>(
    (set, get) => ({
      sheetData: {},

      getSheets: () => {
        return get().sheetData;
      },
      getSheet: (id) => {
        return get().sheetData[id];
      },
      saveSheet: (id, sheet) => {
        set((state) => ({
          sheetData: {
            ...state.sheetData,
            [id]: sheet,
          },
        }));
      },
      saveSheets: (sheets) => {
        set({ sheetData: sheets });
      },
      deleteSheet: (id) => {
        const getSheet = get().sheetData;
        const newSheetData = { ...getSheet };
        delete newSheetData[id];
        set({ sheetData: newSheetData });
      }
    }),
    {
      name: "sheetStorage", //name of localstorage
    }
  )
);

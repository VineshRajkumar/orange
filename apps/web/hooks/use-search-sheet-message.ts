import { SheetDataType } from "@/types/sheet.type";
import { useEffect } from "react";

export const useSearchSheetMessage = (
    { sheetData, setsearchMessage} : 
    {
        sheetData:Record<string, SheetDataType> 
        setsearchMessage: React.Dispatch<React.SetStateAction<string>>
    }) => {

  useEffect(() => {
    if (Object.keys(sheetData).length > 0) {
      setsearchMessage(
        `Found ${Object.keys(sheetData).length} sheet${Object.keys(sheetData).length > 1 ? "s" : ""}`
      );
    }
  }, [sheetData,setsearchMessage]);

};

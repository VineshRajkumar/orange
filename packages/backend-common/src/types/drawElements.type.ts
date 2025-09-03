

export interface draw_elementsType {
    id: string,
    type: "rectangle" | "diamond" | "circle" | "line" | "arrow" | "text" | "freeHand";
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number,
    strokeColor: string, //border -> strokestyle
    fillStyle?: string, //baclground
    strokeWidth: number, //1.25,2.5,3.75 -> lineWidth 
    font: string,
    fontSize: string,
    text: string;
    points: { x: number; y: number }[]; //control points where user can bend the shape
}

// export interface Action {
//   type: "create" | "move" | "resize" | "erase" | "edit";
//   originalDraw: draw_elementsType | null;
//   modifiedDraw: draw_elementsType | null;
// }
export interface Action {
  element: draw_elementsType | null;
  userId: string;
  username: string
  removeShape: boolean 
}

export interface Payload {
  element: draw_elementsType;
  removeShape?: boolean
}
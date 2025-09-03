import { draw_elementsType } from "@/types/sheet.type";
import { Payload } from "@repo/backend-common";


export const broadcastAction = (
  action: Payload,
  socket: WebSocket
) => {
  
  socket.send(
    JSON.stringify({
      event: "broadcast-shape",
      payload: action,
    })
  );
  
};

export const performAction = (action: draw_elementsType | draw_elementsType[] , diagrams: draw_elementsType[], removeShape: boolean = false) => {
  console.log(action)
  if (removeShape) {

    if (!Array.isArray(action)) {
 
      const idx = diagrams.findIndex(d => d.id === action.id);

      if (idx !== -1) diagrams.splice(idx, 1);
     
    }

  } else {

    if (Array.isArray(action)) diagrams.push(...action)
    else{
      //if updations are hapening then remove the previous diagram first then add the new position diagram 
      //if new diagram then just push 
      const idx = diagrams.findIndex(d => d.id === action.id);
      if (idx !== -1) {
        // console.log('shape was present so removing it ')
        diagrams.splice(idx, 1);
      }
      diagrams.push(action);
    }

  }
  
  return diagrams;

};

export const cleanElement = (element: draw_elementsType) => {
  if (!element) return element;

  switch (element.type) {
    case "freeHand": {
        // removing x1,y1,x2,y2 for freehand as they are not needed 
        // dont remove this below eslint since x1,y1,x2,y2 are not being used it is 
        // giving a warning and i dont want to disturb the format so just
        // disabling eslint here 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { x1, y1, x2, y2, ...rest } = element;
        return rest;
    }
    case "text": {
        // removing x2,y2 for text as they are not needed 
        // dont remove this below eslint since x2,y2 are not being used it is 
        // giving a warning and i dont want to disturb the format so just
        // disabling eslint here 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { x2, y2, ...rest } = element;
        return rest;
    }
    default:
        return element;
  }
};


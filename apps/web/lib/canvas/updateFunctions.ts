//resource reffered from :- https://github.com/HarshitBreaksProd/meetdraw/blob/9242fb5b36a1f4954595ff7a981fcc51abac3cc9/apps/web/lib/canvas/updateFunctions.ts

import { draw_elementsType } from "@/types/sheet.type";

//RESIZE FUNCTION :- 
//The resizeDraw function updates the dimensions or points of a selected shape based on user interaction 
//Like increasing/decreasing size of shape from one point 
export function resizeDraw(
  position:   // which handle was dragged 
    | "topLeft"
    | "topRight"
    | "bottomRight"
    | "bottomLeft"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | `point-${number}`,
  x: number, // current mouse position x coordinate
  y: number, // current mouse position y coordinate
  selectedDraw: draw_elementsType, // the shape being increased/decreased
  diagrams: draw_elementsType[], // array of all shapes for redrawing once the selected shape size is increased/decreased
  
  //only for arrow/line beacuse in arrow/line only one point moves so only resize(increased/decreased) that no need to resize the whole arrow 
  //start means the arrow head direction , end means the tail , point means the control point between 
  farthestPointsInfo: { 
    farthestLeftPoint: { point: "start" | "end" | "point"; x: number };
    farthestRightPoint: { point: "start" | "end" | "point"; x: number };
    farthestTopPoint: { point: "start" | "end" | "point"; y: number };
    farthestBottomPoint: { point: "start" | "end" | "point"; y: number };
  } | null,

  //only for freeHand draws with pen/pencil tool 
  //initialPoint is where the resizeing started 
  //orginal point is an array of {x,y} which has a different points from where it bends this is needed to resize that all -> [{ x, y }, { x, y }, ...] 
  intialPointsForFreeHandMove?: {
    initialPoint: { x: number; y: number };
    originalPoints: { x: number; y: number }[];
  } | null
): draw_elementsType | null {

  // 1) Rectangles, Circles, Diamonds -> Adjusts corner or edge coordinates depending on the dragged position.
  if (
    selectedDraw.type === "rectangle" ||
    selectedDraw.type === "diamond" ||
    selectedDraw.type === "circle"
  ) {
    switch (position) {
      case "topLeft":
        selectedDraw.x1 = x;
        selectedDraw.y1 = y;
        break;
      case "topRight":
        selectedDraw.x2 = x;
        selectedDraw.y1 = y;
        break;
      case "bottomRight":
        selectedDraw.x2 = x;
        selectedDraw.y2 = y;
        break;
      case "bottomLeft":
        selectedDraw.x1 = x;
        selectedDraw.y2 = y;
        break;
      case "left":
        selectedDraw.x1 = x;
        break;
      case "right":
        selectedDraw.x2 = x;
        break;
      case "top":
        selectedDraw.y1 = y;
        break;
      case "bottom":
        selectedDraw.y2 = y;
        break;
    }
  }
  //2) Lines and Arrows :- 
  //    a) Drag a point handle (point-0, point-1, etc.)
  //    b) Resize from a side/corner using farthestPointsInfo
  if (selectedDraw.type === "line" || selectedDraw.type === "arrow") {
    if (position.includes("point")) {
      const index = parseInt(position.split("-")[1]!);
      switch (index) {
        case 0:
          selectedDraw.x1 = x;
          selectedDraw.y1 = y;
          break;
        case 1:
          selectedDraw.points![0] = {
            x: x,
            y: y,
          };
          break;
        case 2:
          selectedDraw.x2 = x;
          selectedDraw.y2 = y;
          break;
      }
    }
    if (farthestPointsInfo) {
      switch (position) {
        case "topLeft":
          if (farthestPointsInfo.farthestLeftPoint?.point === "start") {
            selectedDraw.x1 = x;
          } else if (farthestPointsInfo.farthestLeftPoint?.point === "end") {
            selectedDraw.x2 = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestTopPoint?.point === "start") {
            selectedDraw.y1 = y;
          } else if (farthestPointsInfo.farthestTopPoint?.point === "end") {
            selectedDraw.y2 = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "topRight":
          if (farthestPointsInfo.farthestRightPoint?.point === "start") {
            selectedDraw.x1 = x;
          } else if (farthestPointsInfo.farthestRightPoint?.point === "end") {
            selectedDraw.x2 = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestTopPoint?.point === "start") {
            selectedDraw.y1 = y;
          } else if (farthestPointsInfo.farthestTopPoint?.point === "end") {
            selectedDraw.y2 = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "bottomRight":
          if (farthestPointsInfo.farthestRightPoint?.point === "start") {
            selectedDraw.x1 = x;
          } else if (farthestPointsInfo.farthestRightPoint?.point === "end") {
            selectedDraw.x2 = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestBottomPoint?.point === "start") {
            selectedDraw.y1 = y;
          } else if (farthestPointsInfo.farthestBottomPoint?.point === "end") {
            selectedDraw.y2 = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "bottomLeft":
          if (farthestPointsInfo.farthestLeftPoint?.point === "start") {
            selectedDraw.x1 = x;
          } else if (farthestPointsInfo.farthestLeftPoint?.point === "end") {
            selectedDraw.x2 = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestBottomPoint?.point === "start") {
            selectedDraw.y1 = y;
          } else if (farthestPointsInfo.farthestBottomPoint?.point === "end") {
            selectedDraw.y2 = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "left":
          if (farthestPointsInfo.farthestLeftPoint?.point === "start") {
            selectedDraw.x1 = x;
          } else if (farthestPointsInfo.farthestLeftPoint?.point === "end") {
            selectedDraw.x2 = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          break;
        case "right":
          if (farthestPointsInfo.farthestRightPoint?.point === "start") {
            selectedDraw.x1 = x;
          } else if (farthestPointsInfo.farthestRightPoint?.point === "end") {
            selectedDraw.x2 = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          break;
        case "top":
          if (farthestPointsInfo.farthestTopPoint?.point === "start") {
            selectedDraw.y1 = y;
          } else if (farthestPointsInfo.farthestTopPoint?.point === "end") {
            selectedDraw.y2 = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "bottom":
          if (farthestPointsInfo.farthestBottomPoint?.point === "start") {
            selectedDraw.y1 = y;
          } else if (farthestPointsInfo.farthestBottomPoint?.point === "end") {
            selectedDraw.y2 = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
      }
    }
  }

  //3) Freehand :- 
  //  a) points array is rescaled proportionally based on 
  //      i) originalPoints
  //      ii) Bounding box (farthestLeft, farthestTop, etc.)
  //      iii) Current cursor (x, y)

  if (
    selectedDraw.type === "freeHand" &&
    intialPointsForFreeHandMove?.originalPoints
  ) {
    const farthestLeft = Math.min(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.x)
    );
    const farthestRight = Math.max(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.x)
    );
    const farthestTop = Math.min(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.y)
    );
    const farthestBottom = Math.max(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.y)
    );

    const originalWidth = farthestRight - farthestLeft;
    const originalHeight = farthestBottom - farthestTop;

    switch (position) {
      case "left": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = farthestRight - x;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestRight;
            point.x = farthestRight + dx * scaleX;
          }
        });
        break;
      }
      case "right": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = x - farthestLeft;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestLeft;
            point.x = farthestLeft + dx * scaleX;
          }
        });
        break;
      }
      case "top": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = farthestBottom - y;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestBottom;
            point.y = farthestBottom + dy * scaleY;
          }
        });
        break;
      }
      case "bottom": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = y - farthestTop;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestTop;
            point.y = farthestTop + dy * scaleY;
          }
        });
        break;
      }
      case "topLeft": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = farthestRight - x;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestRight;
            point.x = farthestRight + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = farthestBottom - y;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestBottom;
            point.y = farthestBottom + dy * scaleY;
          }
        });
        break;
      }
      case "topRight": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = x - farthestLeft;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestLeft;
            point.x = farthestLeft + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = farthestBottom - y;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestBottom;
            point.y = farthestBottom + dy * scaleY;
          }
        });
        break;
      }
      case "bottomRight": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = x - farthestLeft;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestLeft;
            point.x = farthestLeft + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = y - farthestTop;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestTop;
            point.y = farthestTop + dy * scaleY;
          }
        });
        break;
      }
      case "bottomLeft": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = farthestRight - x;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestRight;
            point.x = farthestRight + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = y - farthestTop;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestTop;
            point.y = farthestTop + dy * scaleY;
          }
        });
        break;
      }
    }
  }

  //4) Text :- Only vertical resizing (changes font size only).
  if (selectedDraw.type === "text") {
    const fontSize = Math.max(10, selectedDraw.y1! - y);
    selectedDraw.fontSize = fontSize.toString();
  }

  // 5) Finds the current shape in the diagram list and updates it and returns it 
  const ind = diagrams.findIndex((draw) => draw.id === selectedDraw.id);
  diagrams[ind] = selectedDraw;
  return selectedDraw;
}


//Used to calulate farthest left, right, top, and bottom — using: start,middle,end point
// Imagine line :- 
//   (x1, y1)    points[0]     (x2, y2)
//    ●-----------●------------●
//  start       control         end

//Let these have values :- 
// x1 = 50, y1 = 100  → start
// x2 = 200, y2 = 80  → end
// points[0] = { x: 120, y: 60 } → control point (a bend in the line)

//1) Farthest LEFT :- 
//We ask: “Which x-value is smallest?”
  // x1 = 50
  // x2 = 200
  // points[0].x = 120

  // → 50 is the smallest → leftmost point is "start"

//2) Farthest RIGHT
// We ask: “Which x-value is largest?”
  // x1 = 50
  // x2 = 200
  // points[0].x = 120

  // → 200 is largest → rightmost is "end"

//3) Farthest TOP (smaller y is higher up)
  // y1 = 100
  // y2 = 80
  // points[0].y = 60

  // → 60 is smallest → topmost is "point" (control)

//4) Farthest BOTTOM (larger y is lower)
  // y1 = 100
  // y2 = 80
  // points[0].y = 60

  // → 100 is largest → bottommost is "start"

//This info is later used in the resizeDraw function, so when you drag 
// the top-left corner of the selection box, the code knows which actual
//  coordinate (start/end/point) should move.
export function calculateFarthestPoints(selectedDraw: draw_elementsType) {
  if (selectedDraw.type === "line" || selectedDraw.type === "arrow") {
    let farthestLeftPoint: {
      point: "start" | "end" | "point";
      x: number;
    } | null = null;
    let farthestRightPoint: {
      point: "start" | "end" | "point";
      x: number;
    } | null = null;
    let farthestTopPoint: {
      point: "start" | "end" | "point";
      y: number;
    } | null = null;
    let farthestBottomPoint: {
      point: "start" | "end" | "point";
      y: number;
    } | null = null;

    if (
      selectedDraw.x1! <= selectedDraw.x2! &&
      selectedDraw.x1! <= selectedDraw.points![0]!.x
    ) {
      farthestLeftPoint = { point: "start", x: selectedDraw.x1! };
    } else if (
      selectedDraw.x2! <= selectedDraw.x1! &&
      selectedDraw.x2! <= selectedDraw.points![0]!.x
    ) {
      farthestLeftPoint = { point: "end", x: selectedDraw.x2! };
    } else {
      farthestLeftPoint = { point: "point", x: selectedDraw.points![0]!.x };
    }

    if (
      selectedDraw.x1! >= selectedDraw.x2! &&
      selectedDraw.x1! >= selectedDraw.points![0]!.x
    ) {
      farthestRightPoint = { point: "start", x: selectedDraw.x1! };
    } else if (
      selectedDraw.x2! >= selectedDraw.x1! &&
      selectedDraw.x2! >= selectedDraw.points![0]!.x
    ) {
      farthestRightPoint = { point: "end", x: selectedDraw.x2! };
    } else {
      farthestRightPoint = { point: "point", x: selectedDraw.points![0]!.x };
    }

    if (
      selectedDraw.y1! <= selectedDraw.y2! &&
      selectedDraw.y1! <= selectedDraw.points![0]!.y
    ) {
      farthestTopPoint = { point: "start", y: selectedDraw.y1! };
    } else if (
      selectedDraw.y2! <= selectedDraw.y1! &&
      selectedDraw.y2! <= selectedDraw.points![0]!.y
    ) {
      farthestTopPoint = { point: "end", y: selectedDraw.y2! };
    } else {
      farthestTopPoint = { point: "point", y: selectedDraw.points![0]!.y };
    }

    if (
      selectedDraw.y1! >= selectedDraw.y2! &&
      selectedDraw.y1! >= selectedDraw.points![0]!.y
    ) {
      farthestBottomPoint = { point: "start", y: selectedDraw.y1! };
    } else if (
      selectedDraw.y2! >= selectedDraw.y1! &&
      selectedDraw.y2! >= selectedDraw.points![0]!.y
    ) {
      farthestBottomPoint = { point: "end", y: selectedDraw.y2! };
    } else {
      farthestBottomPoint = { point: "point", y: selectedDraw.points![0]!.y };
    }
    return {
      farthestLeftPoint: farthestLeftPoint,
      farthestRightPoint: farthestRightPoint,
      farthestTopPoint: farthestTopPoint,
      farthestBottomPoint: farthestBottomPoint,
    };
  }
  return null;
}

//DRAGGING FUNCTION :- 
//moveDraw function is responsible for moving a selected drawing when user drags on canvas
export function moveDraw(
  x: number, //current mouse position -> x
  y: number,  // current mouse position  -> y
  offsetX: number, // distance from the top-left from the shape to the mouse when drag started -> X
  offsetY: number, // distance from the top-left from the shape to the mouse when drag started -> Y
  selectedDraw: draw_elementsType, // current drawing being moved
  diagrams: draw_elementsType[], // list of all drawings to redraw 
  
  //only for freeHand type 
  //initialPoint is where the drag started 
  //orginal point is an array of {x,y} which has a different points from where it bends this is needed to resize that all  -> [{ x, y }, { x, y }, ...] 
  intialPointsForFreeHandMove?: {
    initialPoint: { x: number; y: number };
    originalPoints: { x: number; y: number }[];
  } | null
): draw_elementsType | null {

  //1) Get the shape (x1,y1) start point of shape 
  const oldx1 = selectedDraw.x1!;
  const oldy1 = selectedDraw.y1!;

  //2) Subtract -> final mouse destination - point where mouse was clicked on the shape before dragging = newx1 and newy1 
  //  we are calculating this because we want the rectangle to follow the mouse — but we still want the cursor to stay 20px right and 10px down from the top-left corner, just like when the user first clicked.
  const newx1 = x - offsetX;
  const newy1 = y - offsetY;
  
  //3) How far the shape moved -> distance 
  const dx = newx1 - oldx1;
  const dy = newy1 - oldy1;

  //4) Update the new position :- 
  // a) For Rectangle, Circle, Diamond :- 
  selectedDraw.x1 = newx1;
  selectedDraw.y1 = newy1;
  selectedDraw.x2! += dx;
  selectedDraw.y2! += dy;
  // b) For Line and Arrow :- moves all inner points consistently with the drag.
  if (
    (selectedDraw.type === "line" || selectedDraw.type === "arrow") &&
    selectedDraw.points
  ) {
    selectedDraw.points = selectedDraw.points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));
  }

  //c) For Freehand Drawings: 
  if (selectedDraw.type === "freeHand" && intialPointsForFreeHandMove) {
    const dx = intialPointsForFreeHandMove.initialPoint.x - x;
    const dy = intialPointsForFreeHandMove.initialPoint.y - y;
    selectedDraw.points = intialPointsForFreeHandMove.originalPoints.map(
      (point) => ({
        x: point.x - dx,
        y: point.y - dy,
      })
    );
  }

  //5) Updates the shape in the diagrams and returns new postiion shape
  const ind = diagrams.findIndex((draw) => draw.id === selectedDraw.id);

  diagrams[ind] = selectedDraw;

  return selectedDraw;
}


//This doesnot draw -> this is only responsible for calculating and returning a selection box object (a rectangle) around a given shape.
// renderSelectionBox is responsible for drawing 
export function handleShapeSelectionBox(
  draw: draw_elementsType,
  ctx: CanvasRenderingContext2D
): draw_elementsType | null {
  let farthestLeft = Math.min(draw.x1!, draw.x2!);
  let farthestRight = Math.max(draw.x1!, draw.x2!);
  let farthestTop = Math.min(draw.y1!, draw.y2!);
  let farthestBottom = Math.max(draw.y1!, draw.y2!);
  switch (draw.type) {

    //1. Rectangles / Circles / Diamonds
    case "rectangle":
    case "circle":
      return {
        ...draw,
        id: "0",
        type: "rectangle", //selection box is a rectangle for circle,rectangle,diamond
        x1: farthestLeft - 5,
        y1: farthestTop - 5,
        x2: farthestRight + 5,
        y2: farthestBottom + 5,
        fillStyle: "transparent",
        strokeColor: "#5588ff",
        strokeWidth: 2,
      };
    case "diamond":
      return {
        ...draw,
        id: "0",
        type: "rectangle",  //selection box is a rectangle for circle,rectangle,diamond
        x1: farthestLeft - 5,
        y1: farthestTop - 5,
        x2: farthestRight + 5,
        y2: farthestBottom + 5,
        fillStyle: "transparent",
        strokeColor: "#5588ff",
        strokeWidth: 2,
      };

    //2)  Line / Arrow :- Finds the bounding box around all 3 points: start, mid (arrow bend), end.
    case "line":
    case "arrow":{
      const p1 = { x: draw.x1!, y: draw.y1! };
      const p2 = { x: draw.points![0]!.x, y: draw.points![0]!.y };
      const p3 = { x: draw.x2!, y: draw.y2! };

      farthestLeft = Math.min(p1.x, p2.x, p3.x);
      farthestRight = Math.max(p1.x, p2.x, p3.x);
      farthestTop = Math.min(p1.y, p2.y, p3.y);
      farthestBottom = Math.max(p1.y, p2.y, p3.y);

      return {
        ...draw,
        id: "1",
        type: "rectangle",
        x1: farthestLeft - 5,
        y1: farthestTop - 5,
        x2: farthestRight + 5,
        y2: farthestBottom + 5,
        fillStyle: "transparent",
        strokeColor: "#5588ff",
        strokeWidth: 2,
        points: [p1, p2, p3],
      };
    }

    //3) Freehand Drawing :- Gets bounding box around all freehand points.
    case "freeHand":{
      const points = draw.points!;
      farthestLeft = Math.min(...points.map((point) => point.x));
      farthestRight = Math.max(...points.map((point) => point.x));
      farthestTop = Math.min(...points.map((point) => point.y));
      farthestBottom = Math.max(...points.map((point) => point.y));
      return {
        ...draw,
        id: "1",
        type: "rectangle",
        x1: farthestLeft - 5,
        y1: farthestTop - 5,
        x2: farthestRight + 5,
        y2: farthestBottom + 5,
        fillStyle: "transparent",
        strokeColor: "#5588ff",
        strokeWidth: 2,
      };
    }
    // 4) Text :- Measures the actual rendered width of the text -> creates a rectangle with 10px padding around all sides
    case "text": {
      ctx.font = `${draw.fontSize}px ${draw.font}`;
      const x2 = draw.x1! + ctx!.measureText(draw.text!).width;
      const y2 = draw.y1! - parseInt(draw.fontSize!);
      return {
        ...draw,
        id: "1",
        type: "rectangle",
        x1: draw.x1! - 10,
        y1: draw.y1! + 10,
        x2: x2 + 10,
        y2: y2 - 10,
        fillStyle: "transparent",
        strokeColor: "#5588ff",
        strokeWidth: 2,
        text: "text",
      };
    }
    default:
      return null;
  }
}

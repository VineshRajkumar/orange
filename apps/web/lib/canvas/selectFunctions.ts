//resource reffered from :- https://github.com/HarshitBreaksProd/meetdraw/blob/9242fb5b36a1f4954595ff7a981fcc51abac3cc9/apps/web/lib/canvas/selectFunctions.ts#L3

import { draw_elementsType } from "@/types/sheet.type";


//Find out which shape (if any) is under the mouse at (x, y).
export const getDrawAtPosition: (
  x: number,
  y: number,
  diagrams: draw_elementsType[],
  ctx: CanvasRenderingContext2D
) => draw_elementsType | null = (
  x: number,
  y: number,
  diagrams: draw_elementsType[],
  ctx: CanvasRenderingContext2D
) => {

  // 1) Loop from end to start: because the last drawn shape is on top -> 
  //    Eg:- If you draw a red rectangle, then a blue circle,
  //         the blue circle appears on top of the red rectangle.
  //          So, if both overlap and the user clicks that point,
  //          we want to select the blue circle — not the red one underneath.
  // 2) Get each shape
  // 3) Check if point is inside the shape
  // 4) If yes return the shape or else null 

  for (let i = diagrams.length - 1; i >= 0; i--) {
    const draw = diagrams[i];
    if (isWithinDraw(x, y, draw!, ctx)) {
      return draw!;
    }
  }
  return null;
};

//Core logic for detecting whether the mouse is inside a shape
export const isWithinDraw: (
  mouseX: number,
  mouseY: number,
  draw: draw_elementsType,
  ctx: CanvasRenderingContext2D
) => boolean = (
  mouseX: number,
  mouseY: number,
  draw: draw_elementsType,
  ctx: CanvasRenderingContext2D
) => {

  //1) Take shape type 
  if (!draw) return false;
  const shape = draw.type;

  //2) Different Advance Math logic for each shape (NOT NEEDED to understand) :- 
  //  a) Rectangle  -> 	Bounding box check
  //  b) Diamond	 -> Geometry-based diamond check + tolerance
  //  c) Circle	 -> Ellipse formula (and fallback to line/point if needed)
  //  d) Line -> 	Curved or polyline sampling + distance check
  //  e) Arrow	 -> Line check + triangle head detection
  //  f) FreeHand	 -> Point-to-line-segment proximity
  //  g) Text	 -> Bounding box from text width/height
  //  h) Other	 -> Return false
  switch (shape) {
    case "rectangle": {
      if (
        draw.x1 === undefined ||
        draw.y1 === undefined ||
        draw.x2 === undefined ||
        draw.y2 === undefined
      )
        return false;
      const minX = Math.min(draw.x1, draw.x2);
      const maxX = Math.max(draw.x1, draw.x2);
      const minY = Math.min(draw.y1, draw.y2);
      const maxY = Math.max(draw.y1, draw.y2);
      return (
        mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY
      );
    }
    case "diamond": {
      if (
        draw.x1 === undefined ||
        draw.y1 === undefined ||
        draw.x2 === undefined ||
        draw.y2 === undefined
      )
        return false;
      const width = draw.x2 - draw.x1;
      const height = draw.y2 - draw.y1;

      const absWidth = Math.abs(width);
      const absHeight = Math.abs(height);

      const centerX = draw.x1 + width / 2;
      const centerY = draw.y1 + height / 2;

      if (absWidth === 0 || absHeight === 0) {
        // Handle severely malformed diamond (a line or a point)
        const p1 = { x: draw.x1, y: draw.y1 };
        const p2 = { x: draw.x2, y: draw.y2 };
        const lineTolerance = 5;

        const lenSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (lenSq === 0) {
          // It's a point
          return (
            Math.pow(mouseX - p1.x, 2) + Math.pow(mouseY - p1.y, 2) <
            lineTolerance * lineTolerance
          );
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);

        const dxLine = mouseX - closestX;
        const dyLine = mouseY - closestY;

        const distSq = dxLine * dxLine + dyLine * dyLine;

        return distSq < lineTolerance * lineTolerance;
      }

      const dx = Math.abs(mouseX - centerX);
      const dy = Math.abs(mouseY - centerY);

      const isInside = dx / (absWidth / 2) + dy / (absHeight / 2) <= 1;

      // Circumference check
      const vertices = [
        { x: centerX, y: draw.y1 }, // top
        { x: draw.x2, y: centerY }, // right
        { x: centerX, y: draw.y2 }, // bottom
        { x: draw.x1, y: centerY }, // left
      ];

      let onCircumference = false;
      for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i]!;
        const p2 = vertices[(i + 1) % vertices.length]!;
        const lineTolerance = 5;
        const lenSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (lenSq === 0) continue;

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);

        const dx_line = mouseX - closestX;
        const dy_line = mouseY - closestY;

        const distSq = dx_line * dx_line + dy_line * dy_line;

        if (distSq < lineTolerance * lineTolerance) {
          onCircumference = true;
          break;
        }
      }

      if (draw.fillStyle !== "transparent") {
        return isInside || onCircumference;
      } else {
        return onCircumference;
      }
    }
    case "circle": {
      if (
        draw.x1 === undefined ||
        draw.y1 === undefined ||
        draw.x2 === undefined ||
        draw.y2 === undefined
      )
        return false;
      const centerX = (draw.x1 + draw.x2) / 2;
      const centerY = (draw.y1 + draw.y2) / 2;

      const radiusX = Math.abs(draw.x2 - draw.x1) / 2;
      const radiusY = Math.abs(draw.y2 - draw.y1) / 2;

      // Handle severely malformed circle (a line or a point)
      if (radiusX === 0 || radiusY === 0) {
        let p1, p2;
        if (radiusX === 0 && radiusY === 0) {
          // Point
          p1 = { x: centerX, y: centerY };
          p2 = { x: centerX, y: centerY };
        } else if (radiusX === 0) {
          // Vertical line
          p1 = { x: centerX, y: draw.y1 };
          p2 = { x: centerX, y: draw.y2 };
        } else {
          // Horizontal line
          p1 = { x: draw.x1, y: centerY };
          p2 = { x: draw.x2, y: centerY };
        }

        const lineTolerance = 5;
        const lenSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (lenSq === 0) {
          // It's a point
          return (
            Math.pow(mouseX - p1.x, 2) + Math.pow(mouseY - p1.y, 2) <
            lineTolerance * lineTolerance
          );
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);

        const dxLine = mouseX - closestX;
        const dyLine = mouseY - closestY;

        const distSq = dxLine * dxLine + dyLine * dyLine;

        return distSq < lineTolerance * lineTolerance;
      }

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;

      // Check if inside the ellipse
      const isInside =
        (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;

      // Circumference check
      const lineTolerance = 5;
      const outerRadiusX = radiusX + lineTolerance;
      const outerRadiusY = radiusY + lineTolerance;
      const isInsideOuter =
        (dx * dx) / (outerRadiusX * outerRadiusX) +
          (dy * dy) / (outerRadiusY * outerRadiusY) <=
        1;

      const innerRadiusX = radiusX - lineTolerance;
      const innerRadiusY = radiusY - lineTolerance;

      if (innerRadiusX <= 0 || innerRadiusY <= 0) {
        // For thin ellipses, the circumference is the whole shape within the tolerance
        const isOnCircumference = isInsideOuter;
        if (draw.fillStyle !== "transparent") {
          return isInside || isOnCircumference;
        }
        return isOnCircumference;
      }

      const isInsideInner =
        (dx * dx) / (innerRadiusX * innerRadiusX) +
          (dy * dy) / (innerRadiusY * innerRadiusY) <=
        1;

      const isOnCircumference = isInsideOuter && !isInsideInner;

      if (draw.fillStyle !== "transparent") {
        return isInside || isOnCircumference;
      } else {
        return isOnCircumference;
      }
    }
    case "line": {
      // For lines with an intermediate point, check for proximity to the quadratic Bezier curve.
      if (draw.points && draw.points.length === 1) {
        const p0 = { x: draw.x1!, y: draw.y1! };
        const p1 = draw.points[0]!;
        const p2 = { x: draw.x2!, y: draw.y2! };

        // Calculate the control point for the curve, identical to the rendering function.
        const controlPoint = {
          x: 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x,
          y: 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y,
        };

        const lineTolerance = 5;
        const numSamples = 1000;

        for (let i = 0; i <= numSamples; i++) {
          const t = i / numSamples;
          // Using the quadratic Bezier formula: B(t) = (1-t)^2*P0 + 2(1-t)t*P_control + t^2*P2
          const Bx =
            (1 - t) ** 2 * p0.x +
            2 * (1 - t) * t * controlPoint.x +
            t ** 2 * p2.x;
          const By =
            (1 - t) ** 2 * p0.y +
            2 * (1 - t) * t * controlPoint.y +
            t ** 2 * p2.y;

          const distSq = (mouseX - Bx) ** 2 + (mouseY - By) ** 2;
          if (distSq < lineTolerance ** 2) {
            return true;
          }
        }
        return false;
      }

      // For straight lines or polylines, check distance to each segment.
      const points = [
        { x: draw.x1!, y: draw.y1! },
        ...(draw.points || []),
        { x: draw.x2!, y: draw.y2! },
      ];
      const lineTolerance = 5;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]!;
        const p2 = points[i + 1]!;
        const lenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;

        if (lenSq === 0) {
          if ((mouseX - p1.x) ** 2 + (mouseY - p1.y) ** 2 < lineTolerance ** 2)
            return true;
          continue;
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);
        const distSq = (mouseX - closestX) ** 2 + (mouseY - closestY) ** 2;

        if (distSq < lineTolerance ** 2) {
          return true;
        }
      }
      return false;
    }
    case "arrow": {
      // For lines with an intermediate point, check for proximity to the quadratic Bezier curve.
      if (draw.points && draw.points.length === 1) {
        const p0 = { x: draw.x1!, y: draw.y1! };
        const p1 = draw.points[0]!;
        const p2 = { x: draw.x2!, y: draw.y2! };

        const controlPoint = {
          x: 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x,
          y: 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y,
        };

        const lineTolerance = 5;
        const numSamples = 1000;

        for (let i = 0; i <= numSamples; i++) {
          const t = i / numSamples;
          const Bx =
            (1 - t) ** 2 * p0.x +
            2 * (1 - t) * t * controlPoint.x +
            t ** 2 * p2.x;
          const By =
            (1 - t) ** 2 * p0.y +
            2 * (1 - t) * t * controlPoint.y +
            t ** 2 * p2.y;

          const distSq = (mouseX - Bx) ** 2 + (mouseY - By) ** 2;
          if (distSq < lineTolerance ** 2) {
            return true;
          }
        }

        const angle = Math.atan2(
          p2.y -
            (2 * (1 - 0.99) * 0.99 * controlPoint.y +
              0.99 ** 2 * p2.y +
              (1 - 0.99) ** 2 * p0.y),
          p2.x -
            (2 * (1 - 0.99) * 0.99 * controlPoint.x +
              0.99 ** 2 * p2.x +
              (1 - 0.99) ** 2 * p0.x)
        );

        const arrowLength = 20;
        // const arrowWidth = 10;
        const x1 = p2.x - arrowLength * Math.cos(angle - Math.PI / 6);
        const y1 = p2.y - arrowLength * Math.sin(angle - Math.PI / 6);
        const x2 = p2.x - arrowLength * Math.cos(angle + Math.PI / 6);
        const y2 = p2.y - arrowLength * Math.sin(angle + Math.PI / 6);

        // Check if the mouse is within the arrowhead triangle
        const isInsideArrowhead = isPointInTriangle(
          { x: mouseX, y: mouseY },
          p2,
          { x: x1, y: y1 },
          { x: x2, y: y2 }
        );

        return isInsideArrowhead;
      }

      const points = [
        { x: draw.x1!, y: draw.y1! },
        ...(draw.points || []),
        { x: draw.x2!, y: draw.y2! },
      ];
      const lineTolerance = 5;
      let isOnLine = false;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]!;
        const p2 = points[i + 1]!;
        const lenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;

        if (lenSq === 0) {
          if (
            (mouseX - p1.x) ** 2 + (mouseY - p1.y) ** 2 <
            lineTolerance ** 2
          ) {
            isOnLine = true;
            break;
          }
          continue;
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);
        const distSq = (mouseX - closestX) ** 2 + (mouseY - closestY) ** 2;

        if (distSq < lineTolerance ** 2) {
          isOnLine = true;
          break;
        }
      }

      if (isOnLine) return true;

      // Arrowhead selection for straight lines/polylines
      const p_end = points[points.length - 1]!;
      const p_before_end = points[points.length - 2]!;
      const angle = Math.atan2(
        p_end.y - p_before_end.y,
        p_end.x - p_before_end.x
      );

      const arrowLength = 20;
      const x1 = p_end.x - arrowLength * Math.cos(angle - Math.PI / 6);
      const y1 = p_end.y - arrowLength * Math.sin(angle - Math.PI / 6);
      const x2 = p_end.x - arrowLength * Math.cos(angle + Math.PI / 6);
      const y2 = p_end.y - arrowLength * Math.sin(angle + Math.PI / 6);

      const isInsideArrowhead = isPointInTriangle(
        { x: mouseX, y: mouseY },
        p_end,
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      );

      return isInsideArrowhead;
    }
    case "freeHand": {
      if (!draw.points || draw.points.length < 2) {
        return false;
      }

      const lineTolerance = 5;

      for (let i = 0; i < draw.points.length - 1; i++) {
        const p1 = draw.points[i]!;
        const p2 = draw.points[i + 1]!;

        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;

        const lenSq = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        if (lenSq === 0) {
          if (
            Math.pow(mouseX - x1, 2) + Math.pow(mouseY - y1, 2) <
            lineTolerance * lineTolerance
          ) {
            return true;
          }
          continue;
        }

        let t = ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) / lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);

        const dx = mouseX - closestX;
        const dy = mouseY - closestY;

        const distSq = dx * dx + dy * dy;

        if (distSq < lineTolerance * lineTolerance) {
          return true;
        }
      }

      return false;
    }
    case "text": {
      const { text, font, fontSize } = draw;
      if (!text || !font || !fontSize) return false;

      ctx.font = `${fontSize}px ${font}`;
      const textWidth = ctx.measureText(text).width;
      const textHeight = parseInt(fontSize);

      return (
        mouseX >= draw.x1! &&
        mouseX <= draw.x1! + textWidth &&
        mouseY <= draw.y1! &&
        mouseY >= draw.y1! - textHeight
      );
    }
    default: {
      return false;
    }
  }
};


//Used to detect if the mouse clicked inside the arrowhead/triangle
//uses Math formulas 
function isPointInTriangle(
  p: { x: number; y: number },
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  const s =
    p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y;
  const t =
    p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y;

  if (s < 0 != t < 0 && s != 0 && t != 0) {
    return false;
  }

  const A =
    -p1.y * p2.x + p0.y * (p2.x - p1.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y;

  return A < 0 ? s <= 0 && s + t >= A : s >= 0 && s + t <= A;
}


//Checks if the user's mouse is hovering near the edges or corners of a selected shape
//THIS FUNCTION RETURNS cursor style and position 
export function hoverOverSelectionBox(
  selectionBox: draw_elementsType | null,
  x: number,
  y: number
): {
  cursor: string;
  position:
    | "topLeft"
    | "topRight"
    | "bottomRight"
    | "bottomLeft"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | `point-${number}`;
} | null {

  // 1) Selection Box is required to change different arrow/cursor styles around the box 
  // arrow styles like ↑, ↓, ↔ around the box when you hover 
  // also this function tells which cursor to show (eg resize, pointer))
  if (!selectionBox) return null;

  // 2) Get the coordinates where hover is happening 
  const topLeft = { x: selectionBox.x1!, y: selectionBox.y1! };
  const topRight = { x: selectionBox.x2!, y: selectionBox.y1! };
  const bottomRight = { x: selectionBox.x2!, y: selectionBox.y2! };
  const bottomLeft = { x: selectionBox.x1!, y: selectionBox.y2! };

  const leftEdge = {
    x1: topLeft.x,
    y1: topLeft.y,
    x2: bottomLeft.x,
    y2: bottomLeft.y,
  };
  const rightEdge = {
    x1: topRight.x,
    y1: topRight.y,
    x2: bottomRight.x,
    y2: bottomRight.y,
  };
  const topEdge = {
    x1: topLeft.x,
    y1: topLeft.y,
    x2: topRight.x,
    y2: topRight.y,
  };
  const bottomEdge = {
    x1: bottomLeft.x,
    y1: bottomLeft.y,
    x2: bottomRight.x,
    y2: bottomRight.y,
  };

  // 3) cursor and arrow style for text 
  if (selectionBox.text === "text") {
    if (
      x >= bottomRight.x - 4 &&
      x <= bottomRight.x + 4 &&
      y >= bottomRight.y - 4 &&
      y <= bottomRight.y + 4
    ) {
      return { cursor: "nesw-resize", position: "topRight" };
    }
    return null;
  }

  // 4) Show arrow styles like ↑, ↓, ↔ around the box when you hover
  if (
    x >= topLeft.x - 4 &&
    x <= topLeft.x + 4 &&
    y >= topLeft.y - 4 &&
    y <= topLeft.y + 4
  ) {
    return { cursor: "nwse-resize", position: "topLeft" };
  } else if (
    x >= topRight.x - 4 &&
    x <= topRight.x + 4 &&
    y >= topRight.y - 4 &&
    y <= topRight.y + 4
  ) {
    return { cursor: "nesw-resize", position: "topRight" };
  } else if (
    x >= bottomRight.x - 4 &&
    x <= bottomRight.x + 4 &&
    y >= bottomRight.y - 4 &&
    y <= bottomRight.y + 4
  ) {
    return { cursor: "nwse-resize", position: "bottomRight" };
  } else if (
    x >= bottomLeft.x - 4 &&
    x <= bottomLeft.x + 4 &&
    y >= bottomLeft.y - 4 &&
    y <= bottomLeft.y + 4
  ) {
    return { cursor: "nesw-resize", position: "bottomLeft" };
  } else if (
    x >= leftEdge.x1 - 4 &&
    x <= leftEdge.x2 + 4 &&
    y >= leftEdge.y1 - 4 &&
    y <= leftEdge.y2 + 4
  ) {
    return { cursor: "ew-resize", position: "left" };
  } else if (
    x >= rightEdge.x1 - 4 &&
    x <= rightEdge.x2 + 4 &&
    y >= rightEdge.y1 - 4 &&
    y <= rightEdge.y2 + 4
  ) {
    return { cursor: "ew-resize", position: "right" };
  } else if (
    y >= topEdge.y1 - 4 &&
    y <= topEdge.y2 + 4 &&
    x >= topEdge.x1 - 4 &&
    x <= topEdge.x2 + 4
  ) {
    return { cursor: "ns-resize", position: "top" };
  } else if (
    y >= bottomEdge.y1 - 4 &&
    y <= bottomEdge.y2 + 4 &&
    x >= bottomEdge.x1 - 4 &&
    x <= bottomEdge.x2 + 4
  ) {
    return { cursor: "ns-resize", position: "bottom" };
  }

  // 5)  Arrow/line-specific points
  if (selectionBox.points) {
    for (let index = 0; index < selectionBox.points.length; index++) {
      const point = selectionBox.points[index];
      if (
        x >= point!.x - 8 &&
        x <= point!.x + 8 &&
        y >= point!.y - 8 &&
        y <= point!.y + 8
      ) {
        return { cursor: "pointer", position: `point-${index}` };
      }
    }
  }

  return null;
}
//resource reffered from :-  https://github.com/HarshitBreaksProd/meetdraw/blob/9242fb5b36a1f4954595ff7a981fcc51abac3cc9/apps/web/lib/canvas/drawFunctions.ts

import { draw_elementsType } from "@/types/sheet.type";

type ActiveUser = { username: string; lastActive: number };

//What is the ctx/ CanvasRenderingContext2D -> it provides an interface by which shapes can be drawn on canvas

//NOTE :-  Canvas Is Not Like a DOM — It’s Pixel-Based
      //  Once you draw something on canvas, it becomes pixels.
      // If you want to update anything (like adding a new shape), you have to:
              //1) Clear the canvas
              //2) Redraw all previous shapes
              //3) Draw the new one

export const renderDraws = (
  ctx: CanvasRenderingContext2D,
  canvasCurrent: HTMLCanvasElement,  //reference to your main canvas element
  diagrams: draw_elementsType[],  //All existing shapes 
  activeDraw: draw_elementsType | null,  //currently drawn shape
  selectionBox: draw_elementsType | null, //A selection box if you're selecting
  activeAction:   //select action
    | "select"
    | "move"
    | "draw"
    | "resize"
    | "edit"
    | "erase"
    | "pan"
    | "zoom"
    | "laser",
  selectedDraw: draw_elementsType | null, //the shape that the user has selected
  toErase: draw_elementsType[],   //shapes to erase stored in array 
  panOffset: { x: number; y: number },  //for scrolling the canvas
  scale: number,  //scale for zooming the canvas
  laserTrailRef?: { x: number; y: number; time: number }[], //for laser 
  activeUsersRef?: React.RefObject<Map<string, { username: string; lastActive: number; }>>,
  diagramUserMapRef?: React.RefObject<Map<string, string>>
) => {

  //1) Clear the canvas and apply zoom/scroll
  ctx.save();  //saves the entire state of the canvas by pushing the current state onto a stack -> NOTE :- it not only saves the shapes but it also saves the scroll,zoom etc 
  ctx.clearRect(0, 0, canvasCurrent.width, canvasCurrent.height); //clear canvas
  ctx.translate(panOffset.x, panOffset.y); //Applies panning (scrolling).
  ctx.scale(scale, scale); //Applies zooming.

  //2) Redraw all previous shapes
  diagrams.forEach((diagram) => {
    if (diagram.strokeColor) { //apply border color for that diagram 
      ctx.strokeStyle = diagram.strokeColor;
    }
    if (diagram.fillStyle) { //apply bg color for that diagram 
      ctx.fillStyle = diagram.fillStyle;
    }
    if (diagram.strokeWidth) { //apply width/thickness for that diagram 
      ctx.lineWidth = diagram.strokeWidth;
    }
    if (toErase?.includes(diagram)) { //when you are erasing lower the opacity of shape/text to 20 
      ctx.strokeStyle = (ctx.strokeStyle as string).concat("20");
      if (diagram.type === "text") {
        diagram.strokeColor = ctx.strokeStyle;
      }
    }
    switch (diagram.type) { //call the respective shape function 
      case "rectangle":
        renderRectangle(ctx, diagram);
        break;
      case "diamond":
        renderDiamond(ctx, diagram);
        break;
      case "circle":
        renderCircle(ctx, diagram);
        break;
      case "line":
        renderLine(ctx, diagram);
        break;
      case "arrow":
        renderArrow(ctx, diagram);
        break;
      case "freeHand":
        renderFreeHand(ctx, diagram);
        break;
      case "text":
        renderText(ctx, diagram);
        break;
    }
  });
  

  //3) Draw the new shape 
  if (activeDraw) {
    if (activeDraw.strokeColor) { //apply border color for that new diagram 
      ctx.strokeStyle = activeDraw.strokeColor;
    }
    if (activeDraw.fillStyle) { //apply bg color for that new diagram 
      ctx.fillStyle = activeDraw.fillStyle;
    }
    if (activeDraw.strokeWidth) { //apply width/thickness for that new diagram 
      ctx.lineWidth = activeDraw.strokeWidth;
    }
    switch (activeDraw.type) {  //call the respective shape function 
      case "rectangle": 
        renderRectangle(ctx, activeDraw);
        break;
      case "diamond":
        renderDiamond(ctx, activeDraw);
        break;
      case "circle":
        renderCircle(ctx, activeDraw);
        break;
      case "line":
        renderLine(ctx, activeDraw);
        break;
      case "arrow":
        renderArrow(ctx, activeDraw);
        break;
      case "freeHand":
        renderFreeHand(ctx, activeDraw);
        break;
      case "text":
        renderText(ctx, activeDraw);
        renderCursor(ctx, activeDraw); //render cursor to show the blinking cursor -> | 
        break;
    }
  }
  if (selectionBox) {
    renderSelectionBox(ctx, selectionBox, activeAction);
    if (selectedDraw?.type === "text" && activeAction === "edit") {
      renderCursor(ctx, selectedDraw);  //when editing -> render cursor to show the blinking cursor -> | 
    }
  }
  if (activeAction === "laser" && laserTrailRef ) {
    renderLaserPointer(ctx, laserTrailRef);
  }
  if (activeUsersRef && diagramUserMapRef) {
    renderActiveUsers(ctx, activeUsersRef.current, diagrams, diagramUserMapRef.current);
  }

  ctx.restore(); //If any zoom/scroll is applied and if we didnot call ctx.restore then canvas will stay zoomed/scrolled and next time if any shape is draw it will zoom/scroll more again because we didnot reset the zoom/scroll values thats why restore the state back 
};

//Direct Math Formula -> not need to understand
function renderRectangle(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {
  const cornerRadius = Math.min(
    40,
    Math.min(
      Math.abs(diagram.x2! - diagram.x1!),
      Math.abs(diagram.y2! - diagram.y1!)
    ) * 0.2,
    Math.min(
      Math.abs(diagram.x2! - diagram.x1!),
      Math.abs(diagram.y2! - diagram.y1!)
    ) / 2
  );
  ctx.beginPath();
  ctx.roundRect(
    diagram.x1!,
    diagram.y1!,
    diagram.x2! - diagram.x1!,
    diagram.y2! - diagram.y1!,
    cornerRadius
  );
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}
//Direct Math Formula -> not need to understand
function renderDiamond(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {
  const width = diagram.x2! - diagram.x1!;
  const height = diagram.y2! - diagram.y1!;

  const x = diagram.x1!;
  const y = diagram.y1!;

  // Ensure curvature is within the valid range [0, 0.5]
  const f = 0.25;

  // The 4 main vertices of the diamond (top, right, bottom, left)
  const Vt = { x: x + width / 2, y: y };
  const Vr = { x: x + width, y: y + height / 2 };
  const Vb = { x: x + width / 2, y: y + height };
  const Vl = { x: x, y: y + height / 2 };

  // Points near the Top vertex
  const P_tl_t = { x: (1 - f) * Vt.x + f * Vl.x, y: (1 - f) * Vt.y + f * Vl.y };
  const P_tr_t = { x: (1 - f) * Vt.x + f * Vr.x, y: (1 - f) * Vt.y + f * Vr.y };

  // Points near the Right vertex
  const P_rt_r = { x: (1 - f) * Vr.x + f * Vt.x, y: (1 - f) * Vr.y + f * Vt.y };
  const P_rb_r = { x: (1 - f) * Vr.x + f * Vb.x, y: (1 - f) * Vr.y + f * Vb.y };

  // Points near the Bottom vertex
  const P_br_b = { x: (1 - f) * Vb.x + f * Vr.x, y: (1 - f) * Vb.y + f * Vr.y };
  const P_bl_b = { x: (1 - f) * Vb.x + f * Vl.x, y: (1 - f) * Vb.y + f * Vl.y };

  // Points near the Left vertex
  const P_lb_l = { x: (1 - f) * Vl.x + f * Vb.x, y: (1 - f) * Vl.y + f * Vb.y };
  const P_lt_l = { x: (1 - f) * Vl.x + f * Vt.x, y: (1 - f) * Vl.y + f * Vt.y };

  // Construct the path using lines and quadratic curves
  ctx.beginPath();
  ctx.moveTo(P_tl_t.x, P_tl_t.y); // Start at the point on the top-left edge

  // Curve around the Top vertex
  ctx.quadraticCurveTo(Vt.x, Vt.y, P_tr_t.x, P_tr_t.y);
  ctx.lineTo(P_rt_r.x, P_rt_r.y); // Straight line on the top-right edge

  // Curve around the Right vertex
  ctx.quadraticCurveTo(Vr.x, Vr.y, P_rb_r.x, P_rb_r.y);
  ctx.lineTo(P_br_b.x, P_br_b.y); // Straight line on the bottom-right edge

  // Curve around the Bottom vertex
  ctx.quadraticCurveTo(Vb.x, Vb.y, P_bl_b.x, P_bl_b.y);
  ctx.lineTo(P_lb_l.x, P_lb_l.y); // Straight line on the bottom-left edge
  ctx.quadraticCurveTo(Vl.x, Vl.y, P_lt_l.x, P_lt_l.y);
  ctx.lineTo(P_tl_t.x, P_tl_t.y);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}
//Direct Math Formula -> not need to understand
function renderCircle(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {
  const centerX = (diagram.x1! + diagram.x2!) / 2;
  const centerY = (diagram.y1! + diagram.y2!) / 2;

  const radiusX = Math.abs(diagram.x2! - diagram.x1!) / 2;
  const radiusY = Math.abs(diagram.y2! - diagram.y1!) / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}
//Direct Math Formula -> not need to understand
function renderLine(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {
  ctx.beginPath();
  ctx.moveTo(diagram.x1!, diagram.y1!);

  const p0 = { x: diagram.x1!, y: diagram.y1! };
  const p1 = diagram.points![0]!;
  const p2 = { x: diagram.x2!, y: diagram.y2! };

  const controlPointX = 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x;
  const controlPointY = 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y;

  ctx.quadraticCurveTo(controlPointX, controlPointY, p2.x, p2.y);

  ctx.stroke();
}

//draw arrow from a to b with sharp arrowhead and can be bent from the control points 
function renderArrow(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {

  //1) Extract 3 Points -> A point , middle control-points/curve-points , B point
  const p0 = { x: diagram.x1!, y: diagram.y1! };
  const p1 = diagram.points![0]!;
  const p2 = { x: diagram.x2!, y: diagram.y2! };

  //2) Calculate Control Point for the Curve -> for smooth bend
  const controlPointX = 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x;
  const controlPointY = 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y;

  //3) Draw the Curved Line
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(controlPointX, controlPointY, p2.x, p2.y);
  ctx.stroke();

  //4) Get Curve Direction at the End -> so that arrow head points to correct direction
  const tangentDx = p2.x - controlPointX;
  const tangentDy = p2.y - controlPointY;
  const angle = Math.atan2(tangentDy, tangentDx);

  //5) Arrowhead Length -> long arrow big head, small arrow small head
  const lineLength = Math.sqrt(
    Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)
  );
  const headLength =
    Math.min(lineLength * 0.2, 20) + (diagram.strokeWidth ?? 1) * 2;


  //6) Draw the Arrowhead
  //NOTE :- save and restore was not needed here but it is a good practise becasue if user applies any new configurations in between then it will prevent any unnessacry bugs 
  ctx.save(); //save the current state so that it remebers the configurations appiled in current canvas
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(
    p2.x - headLength * Math.cos(angle - Math.PI / 10),
    p2.y - headLength * Math.sin(angle - Math.PI / 10)
  );
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(
    p2.x - headLength * Math.cos(angle + Math.PI / 10),
    p2.y - headLength * Math.sin(angle + Math.PI / 10)
  );
  ctx.stroke();
  ctx.restore(); //after trying out the new configurations(like color,zoom etc.) now restore the original state back
}

//Pen - pencil tool drawing -> using quadratic curves function of ctx
function renderFreeHand(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {

  //1) If no points exist, or not enough points to form a line (less than 2), don’t try to draw.
  if (!diagram.points || diagram.points.length < 2) {
    return;
  }

  //2) Start Drawing a Path -> set the starting point 
  ctx.beginPath();
  ctx.moveTo(diagram.points[0]!.x, diagram.points[0]!.y);

  //3) Use quadratic curves for a smoother line 
  //  a) looping through points 1 to (length - 2), skipping every other point (i += 2)
  //  b) We use point i as the control point
  //  c) We use the midpoint between i+2 and i as the end point
  for (let i = 1; i < diagram.points.length - 2; i += 2) {
    // Calculate the midpoint for the curve
    const xc = (diagram.points[i]!.x + diagram.points[i + 2]!.x) / 2;
    const yc = (diagram.points[i]!.y + diagram.points[i + 2]!.y) / 2;
    // The current point is the control point, and the midpoint is the end point
    ctx.quadraticCurveTo(diagram.points[i]!.x, diagram.points[i]!.y, xc, yc);
  }

  //4) Connect Final Point
  ctx.lineTo(
    diagram.points[diagram.points.length - 1]!.x,
    diagram.points[diagram.points.length - 1]!.y
  );

  //5) Draw the Stroke
  ctx.stroke();
}

//draws text on the canvas
function renderText(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {
  // 1) Set the font and fontsize like -> "16px Arial" , "24px Roboto"
  ctx.font = `${diagram.fontSize!}px ${diagram.font!}`;
  // 2) Apply bgColor/color to each letter  -> If you wanted outlined text, you'd use strokeText(...)
  ctx.fillStyle = diagram.strokeColor!;
  // 3) Draw the Text -> diagram.text! → the actual text string , and the x,y coordinates
  ctx.fillText(diagram.text!, diagram.x1!, diagram.y1!);
}

//draws a blinking vertical line at the end of the current text - like the cursor in a text editor
function renderCursor(ctx: CanvasRenderingContext2D, diagram:draw_elementsType) {
  // console.log("rendering cursor")

  // 1) Set the font and fontsize to take the width of the font  -> "16px Arial" , "24px Roboto"
  ctx.font = `${diagram.fontSize!}px ${diagram.font!}`; //it tells which font and size to use <-this must be set first before measureText() is called beacuse ->width of the text depends on the font and font size.
  const textWidth = ctx.measureText(diagram.text!).width; //textWidth depends on ctx.font so set that first 
  
  //2) Get the ending of the text (x,y)
  const cursorX = diagram.x1! + textWidth; 
  const cursorY = diagram.y1!;

  //3) Make the cursor blink every 600ms -> % 2 flips between 0 and 1 → cursor only renders when the value is 1.
  if (Math.floor(Date.now() / 600) % 2) {
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY + 3);
    ctx.lineTo(cursorX, cursorY - parseInt(diagram.fontSize!) - 3);
    const isDark = document.querySelector("html")?.className.includes("dark")
    ctx.strokeStyle = isDark ? "white" : "black"; 
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

//responsible for drawing the bounding box around the selected shape along with the resize handles or custom control points
function renderSelectionBox(ctx: CanvasRenderingContext2D, selectionBox: draw_elementsType, activeAction: "select" | "move" | "draw" | "resize" | "edit" | "erase" | "pan" | "zoom"| "laser") {
  //1) setting the drawing styles 
  if (selectionBox.strokeColor) {
    ctx.strokeStyle = selectionBox.strokeColor;
  }
  if (selectionBox.fillStyle) {
    ctx.fillStyle = selectionBox.fillStyle;
  }
  if (selectionBox.strokeWidth) {
    ctx.lineWidth = selectionBox.strokeWidth;
  }

  //2) Define 4 Corners of the Bounding Box
  const corner_1 = {
    x: selectionBox.x1!,
    y: selectionBox.y1!,
  };
  const corner_2 = { x: selectionBox.x2!, y: selectionBox.y1! };
  const corner_3 = { x: selectionBox.x2!, y: selectionBox.y2! };
  const corner_4 = { x: selectionBox.x1!, y: selectionBox.y2! };

  //3) Draw Main Selection Rectangle with its bg color little bit grey/transparent so that selected area can be shown 
  ctx.beginPath();
  ctx.strokeRect(
    selectionBox.x1!,
    selectionBox.y1!,
    selectionBox.x2! - selectionBox.x1!,
    selectionBox.y2! - selectionBox.y1!
  );
  ctx.fillStyle = "#cccccc";
  ctx.lineWidth = 1;

  //4) Draw Control Points Based on Shape Type
  //a) If text -> Text is often resizable only from one corner — a small UX pattern.
  //b) If it’s any other shape: -> 
  //    i) Draw four small squares (handles) at each corner:
  //    ii) Draw additional control points if there are exactly 3 defined in selectionBox.points[] (likely for custom shapes like arrows, lines, etc.)
  //    iii) Draw control points as blue circles 
  if (selectionBox.text === "text" && activeAction === "select") {
    const corner = { x: selectionBox.x2!, y: selectionBox.y2! };
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 3, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  } else {
    ctx.fillRect(corner_1.x - 4, corner_1.y - 4, 8, 8);
    ctx.fillRect(corner_2.x - 4, corner_2.y - 4, 8, 8);
    ctx.fillRect(corner_3.x - 4, corner_3.y - 4, 8, 8);
    ctx.fillRect(corner_4.x - 4, corner_4.y - 4, 8, 8);
    ctx.strokeRect(corner_1.x - 4, corner_1.y - 4, 8, 8);
    ctx.strokeRect(corner_2.x - 4, corner_2.y - 4, 8, 8);
    ctx.strokeRect(corner_3.x - 4, corner_3.y - 4, 8, 8);
    ctx.strokeRect(corner_4.x - 4, corner_4.y - 4, 8, 8);
    ctx.stroke();
    ctx.fill();
    if (selectionBox.points.length === 3) {
      ctx.fillStyle = "#5588ff";
      ctx.beginPath();
      ctx.moveTo(selectionBox.points[0]!.x, selectionBox.points[0]!.y);

      ctx.arc(
        selectionBox.points[0]!.x,
        selectionBox.points[0]!.y,
        4,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[1]!.x, selectionBox.points[1]!.y);
      ctx.arc(
        selectionBox.points[1]!.x,
        selectionBox.points[1]!.y,
        4,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[2]!.x, selectionBox.points[2]!.y);
      ctx.arc(
        selectionBox.points[2]!.x,
        selectionBox.points[2]!.y,
        4,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.fillStyle = "#5588ff70";
      ctx.moveTo(selectionBox.points[0]!.x, selectionBox.points[0]!.y);
      ctx.arc(
        selectionBox.points[0]!.x,
        selectionBox.points[0]!.y,
        8,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[1]!.x, selectionBox.points[1]!.y);
      ctx.arc(
        selectionBox.points[1]!.x,
        selectionBox.points[1]!.y,
        8,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[2]!.x, selectionBox.points[2]!.y);
      ctx.arc(
        selectionBox.points[2]!.x,
        selectionBox.points[2]!.y,
        8,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }
  ctx.closePath(); //Closes the shape
}


//laser pointer function - Generated by gpt 
//DIDNOT CHECK A LOT 
function renderLaserPointer(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; y: number; time: number }[]
) {
   const now = Date.now();
  const maxTrailAge = 500;
  const validTrail: { x: number; y: number; time: number }[] = trail.filter(p => now - p.time < maxTrailAge);

  if (validTrail.length < 2) return;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 4;

  for (let i = 0; i < validTrail.length - 1; i++) {
    const p1 = validTrail[i];
    const p2 = validTrail[i + 1];

    if (!p1 || !p2) continue;

    const age = now - p1.time;
    const alpha = 1 - age / maxTrailAge;

    ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  const head = validTrail.at(-1);
  if (head) {
    ctx.beginPath();
    ctx.arc(head.x, head.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 0, 0, 0.9)`;
    ctx.fill();
  }

  ctx.restore();
}


//---------------------------------
//render currently drawing users 
//DIDNOT CHECK A LOT 

const userColors = new Map<string, string>();
const getUserColor = (userId: string) => {
  if (!userColors.has(userId)) {
    const colors = [
      "#FF5733", // bright orange-red
      "#33C1FF", // bright sky blue
      "#28A745", // vivid green
      "#FFC300", // bright yellow
      "#9B59B6", // amethyst purple
      "#FF33A8", // neon pink
      "#FF8C00", // vivid orange
      "#1ABC9C", // turquoise
      "#E74C3C", // bright red
      "#2ECC71", // lime green
      "#3498DB", // vivid blue
      "#F39C12", // golden orange
      "#8E44AD", // deep violet
      "#00CED1", // dark turquoise
      "#FF1493"  // deep pink
    ];
    userColors.set(
      userId,
      colors[Math.floor(Math.random() * colors.length)] || "#e6194b"
    );
  }
  return userColors.get(userId)!;
};

export const renderActiveUsers = (
  ctx: CanvasRenderingContext2D,
  activeUsers: Map<string, ActiveUser>,
  diagrams: draw_elementsType[],
  diagramUserMap: Map<string, string>
) => {
  for (const [userId, user] of activeUsers.entries()) {
    if (Date.now() - user.lastActive > 3000) continue; // skip inactive

    // find the last shape for this user
    const lastShape = [...diagrams].reverse().find(
      (d) => diagramUserMap.get(d.id) === userId
    );
    if (!lastShape) continue;

    ctx.font = "14px Arial";
    ctx.fillStyle = getUserColor(userId);

    let textX = lastShape.x1 ?? 0;
    let textY = lastShape.y1 ?? 0;

    // Position username above the shape depending on type
    if (lastShape.type === "rectangle" || lastShape.type === "circle" || lastShape.type === "diamond") {
      const minY = Math.min(lastShape.y1 ?? 0, lastShape.y2 ?? 0);
      textY = minY - 12; // just above top edge
      textX = Math.min(lastShape.x1 ?? 0, lastShape.x2 ?? 0);
    } else if (lastShape.type === "line" || lastShape.type === "arrow") {
      textY = Math.min(lastShape.y1 ?? 0, lastShape.y2 ?? 0) - 12;
      textX = Math.min(lastShape.x1 ?? 0, lastShape.x2 ?? 0);
    } else if (lastShape.type === "text") {
      textY = (lastShape.y1 ?? 0) - 16; // above text
      textX = (lastShape.x1 ?? 0);
    }
    else if (lastShape.type === "freeHand" && lastShape.points && lastShape.points.length > 0) {
      const firstPoint = lastShape.points[0];
      if(!firstPoint?.x && !firstPoint?.y) return
      textX = firstPoint.x;
      textY = firstPoint.y - 16; 
    }

    ctx.fillText(user.username, textX, textY);
  }
};

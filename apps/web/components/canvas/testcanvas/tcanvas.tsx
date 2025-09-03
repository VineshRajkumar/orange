/*TESTING ALL THE CANVAS RELATED OPERATIONS

'use client'
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

//Some references :- 
//https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
//https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/Create_the_Canvas_and_draw_on_it
//https://stackoverflow.com/questions/6199018/moving-objects-on-html5-canvas
//https://stackoverflow.com/questions/64341953/how-do-you-force-a-canvas-refresh-in-javascript

interface draw_elementsType  {
    id: string ,
    type: "rectangle" | "diamond" | "circle" | "line" | "arrow" | "text" | "freeHand";
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number,
    strokeColor: string, //border -> strokestyle
    fillStyle?: string, //baclground
    strokeWidth: number, //1.25,2.5,3.75 -> lineWidth 
    strokeStyle?: "solid" | "dashed" | "dotted"
    opacity?: number,
    font: string,
    fontSize: string,
    text: string;
    points: { x: number; y: number }[]; //control points where user can bend the shape
}

export default function Canvas() {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [canvasSize, setCanvasSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 })
    const [shape, setShape] = useState<"rectangle" | "diamond" | "circle" | "triangle" | "flexible_circle" | "line" | "arrow" | "text" | "freeHand">('freeHand')
    const [color, setColor] = useState<string>('black')
    const [width, setWidth] = useState<number>(2.5)
    const [stroke_Style, setStroke_Style] = useState<"solid" | "dashed" | "dotted">('solid')
    const [opacity_number, setOpacity_number] = useState<number>(100)
    const [elements, setElements] = useState<draw_elementsType[]>([]);

    //Testing for circle only
    const [testx1, setTestx1] = useState(0)
    const [testx2, setTestx2] = useState(0)
    const [testy1, setTesty1] = useState(0)
    const [testy2, setTesty2] = useState(0)

    useEffect(() => {

        //window object is only available in client side 
        //so we are setting size in useeffect 
        setCanvasSize({
            width: window.innerWidth,
            height: window.innerHeight
        });
        //when canvas starts at first it will be null thats why
        //do this check 
        if (canvasRef.current) {

            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')  //starts a 2d frame

            //check done for typescript
            if (ctx === null) {
                throw new Error('This browser does not support 2-dimensional canvas rendering contexts.');
            }

            let isDrawing = false;
            let startX = 0;
            let startY = 0;

            //When mousedown set isDrawing to true 
            //so that mouse movement can be tracked 
            //when mouseup set it to false
            function handleMouseDown(e: MouseEvent) {
                isDrawing = true;
                startX = e.offsetX;
                startY = e.offsetY;
            }

            function handleMouseMove(e: MouseEvent) {
                if (!isDrawing || !ctx) return;

                // Clear previous preview -> otherwise it 
                // would draw over the previous draw every 
                // iteration -> it clears the rectangle  
                // since we gave the corrdinate of rectangle 
                // as the screen size so it clears the screen
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Redraw all saved shapes
                drawElements(ctx, elements)

                const current_element = {
                    type: shape,
                    x1: startX,
                    y1: startY,
                    x2: e.offsetX,
                    y2: e.offsetY,
                    strokeColor: color,
                    strokeWidth: width,
                    strokeStyle: stroke_Style,
                    opacity: opacity_number
                }
                // Draw new/current live shape 
                drawPreviewShape(ctx, current_element)
                // ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
           
            }

            function handleMouseUp(e: MouseEvent) {
                isDrawing = false;
                // Save shape to state :- 
                const current_element = {
                    type: shape,
                    x1: startX,
                    y1: startY,
                    x2: e.offsetX,
                    y2: e.offsetY,
                    strokeColor: color,
                    strokeWidth: width,
                    strokeStyle: stroke_Style,
                    opacity: opacity_number,
                }
                setElements((prev) => ([...prev, current_element]))

            }

            canvas?.addEventListener("mousedown", handleMouseDown);
            canvas?.addEventListener("mousemove", handleMouseMove);
            canvas?.addEventListener("mouseup", handleMouseUp);

            return () => {
                canvas?.removeEventListener("mousedown", handleMouseDown);
                canvas?.removeEventListener("mousemove", handleMouseMove);
                canvas?.removeEventListener("mouseup", handleMouseUp);
            };

        }

    }, [canvasRef, color, elements, shape])

    const drawElements = (ctx: CanvasRenderingContext2D, elements: draw_elementsType[]) => {
        elements.forEach(el => {
            //since both codes are same and code repetion is bad 
            drawPreviewShape(ctx, el)
        });
    }

    const drawPreviewShape = (ctx: CanvasRenderingContext2D, el: draw_elementsType) => {

        ctx.strokeStyle = el.strokeColor

        if (el.type === "rectangle") {

            ctx.strokeRect(el.x1, el.y1, el.x2 - el.x1, el.y2 - el.y1);
        }
        if (el.type === "circle") {

            ctx.beginPath();

            setTestx1(el.x1)
            setTestx2(el.x2)
            setTesty1(el.y1)
            setTesty2(el.y2)

            //log the setTestx1,setTestx2,setTesty1,setTesty2 
            // to understand how this is working 
            //FORMULA GENERATED BY ME :) DIDNOT GOOGLE 
            const centreX = ((el.x2 - el.x1) / 2) + el.x1
            const centreY = ((el.y2 - el.y1) / 2) + el.y1
            //Math.abs will convert negative value to postive
            const radius = Math.abs((el.x2 - centreX)) //can take from any point x2-cx or cx-x1 or y2-cy or cy-y1

            ctx.arc(centreX, centreY, radius, 0, 2 * Math.PI, true);
            ctx.stroke();
        }
        if (el.type === "triangle") {
            ctx.beginPath();

            setTestx1(el.x1)
            setTestx2(el.x2)
            setTesty1(el.y1)
            setTesty2(el.y2)

            //START AT x1,y1 
            ctx.moveTo(el.x1, el.y1);
            //line between x1,y1 to x2,y2 
            ctx.lineTo(el.x2, el.y2);

            //GOT THIS FORMULA FROM -> https://stackoverflow.com/questions/74714400/how-to-find-3rd-point-of-equilateral-triangle-from-two-points-at-any-angle-in-ja
            const x3 = (el.x1 + el.x2) / 2 - 0.8660254 * (el.y1 - el.y2);
            const y3 = (el.y1 + el.y2) / 2 + 0.8660254 * (el.x1 - el.x2);
            //line between x2,y2 to x3,y3
            ctx.lineTo(x3, y3);

            //join x3,y3 to x1,y1 -> do closePath or ctx.lineTo(el.x1, el.y1);
            ctx.closePath();
            ctx.stroke();
        }
        if (el.type === "flexible_circle") {
            setTestx1(el.x1)
            setTestx2(el.x2)
            setTesty1(el.y1)
            setTesty2(el.y2)

            const centerX = (el.x1 + el.x2) / 2;
            const centerY = (el.y1 + el.y2) / 2;
            const width = Math.abs(el.x2 - el.x1);
            const height = Math.abs(el.y2 - el.y1);

            // Four corners of the rhombus
            const top = { x: centerX, y: el.y1 };
            const right = { x: el.x2, y: centerY };
            const bottom = { x: centerX, y: el.y2 };
            const left = { x: el.x1, y: centerY };

            // Amount of curvature
            const curve = Math.min(width, height) * 0.25;

            ctx.beginPath();

            ctx.moveTo(top.x, top.y);

            ctx.bezierCurveTo(
                top.x + curve, top.y,
                right.x, right.y - curve,
                right.x, right.y
            );

            ctx.bezierCurveTo(
                right.x, right.y + curve,
                bottom.x + curve, bottom.y,
                bottom.x, bottom.y
            );

            ctx.bezierCurveTo(
                bottom.x - curve, bottom.y,
                left.x, left.y + curve,
                left.x, left.y
            );

            ctx.bezierCurveTo(
                left.x, left.y - curve,
                top.x - curve, top.y,
                top.x, top.y
            );

            ctx.closePath();
            ctx.stroke();
        }
        if (el.type === "diamond") {
            //DONE BY GPT 
            setTestx1(el.x1)
            setTestx2(el.x2)
            setTesty1(el.y1)
            setTesty2(el.y2)

            // Calculate width, height, and top-left corner
            const width = el.x2 - el.x1;
            const height = el.y2 - el.y1;
            const x = el.x1;
            const y = el.y1;

            // Curvature factor: controls how rounded the corners are (range 0–0.5)
            const f = 0.25;

            // Four main diamond (rhombus) vertices
            const Vt = { x: x + width / 2, y: y };              // Top
            const Vr = { x: x + width, y: y + height / 2 };     // Right
            const Vb = { x: x + width / 2, y: y + height };     // Bottom
            const Vl = { x: x, y: y + height / 2 };             // Left

            // Helper function to interpolate between two points
            function lerp(p1: { x: number, y: number }, p2: { x: number, y: number }, t: number) {
                return {
                    x: (1 - t) * p1.x + t * p2.x,
                    y: (1 - t) * p1.y + t * p2.y
                };
            }

            // Interpolated points before/after each corner for curves
            const P_tl_t = lerp(Vt, Vl, f);
            const P_tr_t = lerp(Vt, Vr, f);

            const P_rt_r = lerp(Vr, Vt, f);
            const P_rb_r = lerp(Vr, Vb, f);

            const P_br_b = lerp(Vb, Vr, f);
            const P_bl_b = lerp(Vb, Vl, f);

            const P_lb_l = lerp(Vl, Vb, f);
            const P_lt_l = lerp(Vl, Vt, f);

            // Start drawing the curved rhombus
            ctx.beginPath();
            ctx.moveTo(P_tl_t.x, P_tl_t.y);

            // Top corner
            ctx.quadraticCurveTo(Vt.x, Vt.y, P_tr_t.x, P_tr_t.y);
            ctx.lineTo(P_rt_r.x, P_rt_r.y);

            // Right corner
            ctx.quadraticCurveTo(Vr.x, Vr.y, P_rb_r.x, P_rb_r.y);
            ctx.lineTo(P_br_b.x, P_br_b.y);

            // Bottom corner
            ctx.quadraticCurveTo(Vb.x, Vb.y, P_bl_b.x, P_bl_b.y);
            ctx.lineTo(P_lb_l.x, P_lb_l.y);

            // Left corner
            ctx.quadraticCurveTo(Vl.x, Vl.y, P_lt_l.x, P_lt_l.y);
            ctx.lineTo(P_tl_t.x, P_tl_t.y);

            ctx.closePath();
            ctx.stroke();
        }
        if (el.type === "arrow") {
            //DONE BY GPT 
            setTestx1(el.x1)
            setTestx2(el.x2)
            setTesty1(el.y1)
            setTesty2(el.y2)

            const p0 = { x: el.x1, y: el.y1 };          // Start point
            const p1 = el.points?.[0];                  // Control point
            const p2 = { x: el.x2, y: el.y2 };          // End point

            if (p1) {
                // Calculate implicit control point for quadratic curve
                const controlPointX = 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x;
                const controlPointY = 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y;

                // Draw curved arrow line
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.quadraticCurveTo(controlPointX, controlPointY, p2.x, p2.y);
                ctx.stroke();

                // Calculate angle at the arrowhead using the tangent at the end
                const tangentDx = p2.x - controlPointX;
                const tangentDy = p2.y - controlPointY;
                const angle = Math.atan2(tangentDy, tangentDx);

                // Determine arrowhead size
                const lineLength = Math.sqrt(
                    Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)
                );
                const headLength = Math.min(lineLength * 0.2, 20) + (el.strokeWidth ?? 1) * 2;

                // Draw the arrowhead
                ctx.save();
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
                ctx.restore();
            }



        }


    }
    

   

    return (
        //Tailwind doesnot work with canvas
        <div style={{ position: "relative" }}>

            <div style={{ position: "relative", zIndex: 10 }}>
                <Button onClick={() => (setShape('rectangle'))} >Rectangle</Button>
                <Button onClick={() => (setShape('circle'))} >Circle</Button>
                <Button onClick={() => (setShape('triangle'))} >Triangle</Button>
                <Button onClick={() => (setShape('diamond'))} >Diamond</Button>
                <Button onClick={() => (setShape('flexible_circle'))} >Flexible Circle</Button>
                <Button onClick={() => (setShape('arrow'))} >Arrow</Button>
                <Button onClick={() => (setColor('red'))}>Red</Button>
                <Button onClick={() => (setColor('green'))}>Green</Button>
                <Button onClick={() => (setColor('blue'))}>Blue</Button>
                <p>Selected Shape: {shape}</p>
                <p>Selected Color: {color}</p>
                <p> x1,y1 :- {testx1} {testy1}</p>
                <p> x2,y2 :- {testx2} {testy2}</p>
            </div>

            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{ border: "3px solid #ccc", position: "absolute", top: 0, left: 0 }}
            />

        </div>
    )
}

*/
'use client'
import {
    PiArrowRight,
    PiCircle,
    PiCircleFill,
    PiCursor,
    PiCursorFill,
    PiDiamond,
    PiDiamondFill,
    PiEraser,
    PiEraserFill,
    PiLineVertical,
    PiLineVerticalLight,
    PiMinus,
    PiPencil,
    PiPencilFill,
    PiPlus,
    PiSquare,
    PiSquareFill,
} from "react-icons/pi";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { renderDraws } from "@/lib/canvas/drawFunctions";
import { calculateFarthestPoints, handleShapeSelectionBox, moveDraw, resizeDraw } from "@/lib/canvas/updateFunctions";
import { BsFonts } from "react-icons/bs";
import { LiaHandPaper, LiaHandRock } from "react-icons/lia";
import { TbZoom } from "react-icons/tb";
import { getDrawAtPosition, hoverOverSelectionBox } from "@/lib/canvas/selectFunctions";
import { GiLaserGun } from "react-icons/gi";
import { ThemeToggle } from "../ui/themetoggle";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { useSheetStore } from "@/store/Sheets";
import { Toaster, toast } from 'sonner'
import { AxiosError, AxiosResponse } from "axios";
import axios from '@/lib/axios'
import { ApiError } from "@repo/backend-common";
import { SheetWithId } from "@/types/sheet.type";
import Link from "next/link";
import { ModeToggle } from "../ui/modetoggle";
import CanvasMobile from "./canvas-mobile";
import { draw_elementsType } from "@/types/sheet.type";
import { SheetDataType } from "@/types/sheet.type";
import { ApiResponse, CreateRoomSheetSessionResponse } from "@/types/responses.type";
import { Input } from "../ui/input";
import { Check, Copy, Info, Loader2 } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { broadcastAction, cleanElement } from "@/lib/canvas/websocketActions";
import { useSessionManager } from "@/hooks/use-session-manager";
import { loginAsGuest } from "@/actions/loginGuest.action";
import { loadSheetWithSheetId } from "@/actions/loadSheet.action";
import { joinToRoom } from "@/actions/joinRoom.action";
import { useSingleSheetTab } from "@/hooks/use-single-sheet-tab";



export default function Canvas({ sheetId, roomId }: { sheetId: string, roomId?: string }) {


    //USESTATES
    // ------------------------------------
    //RenderInterval
    // const [canvasSize, setCanvasSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 })
    const [isClient, setIsClient] = useState(false); //FOR WEBSOCKETS ONLY 
    const [activeAction, setActiveAction] = useState<"select" | "move" | "draw" | "resize" | "edit" | "erase" | "pan" | "zoom" | "laser">("select");
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // ------------------------------------
    //handleMouseDown -> Draw 
    const [activeShape, setActiveShape] = useState<"rectangle" | "diamond" | "circle" | "line" | "arrow" | "text" | "freeHand">("rectangle");
    const [selectedShape, setSelectedShape] = useState<| "rectangle" | "diamond" | "circle" | "line" | "arrow" | "text" | "freeHand" | null>(null);
    const [activeStrokeColor, setActiveStrokeColor] = useState<string>("#eeeeee");
    const [activeFillStyle, setActiveFillStyle] = useState<string>("#eeeeee00");
    const [activestrokeWidth, setActivestrokeWidth] = useState<number>(2);
    const [activeFont, setActiveFont] = useState<string>("Arial");
    const [activeFontSize, setActiveFontSize] = useState<string>("20");

    // ------------------------------------
    //zoomtopoint 
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    //-------------------------------------

    //For Auth Checking & For Zustand update roomid :-
    const { status, updateRoomId, userData, logout, login } = useAuthStore((state) => (state))

    //-------------------------------------

    //For Zustan Sheet Load and saving :-
    const { saveSheets, sheetData, saveSheet, getSheet } = useSheetStore((state) => (state))

    //-------------------------------------

    // LODERS :- 
    const [loggingOutLoader, setLoggingOutLoader] = useState(false)
    const [savebtnLoader, setSavebtnLoader] = useState<boolean>(false)
    const [sessionLoader, setSessionLoader] = useState<boolean>(false)
    const [copied, setCopied] = useState<boolean>(false);



    //------------------------------------
    const router = useRouter();

    //Guest/User session expiry logout :- 
    //is guest or user session expired push to login page -> this is a hook made
    useSessionManager({ userData, logout, router, setLoggingOutLoader })

    //-------------------------------------

    // Custom hook to manage that owner doesnot open the same sheet in another tab 
    useSingleSheetTab(sheetId, sheetData?.[sheetId]?.ownerId === userData?.id, 'This sheet is open in another tab. Closing this sheet...')




    // ------------------------------------------------------------------------
    //USEREFS 

    // ------------------------------------
    //FOR FIRST useEffect :- 

    const selectedShapeRef = useRef(selectedShape);
    const isDraggingRef = useRef<boolean>(isDragging);

    // ------------------------------------
    //RenderInterval 
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const diagrams = useRef<draw_elementsType[]>([]);
    const activeDraw = useRef<draw_elementsType | null>(null); //chnaged here 
    const shapeSelectionBox = useRef<draw_elementsType | null>(null); //changed here 
    const activeActionRef = useRef(activeAction);
    const selectedDraw = useRef<draw_elementsType>(null);
    const toErase = useRef<draw_elementsType[]>([]);
    const panOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const scale = useRef<number>(1);
    const panStartPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // ------------------------------------
    //handleMouseDown -> Draw 
    const startX = useRef<number | null>(null);
    const startY = useRef<number | null>(null);
    const activeShapeRef = useRef(activeShape);
    const activeStrokeColorRef = useRef<string>(activeStrokeColor);
    const activeFillStyleRef = useRef<string>(activeFillStyle);
    const activestrokeWidthRef = useRef<number>(activestrokeWidth);
    const activeFontRef = useRef<string>(activeFont);
    const activeFontSizeRef = useRef<string>(activeFontSize);
    const textInp = useRef<string>("");

    // ------------------------------------
    //handleMouseDown -> Select 
    const movingOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const intialPointsForFreeHandMove = useRef<{ initialPoint: { x: number; y: number }, originalPoints: { x: number; y: number }[] } | null>(null);
    const originalDrawState = useRef<draw_elementsType>(null);
    const resizingInfo = useRef<
        | "topLeft"
        | "topRight"
        | "bottomRight"
        | "bottomLeft"
        | "left"
        | "right"
        | "top"
        | "bottom"
        | `point-${number}`
        | null
    >(null);
    const farthestPointsInfoForLineAndArror = useRef<{
        farthestLeftPoint: { point: "start" | "end" | "point"; x: number };
        farthestRightPoint: { point: "start" | "end" | "point"; x: number };
        farthestTopPoint: { point: "start" | "end" | "point"; y: number };
        farthestBottomPoint: { point: "start" | "end" | "point"; y: number };
    } | null>(null);
    const editCounterRef = useRef<number>(0);


    // ------------------------------------
    // handleMouseDown -> Erase 
    const isErasing = useRef<boolean>(false);

    // ------------------------------------
    //handleMouseMove -> Draw 
    const currentX = useRef<number | null>(null);
    const currentY = useRef<number | null>(null);

    // ------------------------------------
    //handleMouseMove -> Resize 
    const modifiedDrawState = useRef<draw_elementsType>(null);
    // ------------------------------------

    //if dark mode active :- 
    const [darkMode, setDarkMode] = useState<boolean>(false)


    //-------------------------------------
    //for laser in handleMouseDown 
    const laserTrailRef = useRef<{ x: number; y: number; time: number }[]>([]);
    const laserStartedRef = useRef<boolean>(false)

    //------------------------------------
    //active users currently drawing/rendering draws <- WebSocket related
    const activeUsersRef = useRef<Map<string, { username: string; lastActive: number }>>(new Map());
    const diagramUserMapRef = useRef<Map<string, string>>(new Map());
    const inputRef = useRef<HTMLInputElement>(null)

    //------------------------------------

    //Websocket related :- 
    const [startSession, setStartSession] = useState<boolean>(false)
    const [token, setToken] = useState<string>('')
    const { socket, isLoading, isError, lastMessage } = useWebSocket(
        `${process.env.NEXT_PUBLIC_WS_URL}?accessToken=${token}`,
        startSession,
        diagrams,
        userData?.id,
        activeUsersRef,
        diagramUserMapRef
    );


    //------------------------------------

    //websocket messages + guest/user session expiry message 
    useEffect(() => {
        if (lastMessage) {
            if (isError) toast.error(lastMessage)
            else toast(lastMessage);
        }

        if (loggingOutLoader) toast.info("Logging out...")

    }, [lastMessage, isError, loggingOutLoader]);

    //For fetching sheets from zustand sheets and rendering it also checks if user is logged in or not
    useEffect(() => {

        if (!status) {
            router.replace("/login");
        }

        // waiting until data loads
        if (!sheetId || !sheetData || !sheetData[sheetId]) {
            return;
        }

        const fetchDraws = async () => {

            if (!sheetData[sheetId]) {
                toast.error("SheetId not Found")
                return;
            }
            const draws = sheetData[sheetId]?.data;

            if (!draws) {
                return;
            }

            diagrams.current = draws;
        };

        fetchDraws();

    }, [sheetData, sheetId, status, router]);


    //For activeStrokeColor and activeFillStyle white in dark mode and black in light mode 
    useEffect(() => {
        const updateColorScheme = () => {
            const htmlClass = document.querySelector("html")?.className || "";
            const isDark = htmlClass.includes("dark");
            setDarkMode(isDark ? true : false)
            setActiveStrokeColor(isDark ? "#eeeeee" : "#000000");
            setActiveFillStyle(isDark ? "#eeeeee00" : "#00000000");
        };

        updateColorScheme(); // initial run

        const observer = new MutationObserver(updateColorScheme);

        const htmlEl = document.querySelector("html");
        if (htmlEl) {
            observer.observe(htmlEl, { attributes: true, attributeFilter: ["class"] });
        }

        return () => observer.disconnect();
    }, []);

    //change color of current diagrams making them suitable for dark mode/light mode -> if diagram was drawin in light mode and when dark mode is switched change to dark color and vice versa 
    useEffect(() => {
        if (!diagrams || diagrams.current.length === 0) return;

        const updatedDiagrams = diagrams.current.map(el => {
            let strokeColor = el.strokeColor;
            // let fillStyle = el.fillStyle;

            // Only change black or white strokes/fills (avoid messing with user-custom colors)
            if (darkMode) {
                if (el.strokeColor === "#000000" || el.strokeColor === "#1e1e1e") strokeColor = "#ffffff";
                // if (el.fillStyle === "#ffffff"  ) fillStyle = "#333333";
            } else {
                if (el.strokeColor === "#ffffff" || el.strokeColor === "#eeeeee") strokeColor = "#000000";
                // if (el.fillStyle === "#333333") fillStyle = "#ffffff";

            }

            return {
                ...el,
                strokeColor,
                // fillStyle,
            };
        });

        diagrams.current = updatedDiagrams // update state for rendering
    }, [darkMode]);


    //When canvas is rendered and when drawing starts initialize all refs and trigger when cursor style changes 
    useEffect(() => {

        //1) Sync Refs with State
        activeShapeRef.current = activeShape;
        activeActionRef.current = activeAction;
        selectedShapeRef.current = selectedShape;
        isDraggingRef.current = isDragging;
        activeStrokeColorRef.current = activeStrokeColor;
        activeFillStyleRef.current = activeFillStyle;
        activestrokeWidthRef.current = activestrokeWidth;
        activeFontRef.current = activeFont;
        activeFontSizeRef.current = activeFontSize;

        //2) Set Canvas Cursor Style so that if diferent cursor is called then this will trigger
        if (canvasRef.current) {
            canvasRef.current.focus();
            switch (activeActionRef.current) {
                case "pan":
                    if (isDraggingRef.current) {
                        canvasRef.current.style.cursor = "grabbing";
                    } else {
                        canvasRef.current.style.cursor = "grab";
                    }
                    break;
                case "zoom":
                    canvasRef.current.style.cursor = "zoom-in";
                    break;
                case "select":
                    canvasRef.current.style.cursor = "default";
                    break;
                case "move":
                    canvasRef.current.style.cursor = "move";
                    break;
                case "draw":
                    canvasRef.current.style.cursor = "crosshair";
                    break;
                case "resize":
                    canvasRef.current.style.cursor = "default";
                    break;
                case "edit":
                    canvasRef.current.style.cursor = "text";
                    break;
                case "erase":
                    canvasRef.current.style.cursor = "cell";
                    break;
                case "laser":
                    canvasRef.current.style.cursor = "pointer";
                    break;
            }
        }

        //3) Update Selected Shape's Style (Live Sync) :- 
        if (selectedDraw.current) {
            selectedDraw.current.fillStyle = activeFillStyleRef.current;
            selectedDraw.current.strokeColor = activeStrokeColorRef.current;
            selectedDraw.current.strokeWidth = activestrokeWidthRef.current;
            selectedDraw.current.font = activeFontRef.current;
            if (
                selectedDraw.current.fontSize === "20" ||
                selectedDraw.current.fontSize === "40" ||
                selectedDraw.current.fontSize === "60"
            ) {
                selectedDraw.current.fontSize = activeFontSizeRef.current;
            }
        }


    }, [activeShape, activeAction, isDragging, selectedShape, activeStrokeColor, activeFillStyle, activestrokeWidth, activeFont, activeFontSize]);


    //THIS IS NEEDED -> because client side code is also rendered on server so we only load the canvas in client side so when the code comes to the client set it true so that canvas can get the window object for window.innerHeight , window.innerWidth
    useEffect(() => {
        setIsClient(true);
    }, []);

    //drawing rendering 
    useEffect(() => {

        // setCanvasSize({ width: window.innerWidth, height: window.innerHeight });

        if (!canvasRef.current) return
        const canvasCurrent = canvasRef.current;

        const ctx = canvasCurrent.getContext("2d");
        if (!ctx) return;
        canvasCurrent.focus();

        //Responsible for drawing every  15 milliseconds -> 60 frames per second -> for smooth draw
        const renderInterval = setInterval(() => {
            renderDraws(
                ctx,
                canvasCurrent,
                diagrams.current,
                activeDraw.current,
                shapeSelectionBox.current,
                activeActionRef.current,
                selectedDraw.current,
                toErase.current,
                panOffset.current,
                scale.current,
                laserTrailRef.current,
                activeUsersRef,
                diagramUserMapRef
            );
        }, 15);

        //Gets Mouse Position
        const getMousePosition = (event: MouseEvent) => {
            return {
                offsetX: (event.offsetX - panOffset.current.x) / scale.current,
                offsetY: (event.offsetY - panOffset.current.y) / scale.current,
            };
        };


        function handleMouseDown(event: MouseEvent) {
            setIsDragging(true);

            const { offsetX, offsetY } = getMousePosition(event);

            //panning means moving canvas
            if (activeActionRef.current === "pan") {
                panStartPoint.current = { x: event.offsetX, y: event.offsetY };
                return;
            }

            //select 
            if (activeActionRef.current === "select") {
                if (!ctx) return
                //1. Get what user clicked on
                const draw = getDrawAtPosition(offsetX, offsetY, diagrams.current, ctx);
                const hoveredSelectionBox = hoverOverSelectionBox(shapeSelectionBox.current!, offsetX, offsetY);

                //2. If user clicked on a shape (not a resize handle):
                //CHECK IF ANY ERROR IN SELECTION USE ! IF NOT WORKING
                if (!hoveredSelectionBox && draw) {
                    if (!draw.fillStyle || !draw.strokeColor || !draw.strokeWidth) return
                    setActiveFillStyle(draw?.fillStyle);
                    setActiveStrokeColor(draw?.strokeColor);
                    setActivestrokeWidth(draw?.strokeWidth);
                    if (draw?.type === "text") {
                        setActiveFont(draw.font!);
                        setActiveFontSize(draw.fontSize!);
                    }
                }

                //3. If selected shape is text, store position
                if (draw?.type === "text") {
                    currentX.current = offsetX;
                    currentY.current = offsetY;
                }

                //4. If user clicked on a shape (but not a resize handle): Start Moving
                if (draw && !hoveredSelectionBox?.position.includes("point")) {
                    shapeSelectionBox.current = handleShapeSelectionBox(draw, ctx);
                    setActiveAction("move");
                    movingOffset.current = {
                        x: offsetX - draw.x1!,
                        y: offsetY - draw.y1!
                    };
                    intialPointsForFreeHandMove.current = {
                        initialPoint: {
                            x: offsetX,
                            y: offsetY,
                        },
                        originalPoints: draw.points
                            ? JSON.parse(JSON.stringify(draw.points))
                            : [],
                    };
                    selectedDraw.current = draw;
                    setSelectedShape(draw.type);
                    setActiveShape(draw.type);
                    originalDrawState.current = JSON.parse(JSON.stringify(draw));
                }
                //5. If user clicked on resize handle: Start Resizing
                else if (hoveredSelectionBox) {
                    setActiveAction("resize");
                    resizingInfo.current = hoveredSelectionBox.position;
                    farthestPointsInfoForLineAndArror.current = calculateFarthestPoints(
                        selectedDraw.current!
                    );
                    intialPointsForFreeHandMove.current = {
                        initialPoint: {
                            x: offsetX,
                            y: offsetY,
                        },
                        originalPoints: selectedDraw.current!.points
                            ? JSON.parse(JSON.stringify(selectedDraw.current!.points))
                            : [],
                    };
                    originalDrawState.current = JSON.parse(
                        JSON.stringify(selectedDraw.current)
                    );
                }
                //6. If clicked on empty space: Deselect everything
                else {
                    setActiveAction("select");
                    editCounterRef.current = 0;
                    selectedDraw.current = null;
                    setSelectedShape(null);
                    shapeSelectionBox.current = null;
                }
            }

            //Edit 
            if (activeActionRef.current === "edit") {
                if (selectedDraw.current && selectedDraw.current.type === "text") {

                    //1. Push edited text back to canvas:
                    if (!socket) diagrams.current.push(selectedDraw.current);


                    //WEBSCOKET - Broadcast edit text
                    if (originalDrawState.current && selectedDraw.current && socket) {

                        if (!isLoading) {
                            if (socket.current) {

                                // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                                broadcastAction({ element: cleanElement(selectedDraw.current) }, socket.current)

                            }
                        }
                        modifiedDrawState.current = null;
                        // originalDrawState.current = null;
                        originalDrawState.current = JSON.parse(
                            JSON.stringify(selectedDraw.current)
                        );
                    }

                    //2. Reset editing state:
                    textInp.current = "";
                    selectedDraw.current = null;
                    setSelectedShape(null);
                    shapeSelectionBox.current = null;
                    setActiveAction("select");
                    return;
                }
            }

            //Erase -> set isErasing = true
            if (activeActionRef.current === "erase") {
                isErasing.current = true;
            }

            //Drawing the shape :- 
            if (activeActionRef.current === "draw") {



                //WEBSCOKET - Broadcast text
                if (activeDraw.current && activeDraw.current.type === "text") {
                    diagrams.current.push(activeDraw.current);
                    if (!isLoading) {
                        if (socket.current) {
                            // console.log('Proceeding to BroadcastAction Funtion')
                            broadcastAction({ element: activeDraw.current }, socket.current)
                            // console.log('Finished BroadcastAction Funtion')
                        }
                    }
                    textInp.current = "";
                    activeDraw.current = null;
                    shapeSelectionBox.current = null;
                    setActiveAction("select");
                    return;
                }

                // 1) Start a new shape 
                const currentActiveShape = activeShapeRef.current;
                const isDrawing = currentActiveShape === "freeHand";
                const isLineOrArrow = currentActiveShape === "line" || currentActiveShape === "arrow";
                const isText = currentActiveShape === "text";

                //NOTE :- if currentshape is text and after typing if he clicks anywhere else on the canvas we want the text to get saved so just return as it will skip the handleMouseDown event 
                // if this condition is not written and if user clicks on the blank canvas after typing the text box will again change its position to the place where user clicked -> so basically we dont want to record the second click of user for the handleMouseDown event 
                if (isText && editCounterRef.current === 1) return;

                // 2) Store the starting mouse position
                startX.current = offsetX;
                startY.current = offsetY;

                // 3) Save the current shape being drawn in activeDraw ref 
                activeDraw.current = {

                    id: Date.now().toString(), // -> since this is user personal sheet so no room logic so removed userId
                    type: currentActiveShape,
                    strokeColor: activeStrokeColorRef.current,
                    fillStyle: isText
                        ? activeStrokeColorRef.current
                        : isDrawing
                            ? "transparent"
                            : activeFillStyleRef.current,
                    strokeWidth: activestrokeWidthRef.current,
                    points:
                        isDrawing || isLineOrArrow
                            ? [{ x: startX.current, y: startY.current }]
                            : [],
                    x1: isDrawing ? undefined : startX.current,
                    y1: isDrawing ? undefined : startY.current,
                    text: isText ? textInp.current : "",
                    font: activeFontRef.current,
                    fontSize: activeFontSizeRef.current,
                };

                // 4) If it's a text shape, show the selection box when clicked on anywhere in canvas so that typing can start :-
                if (isText && ctx !== null) {

                    shapeSelectionBox.current = handleShapeSelectionBox(activeDraw.current!, ctx)

                }

            }

            if (activeActionRef.current === "laser") {
                laserStartedRef.current = true;
            }


        }

        function handleMouseMove(event: MouseEvent) {

            const canvasCurrent = canvasRef.current!;

            //panning mode
            if (activeActionRef.current === "pan") {
                if (isDraggingRef.current) {
                    canvasCurrent.style.cursor = "grabbing";
                    const dx = event.offsetX - panStartPoint.current.x;
                    const dy = event.offsetY - panStartPoint.current.y;
                    panOffset.current.x += dx;
                    panOffset.current.y += dy;
                    panStartPoint.current.x = event.offsetX;
                    panStartPoint.current.y = event.offsetY;
                } else {
                    canvasCurrent.style.cursor = "grab";
                }
                return;
            }

            const { offsetX, offsetY } = getMousePosition(event);

            //select mode
            if (activeActionRef.current === "select") {
                if (!ctx) return
                const hoveredDraw = getDrawAtPosition(
                    offsetX,
                    offsetY,
                    diagrams.current,
                    ctx
                );

                const hoveredSelectionBox = hoverOverSelectionBox(
                    shapeSelectionBox.current,
                    offsetX,
                    offsetY
                );

                canvasCurrent.style.cursor = hoveredSelectionBox
                    ? hoveredSelectionBox.cursor
                    : hoveredDraw
                        ? "move"
                        : "default";
                return;
            }

            //resize -> shows reizse handle , then draws new drawing , replaces it with the old one shows selection box for ui  
            if (activeActionRef.current === "resize") {
                if (!ctx) return
                const hoveredSelectionBox = hoverOverSelectionBox(
                    shapeSelectionBox.current!,
                    offsetX,
                    offsetY
                );

                canvasCurrent.style.cursor = hoveredSelectionBox?.cursor || "default";

                const draw = resizeDraw(
                    resizingInfo.current!,
                    offsetX,
                    offsetY,
                    selectedDraw.current!,
                    diagrams.current,
                    farthestPointsInfoForLineAndArror.current,
                    intialPointsForFreeHandMove.current
                );

                if (!draw) return;

                modifiedDrawState.current = JSON.parse(JSON.stringify(draw));
                shapeSelectionBox.current = handleShapeSelectionBox(draw, ctx);

                return;
            }

            //move -> drags the drawing updates all coordinates while moving then -> replaces new position with old position -> for ui it will also show selection box 
            if (activeActionRef.current === "move") {
                if (!ctx) return
                canvasCurrent.style.cursor = "move";
                const draw = moveDraw(
                    offsetX,
                    offsetY,
                    movingOffset.current.x,
                    movingOffset.current.y,
                    selectedDraw.current!,
                    diagrams.current,
                    intialPointsForFreeHandMove.current
                );

                modifiedDrawState.current = JSON.parse(JSON.stringify(draw));

                if (!draw) return;

                shapeSelectionBox.current = handleShapeSelectionBox(draw, ctx);
            }

            //Drawing Mode :- 
            if (activeActionRef.current === "draw") {

                //1) Reset selection box
                shapeSelectionBox.current = null;

                //2) Set cursor style :- if text then cursor -> | , if Drawing cursor style -> +  
                if (activeShapeRef.current === "text") {
                    canvasCurrent.style.cursor = "text";
                } else {
                    canvasCurrent.style.cursor = "crosshair";
                }

                //3) If nothing is being drawn, exit
                if (!activeDraw.current) return;

                //4) Get current mouse position
                currentX.current = offsetX;
                currentY.current = offsetY;

                //5) If Freehand drawing -> keep adding the points 
                if (activeDraw.current.type === "freeHand") {
                    activeDraw.current.points?.push({
                        x: currentX.current,
                        y: currentY.current,
                    });
                }

                //6) For Other shapes :- 
                else if (activeDraw.current.type !== "text") {

                    // a) Rectangle, Circle etc -> store endpoints:- 
                    activeDraw.current.x2 = currentX.current;
                    activeDraw.current.y2 = currentY.current;

                    //b) lINE, Arrow -> store midpoints to hightlight as control point :- 
                    if (
                        activeDraw.current.type === "line" ||
                        activeDraw.current.type === "arrow"
                    ) {
                        activeDraw.current.points = [
                            {
                                x: (activeDraw.current.x1! + activeDraw.current.x2!) / 2,
                                y: (activeDraw.current.y1! + activeDraw.current.y2!) / 2,
                            },
                        ];
                    }
                }
                //7) For Text -> Mark as Selected , Show a selection box around text while moving the mouse also , Set text shape is now active. :- 
                else {
                    // console.log("i am moving")
                    if (ctx === null) return;
                    selectedDraw.current = activeDraw.current;
                    shapeSelectionBox.current = handleShapeSelectionBox(activeDraw.current, ctx);
                    // setSelectedShape(activeDraw.current.type);
                    setActiveShape(activeDraw.current.type);
                }
            }

            //erase mode -> sets cursor style 
            if (activeActionRef.current === "erase") {
                canvasCurrent.style.cursor = "cell";
            }

            //erase mode -> if erasing currently -> finds the shape under the mouse -> pushes that shape to toErase array ref
            if (activeActionRef.current === "erase" && isErasing.current) {
                if (!ctx) return
                const hoveredOver = getDrawAtPosition(
                    offsetX,
                    offsetY,
                    diagrams.current,
                    ctx
                );

                if (hoveredOver) {
                    if (!toErase.current.includes(hoveredOver)) {
                        toErase.current.push(hoveredOver);
                    }
                }
                console.log(toErase.current)
            }

            if (activeActionRef.current === "laser" && laserStartedRef.current === true) {
                laserTrailRef.current.push({
                    x: offsetX,
                    y: offsetY,
                    time: Date.now(),
                });
            }

        }

        function handleMouseUp(event: MouseEvent) {
            const canvasCurrent = canvasRef.current!;
            setIsDragging(false);

            if (activeActionRef.current === "pan") {
                canvasCurrent.style.cursor = "grab";
                return;
            }

            const { offsetX, offsetY } = getMousePosition(event);

            //select mode sets cursor style to default
            if (activeActionRef.current === "select") {
                canvasCurrent.style.cursor = "default";
                return;
            }

            //erase mode
            if (activeActionRef.current === "erase" && isErasing.current) {
                //1. Remove selected shapes to be erased 
                // console.log("toerase", toErase.current)
                diagrams.current = diagrams.current.filter(
                    (draw) => !toErase.current.includes(draw)
                );
                // console.log("toerase", toErase.current)


                //WEBSCOKET - Broadcast erase shape
                toErase.current.forEach((draw) => {
                    // console.log("DRAW - ", draw)
                    if (!isLoading) {
                        if (socket.current) {

                            broadcastAction({ element: draw, removeShape: true }, socket.current)

                        }
                    }
                });


                //2. Resets toErase array
                isErasing.current = false;
                toErase.current = [];
                return;
            }

            //resize
            if (activeActionRef.current === "resize") {
                //1) check if drawing selected is present 
                if (!selectedDraw.current) return;

                //2) If the shape is rectangle, diamond, or circle for top-left to bottom-right coordinate:
                //     2.2) if (x2 < x1) swap(x1, x2);
                //     2.3) if (y2 < y1) swap(y1, y2);
                if (
                    selectedDraw.current!.type === "rectangle" ||
                    selectedDraw.current!.type === "diamond" ||
                    selectedDraw.current!.type === "circle"
                ) {
                    if (selectedDraw.current!.x2! < selectedDraw.current!.x1!) {
                        const a = selectedDraw.current!.x2;
                        selectedDraw.current!.x2 = selectedDraw.current!.x1;
                        selectedDraw.current!.x1 = a;
                    }
                    if (selectedDraw.current!.y2! < selectedDraw.current!.y1!) {
                        const a = selectedDraw.current!.y2;
                        selectedDraw.current!.y2 = selectedDraw.current!.y1;
                        selectedDraw.current!.y1 = a;
                    }
                }


                //WEBSCOKET - RESIZE
                if (originalDrawState.current && modifiedDrawState.current && socket) {

                    if (!isLoading) {
                        if (socket.current) {

                            // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                            broadcastAction({ element: cleanElement(modifiedDrawState.current) }, socket.current)

                        }
                    }

                    modifiedDrawState.current = null;
                    originalDrawState.current = null;
                }

                setActiveAction("select");
                resizingInfo.current = null;
                return;
            }

            //move mode 
            if (activeActionRef.current === "move") {
                if (
                    currentX.current === offsetX &&
                    currentY.current === offsetY &&
                    selectedDraw.current?.type === "text"
                ) {
                    if (editCounterRef.current < 1) {
                        // console.log("hello select")
                        editCounterRef.current++;
                        setActiveAction("select");
                    } else {
                        // console.log("hello")
                        setActiveAction("edit");
                        originalDrawState.current = JSON.parse(
                            JSON.stringify(selectedDraw.current)
                        );
                        canvasCurrent.style.cursor = "text";
                        editCounterRef.current = 0;
                    }
                    return;
                }


                //WEBSCOKET - MOVE
                if (originalDrawState.current && modifiedDrawState.current && socket) {

                    if (!isLoading) {
                        if (socket.current) {

                            // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                            broadcastAction({ element: cleanElement(modifiedDrawState.current) }, socket.current)
                        }
                    }

                    modifiedDrawState.current = null;
                    originalDrawState.current = null;

                }

                setActiveAction("select");
            }

            if (activeActionRef.current === "draw") {

                //1) Exit early if no active shape
                if (!activeDraw.current) return;

                //2) If first click then let the user type , on second click anywhere on the canvas save the text
                if (activeDraw.current.type === "text") {
                    if (editCounterRef.current < 1) {
                        editCounterRef.current++;
                        return
                    }
                    else {
                        diagrams.current.push(activeDraw.current);
                        textInp.current = "";
                        activeDraw.current = null;
                        editCounterRef.current = 0;
                        return;
                    }
                }

                //3) For all shapes except freehand, we now finalize its size.
                if (activeDraw.current.type !== "freeHand") {

                    //3.1) Set the endpoint
                    activeDraw.current.x2 = offsetX;
                    activeDraw.current.y2 = offsetY;

                    //3.2) If the shape is rectangle, diamond, or circle for top-left to bottom-right coordinate:
                    //     3.2.1) if (x2 < x1) swap(x1, x2);
                    //     3.2.2) if (y2 < y1) swap(y1, y2);
                    if (
                        activeDraw.current.type === "rectangle" ||
                        activeDraw.current.type === "diamond" ||
                        activeDraw.current.type === "circle"
                    ) {
                        if (activeDraw.current.x2 < activeDraw.current.x1!) {
                            const a = activeDraw.current.x2;
                            activeDraw.current.x2 = activeDraw.current.x1;
                            activeDraw.current.x1 = a;
                        }
                        if (activeDraw.current.y2 < activeDraw.current.y1!) {
                            const a = activeDraw.current.y2;
                            activeDraw.current.y2 = activeDraw.current.y1;
                            activeDraw.current.y1 = a;
                        }
                    }

                    //3.3) lINE, Arrow -> store midpoints to hightlight as control point :- 
                    else if (
                        activeDraw.current.type === "line" ||
                        activeDraw.current.type === "arrow"
                    ) {
                        activeDraw.current.points = [
                            {
                                x: (activeDraw.current.x1! + activeDraw.current.x2!) / 2,
                                y: (activeDraw.current.y1! + activeDraw.current.y2!) / 2,
                            },
                        ];
                    }
                }

                //4) Push it to diagrams array
                diagrams.current.push(activeDraw.current);


                //WEBSCOKET - DRAW
                if (!isLoading) {
                    // console.log('The socket is ', socket.current)
                    if (socket.current) {
                        // console.log('Broadcasting the Shape - Proceeding to BroadcastAction')
                        broadcastAction({ element: activeDraw.current }, socket.current)
                        // console.log('Broadcasted the Shape - exiting from BroadcastAction')
                    }
                }

                //5) Reset the setting 
                activeDraw.current = null;
                startX.current = null;
                startY.current = null;
            }

            if (activeActionRef.current === "laser") {
                laserStartedRef.current = false
                laserTrailRef.current = [];
            }

        }

        //DIDNOT CHECK A LOT 
        const handleKeyDown = (event: KeyboardEvent) => {
            if (activeActionRef.current === "select") {
                return;
            }

            if (activeActionRef.current === "draw") {
                if (!activeDraw.current || activeDraw.current.type !== "text") return;
                event.preventDefault();

                if (event.key === "Enter") {
                    diagrams.current.push(activeDraw.current!);

                    //socket
                    if (socket) {

                        if (!isLoading) {
                            if (socket.current) {

                                broadcastAction({ element: activeDraw.current }, socket.current)

                            }
                        }

                        modifiedDrawState.current = null;
                        originalDrawState.current = null;

                    }

                    textInp.current = "";
                    activeDraw.current = null;
                }
                else if (event.key === "Escape") {
                    textInp.current = "";
                    activeDraw.current = null;
                }
                else if (event.key === "Backspace") {
                    textInp.current = textInp.current.slice(0, -1);
                    activeDraw.current.text = textInp.current;
                }
                else if (event.key.length === 1) {
                    textInp.current += event.key;
                    activeDraw.current.text = textInp.current;
                }
            }

            if (activeActionRef.current === "draw") {
                if (activeDraw.current?.type === "text") {
                    shapeSelectionBox.current = handleShapeSelectionBox(
                        activeDraw.current!,
                        ctx
                    );
                    return;
                }
                shapeSelectionBox.current = null;
            }

            if (activeActionRef.current === "edit") {
                if (!selectedDraw.current || selectedDraw.current.type !== "text")
                    return;

                textInp.current = selectedDraw.current.text || "";

                event.preventDefault();

                if (event.key === "Enter") {
                    diagrams.current.push(selectedDraw.current!);


                    //socket
                    if (originalDrawState.current && selectedDraw.current && socket) {

                        if (!isLoading) {
                            if (socket.current) {

                                broadcastAction({ element: selectedDraw.current }, socket.current)

                            }
                        }

                        modifiedDrawState.current = null;
                        originalDrawState.current = null;

                    }

                    textInp.current = "";
                    selectedDraw.current = null;
                    setSelectedShape(null);
                    shapeSelectionBox.current = null;
                    setActiveAction("select");

                }
                else if (event.key === "Escape") {
                    textInp.current = "";
                    selectedDraw.current = null;
                    setSelectedShape(null);
                    setActiveAction("select");
                }
                else if (event.key === "Backspace") {
                    textInp.current = textInp.current.slice(0, -1);
                    selectedDraw.current.text = textInp.current;
                }
                else if (event.key.length === 1) {
                    textInp.current += event.key;
                    selectedDraw.current.text = textInp.current;
                }
            }

            if (activeActionRef.current === "edit") {
                if (selectedDraw.current?.type === "text") {
                    shapeSelectionBox.current = handleShapeSelectionBox(
                        selectedDraw.current!,
                        ctx
                    );
                    return;
                }
                shapeSelectionBox.current = null;
            }
        };

        //DIDNOT CHECK A LOT 
        const handleScroll = (event: WheelEvent) => {
            event.preventDefault();


            if (activeActionRef.current === "zoom" || event.ctrlKey) {
                const zoomSensitivity = 0.03;
                const newScale = scale.current - event.deltaY * zoomSensitivity;
                zoomToPoint(newScale);
            }
            else {
                panOffset.current.x -= event.deltaX;
                panOffset.current.y -= event.deltaY;
            }
        };

        canvasCurrent?.addEventListener("mousedown", handleMouseDown);
        canvasCurrent?.addEventListener("mousemove", handleMouseMove);
        canvasCurrent?.addEventListener("mouseup", handleMouseUp);
        canvasCurrent.addEventListener("keydown", handleKeyDown);
        canvasCurrent.addEventListener("wheel", handleScroll);

        return () => {
            clearInterval(renderInterval);
            canvasCurrent?.removeEventListener("mousedown", handleMouseDown);
            canvasCurrent?.removeEventListener("mousemove", handleMouseMove);
            canvasCurrent?.removeEventListener("mouseup", handleMouseUp);
            canvasCurrent.removeEventListener("keydown", handleKeyDown);
            canvasCurrent.removeEventListener("wheel", handleScroll);
        };



    }, [isLoading, socket])

    const zoomToPoint = (newScale: number) => {
        const canvasCurrent = canvasRef.current;
        if (!canvasCurrent) return;

        const clampedScale = Math.max(0.1, Math.min(newScale, 10));

        const screenCenterX = canvasCurrent.width / 2;
        const screenCenterY = canvasCurrent.height / 2;

        const worldPointX = (screenCenterX - panOffset.current.x) / scale.current;
        const worldPointY = (screenCenterY - panOffset.current.y) / scale.current;

        panOffset.current.x = screenCenterX - worldPointX * clampedScale;
        panOffset.current.y = screenCenterY - worldPointY * clampedScale;

        scale.current = clampedScale;
        setZoomLevel(clampedScale);
    };

    //SIDE BAR BOX RELATED FUNCTIONS :- 
    const changeActiveFillStyle = (color: string) => {
        setActiveFillStyle(color);
        if (selectedDraw.current) {
            selectedDraw.current.fillStyle = color;

            //socket
            if (originalDrawState.current && originalDrawState.current?.fillStyle !== selectedDraw.current.fillStyle && socket) {

                if (!isLoading) {
                    if (socket.current) {
                        // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                        broadcastAction({ element: cleanElement(selectedDraw.current) }, socket.current)
                    }
                }

                modifiedDrawState.current = null;
                originalDrawState.current = JSON.parse(
                    JSON.stringify(selectedDraw.current)
                );

            }

        }
    };

    const changeActiveStrokeStyle = (color: string) => {

        setActiveStrokeColor(color);

        if (selectedDraw.current) {
            selectedDraw.current.strokeColor = color;

            // socket

            if (originalDrawState.current && originalDrawState.current?.strokeColor !== selectedDraw.current.strokeColor && socket) {

                if (!isLoading) {
                    if (socket.current) {
                        // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                        broadcastAction({ element: cleanElement(selectedDraw.current) }, socket.current)
                    }
                }

                modifiedDrawState.current = null;
                originalDrawState.current = JSON.parse(
                    JSON.stringify(selectedDraw.current)
                );

            }

        }
    };

    const changeActiveLineWidth = (width: number) => {
        setActivestrokeWidth(width);

        if (selectedDraw.current) {
            selectedDraw.current.strokeWidth = width;

            // socket 

            if (originalDrawState.current && originalDrawState.current?.strokeWidth !== selectedDraw.current.strokeWidth && socket) {

                if (!isLoading) {
                    if (socket.current) {
                        // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                        broadcastAction({ element: cleanElement(selectedDraw.current) }, socket.current)
                    }
                }

                modifiedDrawState.current = null;
                originalDrawState.current = JSON.parse(
                    JSON.stringify(selectedDraw.current)
                );

            }


        }
    };

    const changeActiveFont = (font: string) => {
        setActiveFont(font);
        if (selectedDraw.current) {
            selectedDraw.current.font = font;

            //socket
            if (originalDrawState.current && originalDrawState.current?.font !== selectedDraw.current.font && socket) {

                if (!isLoading) {
                    if (socket.current) {

                        // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                        broadcastAction({ element: cleanElement(selectedDraw.current) }, socket.current)
                    }
                }

                modifiedDrawState.current = null;
                originalDrawState.current = JSON.parse(
                    JSON.stringify(selectedDraw.current)
                );

            }
        }
    };

    const changeActiveFontSize = (size: number) => {
        setActiveFontSize(size.toString());
        if (selectedDraw.current) {
            selectedDraw.current.fontSize = size.toString();

            //socket
            if (originalDrawState.current && originalDrawState.current?.fontSize !== selectedDraw.current.fontSize && socket) {

                if (!isLoading) {
                    if (socket.current) {
                        // broadcastAction({ element: cleanElement(originalDrawState.current), removeShape: true }, socket.current)
                        broadcastAction({ element: cleanElement(selectedDraw.current) }, socket.current)
                    }
                }

                modifiedDrawState.current = null;
                originalDrawState.current = JSON.parse(
                    JSON.stringify(selectedDraw.current)
                );

            }


        }
    };

    const handleSaveSheet = async () => {

        setSavebtnLoader(true)

        try {

            const response = await axios.post('/sheets/save-sheet', { sheetId, data: diagrams.current }) as AxiosResponse
            const res = response.data as ApiResponse
            if (res.success === false) {
                throw new Error('handleSaveSheet Error :: Diagrams not saved in database')
            }
            const sheet = res?.data as SheetWithId
            // console.log(sheet)

            //extracting id and making it like id:{}
            const sheetMap: Record<string, SheetDataType> = {
                [sheet.id]: {
                    title: sheet.title,
                    data: sheet.data,
                    createdAt: sheet.createdAt,
                    updatedAt: sheet.updatedAt,
                    ownerId: sheet.ownerId,
                },
            };

            //saving all sheets in zustand store -> no need to call api again and again
            saveSheets(sheetMap)

            toast.success(res.message)

        } catch (err) {

            const error = err as AxiosError

            if (error.response && error.response.data) {

                const data = error.response.data as ApiError;
                console.log(data)
                toast.error(data?.message || "An error occurred while fetching sheets.");

            } else {
                toast.error(error.message || "Unexpected error occurred.");
            }

        } finally {
            setSavebtnLoader(false)
        }

    }

    const getAccessToken = async () => {
        try {

            const response = await axios.get('/users/get-access-token') as AxiosResponse
            const res = response.data as ApiResponse
            if (!res.data) {
                console.log('getAccessToken :: No accessToken found for this user')
                return null
            }

            const accessToken = res.data
            return accessToken

        } catch (err) {

            const error = err as AxiosError

            if (error.response && error.response.data) {

                const data = error.response.data as ApiError;
                toast.error(data?.message || "An error occurred while fetching sheets.");

            } else {
                toast.error(error.message || "Unexpected error occurred.");
            }
        }
    }

    const handleStartWebsocketServer = useCallback(async (givenAccessToken?: string) => {

        let accessToken = givenAccessToken;

        if (!accessToken) {
            const newaccessToken = await getAccessToken()
            if (!newaccessToken || typeof (newaccessToken) !== 'string') return false
            accessToken = newaccessToken
        }

        setToken(accessToken)
        setStartSession(true)
        return true

    }, [])

    const handleStartSession = async () => {

        try {

            setSessionLoader(true)

            //1) Create Room and get the roomid and update in zustand 
            const response = await axios.post('/rooms/create-room-id', { type: "start-session", sheetId: sheetId }) as AxiosResponse
            const res = response.data as ApiResponse
            if (!res.data || typeof (res.data) === 'string') {
                throw new Error('handleStartSession Error :: Failed to create new room')
            }

            const data = res.data as CreateRoomSheetSessionResponse

            const roomId = data.saveRoomId.roomId

            if (roomId) updateRoomId(roomId)

            //2) Start wbsocket server and autherize user 

            const startServerResponse = await handleStartWebsocketServer()
            if (!startServerResponse) {
                throw new Error('handleStartSession :: No AcessToken found or Invalid AcessToken')
            }

            //3) replace the link with canvas/sheetId/roomId 
            if (!isLoading) {
                window.history.replaceState(null, "", `/canvas/myroom/${sheetId}/${roomId}`);

                toast.success(res.message)

            }

        } catch (err) {

            const error = err as AxiosError
            updateRoomId('')

            if (error.response && error.response.data) {

                const data = error.response.data as ApiError;
                toast.error(data?.message || "An error occurred while starting session.");

            } else {
                toast.error(error.message || "Unexpected error occurred.");
            }
        }
        finally {
            setSessionLoader(false)
        }
    }

    const handleCopy = async () => {
        if (!inputRef.current) return
        const value = inputRef.current.value
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleStopSession = () => {

        socket.current?.send(JSON.stringify({ event: "stop-session" }))
        window.history.replaceState(null, "", `/canvas/myroom/${sheetId}`);
        updateRoomId('')
        setToken('')
        setStartSession(false)
        toast.success("Session stopped")
    }

    const handleShareSheet = async () => {

        const shareUrl = `${window.location.origin}/canvas/myroom/${sheetId}/share-allowed`;

        await navigator.clipboard.writeText(shareUrl);

        // setShareLink(shareUrl)
        // localStorage.setItem('originalUser','true')

        toast("Link copied to clipboard!");

    }

    const handleUnAuthorizedUsers = useCallback(async (mode: "session" | "sheet") => {

        //1) login the guest first 
        await loginAsGuest({ login, type: 'canvas', router })
        console.log("Guest login done")

        if (mode === 'session') {
            //2) Load the particular sheet and Join the room
            const link = `${window.location.origin}/canvas/myroom/${sheetId}/${roomId}`
            await joinToRoom({ url: link, saveSheet, updateRoomId, type: 'userFromLink' })
            console.log("Sheet loaded")

            //3) Start Websocket Server 
            await handleStartWebsocketServer()
            console.log("WebSocket started")
        }
        else {
            // 2) Load the sheet for the guest to view and save it in zustand (Temporary only saved ) but if user clicks save then permanent saved 
            await loadSheetWithSheetId({ sheetId, saveSheet })
        }


    }, [login, router, saveSheet, sheetId, handleStartWebsocketServer, roomId, updateRoomId])

    //joining directly link was provided to these users 
    //automatic login for users as guest who join from link and users/guest who join from dashboard 
    useEffect(() => {

        const checkAccess = async () => {

            const shareSheetAllowed = roomId === 'share-allowed'

            try {
                const accessToken = await getAccessToken();
                // console.log(shareSheetAllowed)


                if (accessToken && typeof accessToken === "string" && sheetId && roomId && !shareSheetAllowed) {
                    // Authorized -> guest/user joining from dashboard with the link 
                    // localStorage.setItem("originalUser", "false")
                    if (userData?.roomId) {
                        if (roomId !== userData?.roomId) {
                            console.log('db roomid and user given roomid didnot match :- calling joinToRoom')
                            const link = `${window.location.origin}/canvas/myroom/${sheetId}/${roomId}`
                            await joinToRoom({ url: link, saveSheet, updateRoomId, type: 'userFromLink' })
                            console.log(`joined user to room ${roomId}`)
                        }
                        await handleStartWebsocketServer(accessToken);

                        return
                    }

                }
                if (accessToken && typeof accessToken === "string" && sheetId && !roomId) {
                    // Authorized -> user joining to his personal sheet to draw -> his choice to start websocket connection or not 
                    // Only the real owner -> no duplicate owner(session opened in another tab) or any other user is allowed to share sheet or start/stop any session the sheet -> since this sheet is not theirs 
                    console.log(`user has joined the canvas and is using his personal sheet`)
                    // localStorage.setItem('originalUser','true')
                    return;
                }
                if (accessToken && typeof accessToken === "string" && sheetId && shareSheetAllowed) {
                    // Authorized -> in case of sharing check if the user is sheet owner and if not then that means sheet is shared 
                    const isSheetOwner = getSheet(sheetId)?.ownerId === userData?.id

                    if (isSheetOwner) {
                        //
                        console.log(`Owner opened shared sheet`)
                        // localStorage.setItem("originalUser", "false")
                    }
                    else {
                        //user opened someone elses sheet -> then load the sheet from db for their zustand :- 

                        console.log("Authorized user opened someone else shared sheet");
                        // localStorage.setItem("originalUser", "false")
                        await loadSheetWithSheetId({ sheetId, saveSheet })

                    }
                    return
                }

                if (!accessToken) {

                    //UnAuthorized user 
                    // a) has roomId then that means its a webscoket session 
                    // b) no roomId then that means share sheet
                    // localStorage.setItem("originalUser", "false")
                    if (roomId && !shareSheetAllowed) {
                        await handleUnAuthorizedUsers("session");
                    } else {
                        await handleUnAuthorizedUsers("sheet");
                    }

                }

            } catch (err) {
                // console.log('wrong login as guest')
                console.log("Error while checking access token:", err);
                // localStorage.setItem("originalUser", "false")
                if (roomId && !shareSheetAllowed) {
                    await handleUnAuthorizedUsers("session");
                } else {
                    await handleUnAuthorizedUsers("sheet");
                }
            }
        };

        checkAccess();

    }, [handleStartWebsocketServer, roomId, sheetId, isLoading, handleUnAuthorizedUsers, getSheet, saveSheet, userData?.id, updateRoomId, userData?.roomId])




    // console.log(activeShape)
    // console.log(selectedShape)
    // console.log(darkMode)
    // console.log(diagrams)
    // console.log('userdata.roomid', userData?.roomId)
    // console.log(toErase.current)
    // console.log(activeActionRef.current)
    // console.log(sheetData[sheetId]?.ownerId )
    // console.log(laserStarted)
    // console.log(laserTrailRef)
    // console.log(editCounterRef)
    return (
        <TooltipProvider>
            <div className="h-screen w-screen relative">

                {/* ------------------------------- */}
                {/* TOP LEFT: Sheet Info */}
                <div className="fixed md:max-w-[220px] top-3 left-4 z-10 text-sm">
                    <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2 shadow-md space-y-1">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200 text-base">
                            {sheetData[sheetId]?.title || "Untitled Sheet"}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            ID: <span className="break-all">{sheetId}</span>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            Created: {new Date(sheetData[sheetId]?.createdAt || "").toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* ------------------------------- */}
                {/* TOP TOOLBAR FROM WHERE DRAWING CAN BE DONE  */}
                <div className=" hidden md:block fixed z-2 w-fit h-fit bg-white dark:bg-black rounded-lg left-1/2 top-3 transform -translate-x-1/2">
                    <div className="bg-orange-400/25 dark:bg-orange-300/20 z-1 rounded-lg px-1.5 py-1 flex gap-1.5 items-center">

                        {/* (select/move/resize) button */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "select" || activeAction === "move" || activeAction === "resize"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("select");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            {activeAction === "select" ||
                                activeAction === "move" ||
                                activeAction === "resize" ? (
                                <PiCursorFill className="text-black dark:text-white" size="18" />
                            ) : (
                                <PiCursor className="text-black dark:text-white" size="18" />
                            )}
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                1
                            </p>
                        </Button>

                        {/* rectangle button */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "rectangle"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}
                            onClick={() => {
                                setActiveAction("draw");
                                setActiveShape("rectangle");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            {activeAction === "draw" && activeShape === "rectangle" ? (
                                <PiSquareFill className="text-black dark:text-white " size="18" />
                            ) : (
                                <PiSquare className="text-black dark:text-white" size="18" />
                            )}
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                2
                            </p>


                        </Button>

                        {/* diamond  */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "diamond"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("draw");
                                setActiveShape("diamond");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            {activeAction === "draw" && activeShape === "diamond" ? (
                                <PiDiamondFill className="text-black dark:text-white" size="18" />
                            ) : (
                                <PiDiamond className="text-black dark:text-white" size="18" />
                            )}
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                3
                            </p>
                        </Button>

                        {/* circle  */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "circle"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}
                            onClick={() => {
                                setActiveAction("draw");
                                setActiveShape("circle");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            {activeAction === "draw" && activeShape === "circle" ? (
                                <PiCircleFill className="text-black dark:text-white" size="18" />
                            ) : (
                                <PiCircle className="text-black dark:text-white" size="18" />
                            )}
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                4
                            </p>
                        </Button>


                        {/* line  */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "line"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}
                            onClick={() => {
                                setActiveAction("draw");
                                setActiveShape("line");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            <PiLineVertical className="text-black dark:text-white rotate-90" size="18" />
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                5
                            </p>
                        </Button>

                        {/* arrow */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "arrow"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("draw");
                                setActiveShape("arrow");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            <PiArrowRight className="text-black dark:text-white " size="18" />
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                6
                            </p>
                        </Button>


                        {/* freehand */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "freeHand"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("draw");
                                setActiveShape("freeHand");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            {activeAction === "draw" && activeShape === "freeHand" ? (
                                <PiPencilFill className="text-black dark:text-white" size="18" />
                            ) : (
                                <PiPencil className="text-black dark:text-white" size="18" />
                            )}
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                7
                            </p>
                        </Button>

                        {/* TEXT  */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${(activeAction === "draw" && activeShape === "text") || activeAction === "edit"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("draw");
                                setActiveShape("text");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            <BsFonts className="text-black dark:text-white" size="20" />
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                8
                            </p>
                        </Button>

                        {/* Erase  */}
                        <Button
                            size="icon"
                            className={`bg-transparent relative p-2 ${activeAction === "erase"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("erase");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            {activeAction === "erase" ? (
                                <PiEraserFill className="text-black dark:text-white" size="18" />
                            ) : (
                                <PiEraser className="text-black dark:text-white" size="18" />
                            )}
                            <p className="text-black dark:text-white font-mono absolute text-[8px] right-1 bottom-1">
                                9
                            </p>
                        </Button>
                        <PiLineVerticalLight size="20" />


                        {/* pan */}
                        <Button
                            size="icon"
                            className={`bg-transparent -ml-1 relative p-2 ${activeAction === "pan"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("pan");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            {activeAction === "pan" && isDragging ? (
                                <LiaHandRock className="text-black dark:text-white " />
                            ) : (
                                <LiaHandPaper className="text-black dark:text-white " />
                            )}
                        </Button>

                        {/* zoom */}
                        <Button
                            size="icon"
                            className={`bg-transparent -ml-0.5 relative p-2 ${activeAction === "zoom"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("zoom");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            <TbZoom className="text-black dark:text-white " />
                        </Button>

                        {/* laser */}
                        <Button
                            size="icon"
                            className={`bg-transparent -ml-0.5 relative p-2 ${activeAction === "laser"
                                ? "bg-orange-600 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500"
                                : "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
                                } cursor-pointer`}

                            onClick={() => {
                                setActiveAction("laser");
                                if (activeDraw.current?.type === "text") {
                                    activeDraw.current = null;
                                    shapeSelectionBox.current = null;
                                }
                            }}
                        >
                            <GiLaserGun className="text-black dark:text-white " />
                        </Button>


                    </div>
                    {activeAction === "zoom" ? <div className="text-xs text-center px-2 py-0.5 mt-1 rounded-md bg-orange-200/50 text-orange-800 dark:bg-orange-300/10 dark:text-orange-200 transition-all duration-300">
                        Hold <kbd className="px-1 border border-gray-400 rounded dark:border-gray-500">Ctrl</kbd> and scroll to zoom in/out
                    </div> : ""}
                </div>

                {/* ------------------------------- */}

                {/* SAVE & DASHBOARD BUTTON TOP-RIGHT CORNER */}
                <div className="fixed top-3 right-4 z-10 flex gap-3">
                    {/* DASHBOARD BUTTON (Top-Right) */}

                    <Link
                        href="/dashboard"
                        className="
                            flex items-center gap-2 px-3 py-1.5 rounded-lg
                            font-medium text-sm transition-all duration-200
                            hover:bg-sky-500/20 dark:hover:bg-sky-400/20
                            bg-white dark:bg-black border border-sky-300 dark:border-sky-500
                            text-sky-700 dark:text-sky-300
                            "
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11M9 21V3" />
                        </svg>
                        <span className="hidden md:block">Dashboard</span>
                    </Link>


                    {/* SAVE BUTTON TOP-RIGHT */}

                    <button
                        onClick={handleSaveSheet}
                        disabled={savebtnLoader}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg
                            font-medium text-sm transition-all duration-200
                            ${savebtnLoader ? "cursor-not-allowed opacity-70" : "hover:bg-orange-500/20 dark:hover:bg-orange-400/20"}
                            bg-white dark:bg-black border border-orange-300 dark:border-orange-500
                            text-orange-700 dark:text-orange-300
                        `}
                    >
                        {savebtnLoader ? (
                            <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        <span className="hidden md:block">{savebtnLoader ? "Saving..." : "Save"}</span>
                    </button>

                    {/* SHARE BUTTON (Popup) */}
                    {/* only the owner of sheet can share and stop session */}
                    {/* if the owner shares a sheet and tries to open session from the shared sheet then dont allow */}
                    {sheetData && userData ? (
                        // && (localStorage.getItem('originalUser') === 'true')
                        (sheetData[sheetId]?.ownerId === userData.id) ? (

                            <Dialog>
                                <DialogTrigger asChild>
                                    <button
                                        className="
                            flex items-center gap-2 px-3 py-1.5 rounded-lg
                            font-medium text-sm transition-all duration-200
                            hover:bg-purple-500/20 dark:hover:bg-purple-400/20
                            bg-white dark:bg-black border border-purple-300 dark:border-purple-500
                            text-purple-700 dark:text-purple-300
                            "
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8m-8 6h8m-8 6h8" />
                                        </svg>
                                        <span className="hidden md:block">Share</span>
                                    </button>
                                </DialogTrigger>

                                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="sm:max-w-md">
                                    <DialogHeader>
                                        <div className="flex items-center">
                                            <DialogTitle className="text-lg font-semibold pr-2">
                                                Share this Sheet
                                            </DialogTitle>
                                            <Tooltip >
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    >
                                                        <Info className="h-4 w-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    className="max-w-sm p-2"
                                                >
                                                    <div >
                                                        <strong>
                                                            Before You Start a Session:
                                                        </strong>
                                                        <ul className="list-disc pl-4 space-y-1 py-3">
                                                            <li>
                                                                <span className="font-medium">Last write wins:</span> The update
                                                                that arrives last overwrites earlier ones (slower connections can
                                                                overwrite faster ones).
                                                            </li>
                                                            <li>
                                                                <span className="font-medium">Saved shapes vs. live edits:</span>{" "}
                                                                Shapes saved earlier will reappear after reload—even if erased
                                                                during a live session. But if a shape is deleted and saved, it is
                                                                gone for everyone.
                                                            </li>
                                                            <li>
                                                                <span className="font-medium">Temporary edits:</span> If you erase
                                                                or draw only during a WebSocket connection (without saving), it
                                                                exists only for the live session.
                                                            </li>
                                                            <li>
                                                                <span className="font-medium">Sharing links:</span> A sheet or room
                                                                link can be shared with anyone. They dont need an account. They will be 
                                                                logged in as guests automatically.
                                                            </li>
                                                            <li>
                                                                For best experience, save often to avoid losing work after
                                                                disconnects.
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </DialogHeader>

                                    {(userData.roomId) ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={inputRef}
                                                    readOnly
                                                    value={
                                                        isLoading
                                                            ? "Loading..."
                                                            : isError
                                                                ? "Error: Please Try Again"
                                                                : `${window.location.origin}/canvas/myroom/${sheetId}/${userData.roomId}`
                                                    }
                                                    className="flex-1"
                                                />
                                                <Button
                                                    onClick={handleCopy}
                                                    variant="outline"
                                                    className="border-orange-400 text-orange-600 dark:text-orange-300 hover:bg-orange-500/20"
                                                >
                                                    {copied ? (
                                                        <>
                                                            <Check className="h-4 w-4" />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4" />
                                                            Copy
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            <DialogFooter>
                                                <Button
                                                    disabled={isError}
                                                    onClick={handleStopSession}
                                                    className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                >
                                                    Stop Session
                                                </Button>
                                            </DialogFooter>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <p className="text-sm text-muted-foreground">
                                                Start a session to collaborate with others in real-time.
                                            </p>
                                            <DialogFooter>
                                                <Button
                                                    onClick={handleStartSession}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                                                    disabled={sessionLoader}
                                                >
                                                    {sessionLoader ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Starting...
                                                        </>
                                                    ) : (
                                                        "Start Session"
                                                    )}
                                                </Button>

                                            </DialogFooter>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleShareSheet}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                    >
                                        Share Sheet
                                    </Button>

                                </DialogContent>
                            </Dialog>
                        )
                            : ('')
                    ) : ('')}

                </div>


                {/* ------------------------------- */}

                {/* SIDE BAR TO SHOW COLOR AND ALL */}
                {activeAction === "draw" ||
                    (activeAction === "select" && selectedShape !== null) ?
                    ((activeShape === "text" || selectedShape === "text") ? (

                        //FOR TEXT 
                        <div className="md:block hidden  fixed px-5 py-6 z-10 w-fit h-fit border border-[#fbc98d] dark:border-[#3e2d1e] shadow-black left-3 top-1/2 transform -translate-y-1/2 bg-[#FFEAD6] dark:bg-[#2a1f16] rounded-md">
                            <div className="space-y-2 items-center rounded-md text-black dark:text-white">

                                {/* color  */}
                                <div className="text-sm">
                                    <h3 className="py-1.5">Color</h3>
                                    <div className="flex items-center gap-2">
                                        {darkMode ?
                                            (<>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#eeeeee] hover:bg-[#dddddd] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#eeeeee")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#FFD586] hover:bg-[#fbc169] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#FFD586")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#FF9898] hover:bg-[#f87b7b] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#FF9898")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#B9D4AA] hover:bg-[#a3c695] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#B9D4AA")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#8DD8FF] hover:bg-[#6fc9f9] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#8DD8FF")}
                                                >
                                                    ..
                                                </Button>
                                                <PiLineVerticalLight size="20" />
                                                <Button
                                                    size="icon"
                                                    className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                    style={{ backgroundColor: activeStrokeColor }}
                                                ></Button>

                                            </>) : (<>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#1e1e1e] hover:bg-[#2a2a2a] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#1e1e1e")}
                                                >
                                                    ..
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="bg-[#4A90E2] hover:bg-[#357ABD] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#4A90E2")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#50E3C2] hover:bg-[#3AC9AA] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#50E3C2")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#F5A623] hover:bg-[#D98C10] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#F5A623")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#FF6F61] hover:bg-[#E25448] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#FF6F61")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#7ED321] hover:bg-[#68B71B] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#7ED321")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#BD10E0] hover:bg-[#9B0DC0] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#BD10E0")}
                                                >
                                                    ..
                                                </Button>
                                                <PiLineVerticalLight size="20" />
                                                <Button
                                                    size="icon"
                                                    className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                    style={{ backgroundColor: activeStrokeColor }}
                                                ></Button>

                                            </>)
                                        }
                                    </div>
                                </div>

                                {/* font  */}
                                <div className="text-sm">
                                    <h3 className="py-1.5">Font</h3>
                                    <div className="flex items-center gap-2">
                                        {["Arial", "Verdana", "Comic Sans MS"].map((font) => (
                                            <Button
                                                key={font}
                                                size="sm"
                                                className={`relative cursor-pointer font-[${font}] -mr-1 rounded-md ${activeFont === font
                                                    ? "bg-[#E95C0C] text-white"
                                                    : "bg-[#fbcfa1] hover:bg-[#f5c186] dark:bg-[#3e2d1e] dark:hover:bg-[#4b3423] text-black dark:text-white"
                                                    }`}
                                                onClick={() => changeActiveFont(font)}
                                            >
                                                Abc
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* font size  */}
                                <div className="text-sm">
                                    <h3 className="py-1.5">Font Size</h3>
                                    <div className="flex items-center gap-2">
                                        {[20, 40, 60].map((size) => (
                                            <Button
                                                key={size}
                                                size="sm"
                                                className={`relative cursor-pointer -mr-1 rounded-md ${activeFontSize === String(size)
                                                    ? "bg-[#E95C0C] text-white"
                                                    : "bg-[#fbcfa1] hover:bg-[#f5c186] dark:bg-[#3e2d1e] dark:hover:bg-[#4b3423] text-black dark:text-white"
                                                    }`}
                                                onClick={() => changeActiveFontSize(size)}
                                            >
                                                {size === 20 ? "S" : size === 40 ? "M" : "L"}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>



                    ) : activeShape === "freeHand" ||
                        activeShape === "arrow" ||
                        activeShape === "line" ||
                        selectedShape === "freeHand" ||
                        selectedShape === "arrow" ||
                        selectedShape === "line" ? (
                        //FOR ARROW,LINE,FREEHAND(pen/pencil)
                        <div className="md:block hidden fixed px-3 py-2 z-2 w-fit h-fit border border-[#fbc98d] dark:border-[#3e2d1e] left-3 top-1/2 transform -translate-y-1/2 bg-[#FFEAD6] dark:bg-[#2a1f16] rounded-md">
                            <div className="space-y-2 items-center rounded-md text-black dark:text-white">

                                <div className="text-sm">
                                    <h3 className="font-medium py-1.5">Stroke Color</h3>
                                    <div className="flex items-center gap-2">
                                        {darkMode ?

                                            (<>
                                                <Button
                                                    size="sm"
                                                    className="bg-white hover:bg-neutral-200 relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#ffffff")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#ff4d4f] hover:bg-[#ff6b6b] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#ff4d4f")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#00c853] hover:bg-[#00e676] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#00c853")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#40c4ff] hover:bg-[#69e2ff] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#40c4ff")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#ffd600] hover:bg-[#ffeb3b] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#ffd600")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#b388ff] hover:bg-[#d0b3ff] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#b388ff")}
                                                >
                                                    ..
                                                </Button>
                                                <PiLineVerticalLight size="20" />
                                                <Button
                                                    size="icon"
                                                    className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                    style={{ backgroundColor: activeStrokeColor }}
                                                ></Button>

                                            </>
                                            ) : (

                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#1e1e1e] hover:bg-[#2a2a2a] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#1e1e1e")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#e03131] hover:bg-[#c92a2a] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#e03131")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#2f9e44] hover:bg-[#2b8a3e] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#2f9e44")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#1971c2] hover:bg-[#1864ab] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#1971c2")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#f08c00] hover:bg-[#e67700] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#f08c00")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <PiLineVerticalLight size="20" />
                                                    <Button
                                                        size="icon"
                                                        className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                        style={{ backgroundColor: activeStrokeColor }}
                                                    ></Button>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <h3 className="font-medium py-1.5">Stroke Width</h3>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className={`relative cursor-pointer -mr-1 rounded-md ${activestrokeWidth === 2
                                                ? "bg-[#E95C0C] text-white"
                                                : "bg-[#fbcfa1] hover:bg-[#f5c186] dark:bg-[#3e2d1e] dark:hover:bg-[#4b3423] text-black dark:text-white"
                                                }`}
                                            onClick={() => changeActiveLineWidth(2)}
                                        >
                                            <svg
                                                aria-hidden="true"
                                                focusable="false"
                                                role="img"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M4.167 10h11.666" strokeWidth="1.25" />
                                            </svg>
                                        </Button>

                                        <Button
                                            size="sm"
                                            className={`relative cursor-pointer -mr-1 rounded-md ${activestrokeWidth === 3
                                                ? "bg-[#E95C0C] text-white"
                                                : "bg-[#fbcfa1] hover:bg-[#f5c186] dark:bg-[#3e2d1e] dark:hover:bg-[#4b3423] text-black dark:text-white"
                                                }`}
                                            onClick={() => changeActiveLineWidth(3)}
                                        >
                                            <svg
                                                aria-hidden="true"
                                                focusable="false"
                                                role="img"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 10h10" strokeWidth="2.5" />
                                            </svg>
                                        </Button>

                                        <Button
                                            size="sm"
                                            className={`relative cursor-pointer -mr-1 rounded-md ${activestrokeWidth === 4
                                                ? "bg-[#E95C0C] text-white"
                                                : "bg-[#fbcfa1] hover:bg-[#f5c186] dark:bg-[#3e2d1e] dark:hover:bg-[#4b3423] text-black dark:text-white"
                                                }`}
                                            onClick={() => changeActiveLineWidth(4)}
                                        >
                                            <svg
                                                aria-hidden="true"
                                                focusable="false"
                                                role="img"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 10h10" strokeWidth="3.75" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>


                    ) : (
                        //other shapes 
                        <div className="md:block hidden  fixed px-3 py-2 z-2 w-fit h-fit border border-[#fbc98d] dark:border-[#3e2d1e] left-3 top-1/2 transform -translate-y-1/2 bg-[#FFEAD6] dark:bg-[#2a1f16] rounded-md">
                            <div className="space-y-2 items-center rounded-md text-black dark:text-white">

                                {/* Stroke */}
                                <div className="text-sm">
                                    <h3 className="font-medium py-1.5" >Stroke Color</h3>

                                    <div className="flex items-center gap-2">
                                        {darkMode ?

                                            (<>
                                                <Button
                                                    size="sm"
                                                    className="bg-white hover:bg-neutral-200 relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#ffffff")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#ff4d4f] hover:bg-[#ff6b6b] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#ff4d4f")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#00c853] hover:bg-[#00e676] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#00c853")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#40c4ff] hover:bg-[#69e2ff] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#40c4ff")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#ffd600] hover:bg-[#ffeb3b] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#ffd600")}
                                                >
                                                    ..
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#b388ff] hover:bg-[#d0b3ff] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                    onClick={() => changeActiveStrokeStyle("#b388ff")}
                                                >
                                                    ..
                                                </Button>
                                                <PiLineVerticalLight size="20" />
                                                <Button
                                                    size="icon"
                                                    className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                    style={{ backgroundColor: activeStrokeColor }}
                                                ></Button>

                                            </>
                                            ) : (

                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#1e1e1e] hover:bg-[#2a2a2a] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#1e1e1e")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#e03131] hover:bg-[#c92a2a] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#e03131")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#2f9e44] hover:bg-[#2b8a3e] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#2f9e44")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#1971c2] hover:bg-[#1864ab] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#1971c2")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#f08c00] hover:bg-[#e67700] relative cursor-pointer -mr-1 text-transparent rounded-md shadow-sm"
                                                        onClick={() => changeActiveStrokeStyle("#f08c00")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <PiLineVerticalLight size="20" />
                                                    <Button
                                                        size="icon"
                                                        className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                        style={{ backgroundColor: activeStrokeColor }}
                                                    ></Button>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>

                                {/* Background */}
                                <div className="text-sm">
                                    <h3 className="font-medium py-1.5">Background</h3>
                                    <div className="flex items-center gap-2">
                                        {darkMode ?
                                            (

                                                <>
                                                    {/* Transparent Fill */}
                                                    <Button
                                                        size="sm"
                                                        className="relative cursor-pointer -mr-1 text-transparent hover:bg-transparent bg-transparent border border-gray-400/40 dark:border-white/20 rounded-md"
                                                        onClick={() => changeActiveFillStyle("#00000000")}
                                                    >
                                                        .
                                                    </Button>

                                                    {/* Yellow Fill */}
                                                    <Button
                                                        size="sm"
                                                        className={`relative cursor-pointer -mr-1 text-transparent rounded-md ${darkMode
                                                            ? "bg-[#FFD58699] hover:bg-[#fbc16999]"
                                                            : "bg-[#FFD58660] hover:bg-[#fbc16960]"
                                                            }`}
                                                        onClick={() => changeActiveFillStyle(darkMode ? "#FFD58699" : "#FFD58660")}
                                                    >
                                                        ..
                                                    </Button>

                                                    {/* Red Fill */}
                                                    <Button
                                                        size="sm"
                                                        className={`relative cursor-pointer -mr-1 text-transparent rounded-md ${darkMode
                                                            ? "bg-[#FF6B6B99] hover:bg-[#f87b7b99]"
                                                            : "bg-[#FF989860] hover:bg-[#f87b7b60]"
                                                            }`}
                                                        onClick={() => changeActiveFillStyle(darkMode ? "#FF6B6B99" : "#FF989860")}
                                                    >
                                                        ..
                                                    </Button>

                                                    {/* Green Fill */}
                                                    <Button
                                                        size="sm"
                                                        className={`relative cursor-pointer -mr-1 text-transparent rounded-md ${darkMode
                                                            ? "bg-[#74C69D99] hover:bg-[#a3c69599]"
                                                            : "bg-[#B9D4AA60] hover:bg-[#a3c69560]"
                                                            }`}
                                                        onClick={() => changeActiveFillStyle(darkMode ? "#74C69D99" : "#B9D4AA60")}
                                                    >
                                                        ..
                                                    </Button>

                                                    {/* Blue Fill */}
                                                    <Button
                                                        size="sm"
                                                        className={`relative cursor-pointer -mr-1 text-transparent rounded-md ${darkMode
                                                            ? "bg-[#4dabf799] hover:bg-[#6fc9f999]"
                                                            : "bg-[#8DD8FF60] hover:bg-[#6fc9f960]"
                                                            }`}
                                                        onClick={() => changeActiveFillStyle(darkMode ? "#4dabf799" : "#8DD8FF60")}
                                                    >
                                                        ..
                                                    </Button>

                                                    <PiLineVerticalLight size="20" />

                                                    {/* Active Fill Preview */}
                                                    <Button
                                                        size="icon"
                                                        className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                        style={{ backgroundColor: activeFillStyle }}
                                                    />
                                                </>

                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="relative cursor-pointer -mr-1 text-transparent hover:bg-transparent bg-transparent border border-gray-400/40 dark:border-white/20 rounded-md"
                                                        onClick={() => changeActiveFillStyle("#eeeeee00")}
                                                    >
                                                        .
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#FFD58660] hover:bg-[#fbc16960] relative cursor-pointer -mr-1 text-transparent rounded-md"
                                                        onClick={() => changeActiveFillStyle("#FFD58660")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#FF989860] hover:bg-[#f87b7b60] relative cursor-pointer -mr-1 text-transparent rounded-md"
                                                        onClick={() => changeActiveFillStyle("#FF989860")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#B9D4AA60] hover:bg-[#a3c69560] relative cursor-pointer -mr-1 text-transparent rounded-md"
                                                        onClick={() => changeActiveFillStyle("#B9D4AA60")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#8DD8FF60] hover:bg-[#6fc9f960] relative cursor-pointer -mr-1 text-transparent rounded-md"
                                                        onClick={() => changeActiveFillStyle("#8DD8FF60")}
                                                    >
                                                        ..
                                                    </Button>
                                                    <PiLineVerticalLight size="20" />
                                                    <Button
                                                        size="icon"
                                                        className="relative cursor-default -mr-1 border border-neutral-400 dark:border-neutral-700 rounded-md"
                                                        style={{ backgroundColor: activeFillStyle }}
                                                    ></Button>
                                                </>
                                            )

                                        }
                                    </div>
                                </div>

                                {/* Stroke Width */}
                                <div className="text-sm">
                                    <h3 className="font-medium py-1.5">Stroke Width</h3>
                                    <div className="flex items-center gap-2">
                                        {[3, 6, 9].map((width, i) => (
                                            <Button
                                                key={width}
                                                size="sm"
                                                className={`relative cursor-pointer -mr-1  rounded-md ${activestrokeWidth === width
                                                    ? "bg-[#E95C0C] hover:bg-[#E95C0C] text-white dark:text-white"
                                                    : "bg-[#fbcfa1] hover:bg-[#f5c186] text-black dark:text-gray-200 dark:bg-[#3e2d1e] dark:hover:bg-[#4b3423]"
                                                    }`}
                                                onClick={() => changeActiveLineWidth(width)}
                                            >
                                                <svg
                                                    aria-hidden="true"
                                                    focusable="false"
                                                    role="img"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        d="M5 10h10"
                                                        stroke="currentColor"
                                                        strokeWidth={`${1.25 + i * 1.25}`}
                                                    ></path>
                                                </svg>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                    )
                    ) : (
                        <></>
                    )}

                {/* SIDE BAR SECTION ONLY UNDO/REDO + ZOOM CONTROLS  */}
                <div className="fixed left-3 md:left-10 bottom-16 md:bottom-3 z-20 flex flex-col gap-2 w-fit h-fit">
                    {/* Theme Toggle */}
                    <div className="hidden md:block bg-orange-200/50 dark:bg-orange-300/10 rounded-md p-1.5">
                        <ThemeToggle />
                    </div>
                    <div className="block md:hidden  ">
                        <ModeToggle />
                    </div>

                    {/* Zoom Controls */}
                    <div className="hidden md:block bg-white dark:bg-black rounded-md">
                        <div className="bg-orange-200/50 dark:bg-orange-300/10 p-1 flex items-center rounded-md">
                            <Button
                                size="icon"
                                className="bg-transparent relative cursor-pointer -mr-1 hover:bg-orange-300/40 dark:hover:bg-orange-300/20"
                                onClick={() => zoomToPoint(scale.current - 0.1)}
                            >
                                <PiMinus className="text-orange-800 dark:text-orange-200" size="18" />
                            </Button>
                            <PiLineVerticalLight className="text-orange-800 dark:text-orange-200" size="20" />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="bg-transparent relative cursor-pointer px-1 py-2 font-mono text-sm h-auto hover:bg-orange-300/40 dark:hover:bg-orange-300/20 text-orange-800 dark:text-orange-200"
                                        onClick={() => zoomToPoint(1)}
                                    >
                                        {(zoomLevel * 100).toFixed(0)}%
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Reset Zoom</p>
                                </TooltipContent>
                            </Tooltip>
                            <PiLineVerticalLight className="text-orange-800 dark:text-orange-200" size="20" />
                            <Button
                                size="icon"
                                className="bg-transparent relative cursor-pointer -ml-1 hover:bg-orange-300/40 dark:hover:bg-orange-300/20"
                                onClick={() => zoomToPoint(scale.current + 0.1)}
                            >
                                <PiPlus className="text-orange-800 dark:text-orange-200" size="18" />
                            </Button>
                        </div>
                    </div>


                    {/* UNDO REDO  */}
                    {/* <div className="bg-neutral-900 rounded-md">
                <div className="bg-green-400/25 p-1 flex gap-2 items-center rounded-md">
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                        size="icon"
                        className="relative cursor-pointer border-r border-green-900 -mr-1 rounded-r-none bg-green-600/40 hover:bg-green-600/60"
                        onClick={executeUndo}
                        disabled={!canUndo}
                        >
                        <GrUndo className="text-white" size="18" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Undo</p>
                    </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                        size="icon"
                        className="relative cursor-pointer border-l border-green-900 -ml-1 rounded-l-none bg-green-600/40 hover:bg-green-600/60"
                        onClick={executeRedo}
                        disabled={!canRedo}
                        >
                        <GrRedo className="text-white" size="18" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Redo</p>
                    </TooltipContent>
                    </Tooltip>
                </div>
                </div> */}
                </div>

                <CanvasMobile
                    activeAction={activeAction}
                    setActiveAction={setActiveAction}
                    activeDraw={activeDraw}
                    shapeSelectionBox={shapeSelectionBox}
                    activeShape={activeShape}
                    setActiveShape={setActiveShape}
                    isDragging={isDragging}
                    selectedShape={selectedShape}
                    setSelectedShape={setSelectedShape}
                    darkMode={darkMode}
                    changeActiveStrokeStyle={changeActiveStrokeStyle}
                    activeStrokeColor={activeStrokeColor}
                    setActiveStrokeColor={setActiveStrokeColor}
                    changeActiveFont={changeActiveFont}
                    changeActiveFontSize={changeActiveFontSize}
                    activeFontSize={activeFontSize}
                    activeFont={activeFont}
                    activestrokeWidth={activestrokeWidth}
                    changeActiveLineWidth={changeActiveLineWidth}
                    changeActiveFillStyle={changeActiveFillStyle}
                    activeFillStyle={activeFillStyle}
                />


                {/* ------------------------------- */}
                {/* FOR BOTH CLIENT SIDE AND SERVER SIDE RENDERING OF CANVAS -> SINCE WINDOW OBJECT IS ONLY PRESENT IN CLIENT/BROWSER -> PRVENTS ERRORS AND AVOID CRASHING  */}
                {isClient ? (
                    <canvas
                        tabIndex={0}
                        ref={canvasRef}
                        // bg-neutral-50 dark:bg-neutral-900 
                        className=" absolute top-0 left-0 z-1 "
                        width={window.innerWidth}
                        height={window.innerHeight}
                    ></canvas>

                ) : (

                    <canvas
                        tabIndex={0}
                        ref={canvasRef}
                        className="bg-neutral-50 dark:bg-neutral-900 "
                    ></canvas>

                )}
                {/* ------------------------------- */}

                <Toaster richColors position="top-right" />
            </div>
        </TooltipProvider>


    )
}



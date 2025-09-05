import React from 'react'
import { draw_elementsType } from '@/types/sheet.type';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
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
    PiPencil,
    PiPencilFill,
    PiShapes,
    PiSquare,
    PiSquareFill,
} from "react-icons/pi";
import { BsFonts, BsPaintBucket } from 'react-icons/bs';
import { LiaHandPaper, LiaHandRock } from 'react-icons/lia';
import { GiLaserGun } from 'react-icons/gi';

type CanvasAction = "select" | "move" | "draw" | "resize" | "edit" | "erase" | "pan" | "zoom" | "laser";
type ShapeType = "rectangle" | "diamond" | "circle" | "line" | "arrow" | "text" | "freeHand";
type SelectedShape = ShapeType | null;



interface Props {
    activeAction: CanvasAction;
    setActiveAction: React.Dispatch<React.SetStateAction<CanvasAction>>;
    activeDraw: React.RefObject<draw_elementsType | null>;
    shapeSelectionBox: React.RefObject<draw_elementsType | null>;
    activeShape: ShapeType;
    setActiveShape: React.Dispatch<React.SetStateAction<ShapeType>>;
    isDragging: boolean;
    selectedShape: SelectedShape
    setSelectedShape: React.Dispatch<React.SetStateAction<SelectedShape>>;
    darkMode: boolean;
    changeActiveStrokeStyle: (color: string) => void;
    activeStrokeColor: string;
    setActiveStrokeColor: React.Dispatch<React.SetStateAction<string>>;
    changeActiveFont: (font: string) => void
    changeActiveFontSize: (size: number) => void
    activeFontSize: string
    activeFont: string
    activestrokeWidth: number
    changeActiveLineWidth: (width: number) => void
    changeActiveFillStyle: (color: string) => void
    activeFillStyle: string
    selectedDraw: React.RefObject<draw_elementsType | null>
    textInp: React.RefObject<string>
    hiddenInputRef: React.RefObject<HTMLInputElement | null>


}

const CanvasMobile = ({ activeAction, setActiveAction, activeDraw, shapeSelectionBox, activeShape, setActiveShape, isDragging, selectedShape, darkMode, changeActiveStrokeStyle, activeStrokeColor, changeActiveFont, changeActiveFontSize, activeFontSize, activeFont, activestrokeWidth, changeActiveLineWidth, changeActiveFillStyle, activeFillStyle, selectedDraw, textInp, hiddenInputRef }: Props) => {

    const strokeColors = darkMode
        ? ["#ffffff", "#ff4d4f", "#00c853", "#40c4ff", "#ffd600", "#b388ff"]
        : ["#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];
    const backgroundColors = darkMode
        ? [
            "#00000000", // transparent
            "#FFD58699",
            "#FF6B6B99",
            "#74C69D99",
            "#4dabf799",
        ]
        : [
            "#eeeeee00", // transparent
            "#FFD58660",
            "#FF989860",
            "#B9D4AA60",
            "#8DD8FF60",
        ];
    const strokeWidths = [3, 6, 9]


    return (
        <div>
            <div className="md:hidden block fixed z-2 w-fit h-fit bg-white dark:bg-black rounded-lg left-1/2 bottom-3 transform -translate-x-1/2">
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

                    <DropdownMenu>

                        {/* Dropdown trigger */}
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" className="bg-transparent hover:bg-orange-600/20 dark:hover:bg-orange-400/20 p-2">
                                <PiShapes className="text-black dark:text-white" size="18" />
                            </Button>
                        </DropdownMenuTrigger>

                        {/* All shape buttons inside dropdown */}
                        <DropdownMenuContent className="flex flex-row gap-1 min-w-[3rem]">
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
                        </DropdownMenuContent>

                    </DropdownMenu>

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

            </div>

            {/* pan */}
            <div className='fixed bottom-24 left-3 md:hidden block z-10 rounded-md  border bg-white dark:bg-black my-3'>
                <Button
                    size="default"
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
            </div>


            {/* ------------------------------- */}

            {/* SIDE BAR TO SHOW COLOR AND ALL */}
            {activeAction === "draw" ||
                (activeAction === "select" && selectedShape !== null) ?
                ((activeShape === "text" || selectedShape === "text") ? (


                    <div className="fixed bottom-32 mb-1 left-3 md:hidden block px-2 py-2 z-10 w-fit h-fit border transform -translate-y-1/2 rounded-md">
                        <div className="space-y-2 rounded-md text-black bg-white dark:bg-black dark:text-white">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <BsPaintBucket size={20} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" align="center" className="justify-center flex flex-col-reverse gap-1 min-w-[1rem] mb-3">

                                    {/* Text Color Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-md border border-neutral-400 dark:border-neutral-700"
                                                style={{ backgroundColor: activeStrokeColor }}
                                            />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" className="p-2 grid grid-cols-7 gap-1 w-48">
                                            {(darkMode
                                                ? ["#eeeeee", "#FFD586", "#FF9898", "#B9D4AA", "#8DD8FF"]
                                                : ["#1e1e1e", "#4A90E2", "#50E3C2", "#F5A623", "#FF6F61", "#7ED321", "#BD10E0"]
                                            ).map((color) => (
                                                <DropdownMenuItem
                                                    key={color}
                                                    onSelect={() => changeActiveStrokeStyle(color)}
                                                    className="p-2 rounded-md cursor-pointer"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-sm border border-black/20 dark:border-white/20"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Font Family Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-md">
                                                {activeFont || "Font"}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" className="min-w-[8rem] flex flex-col">
                                            {["Arial", "Verdana", "Comic Sans MS"].map((font) => (
                                                <DropdownMenuItem
                                                    key={font}
                                                    onSelect={() => changeActiveFont(font)}
                                                    className="p-2 cursor-pointer"
                                                >
                                                    <span style={{ fontFamily: font }}>Abc</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Font Size Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-md">
                                                {activeFontSize === "20"
                                                    ? "S"
                                                    : activeFontSize === "40"
                                                        ? "M"
                                                        : activeFontSize === "60"
                                                            ? "L"
                                                            : "Size"}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" className="min-w-[6rem] flex flex-col">
                                            {[20, 40, 60].map((size) => (
                                                <DropdownMenuItem
                                                    key={size}
                                                    onSelect={() => changeActiveFontSize(size)}
                                                    className="p-2 cursor-pointer"
                                                >
                                                    {size === 20 ? "S" : size === 40 ? "M" : "L"}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>



                ) : activeShape === "freeHand" ||
                    activeShape === "arrow" ||
                    activeShape === "line" ||
                    selectedShape === "freeHand" ||
                    selectedShape === "arrow" ||
                    selectedShape === "line" ? (
                    //FOR ARROW,LINE,FREEHAND(pen/pencil)

                    <div className="fixed bottom-32 mb-1 left-3 md:hidden block px-2 py-2 z-2 w-fit h-fit border transform -translate-y-1/2 rounded-md">
                        <div className="space-y-2 rounded-md text-black bg-white dark:bg-black dark:text-white">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <BsPaintBucket size={20} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" align="center" className="justify-center flex flex-col-reverse gap-1 min-w-[1rem] mb-3">

                                    {/* Stroke Colors Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-md border border-neutral-400 dark:border-neutral-700"
                                                style={{ backgroundColor: activeStrokeColor }}
                                            />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" className="p-2 grid grid-cols-6 gap-2 w-48">
                                            {(darkMode ?
                                                ["#ffffff", "#ff4d4f", "#00c853", "#40c4ff", "#ffd600", "#b388ff"] :
                                                ["#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00"]
                                            ).map((color) => (
                                                <DropdownMenuItem
                                                    key={color}
                                                    onSelect={() => changeActiveStrokeStyle(color)}
                                                    className="p-2 rounded-md cursor-pointer"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-sm border border-black/20 dark:border-white/20"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Stroke Widths Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
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
                                                        strokeWidth={
                                                            activestrokeWidth === 2
                                                                ? "1.25"
                                                                : activestrokeWidth === 3
                                                                    ? "2.5"
                                                                    : "3.75"
                                                        }
                                                    />
                                                </svg>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" className="min-w-[3rem] flex flex-row">
                                            {[2, 3, 4].map((width, i) => (
                                                <DropdownMenuItem
                                                    key={width}
                                                    onClick={() => changeActiveLineWidth(width)}
                                                    className={`flex items-center gap-2`}
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
                                                        className="h-6 w-6"
                                                    >
                                                        <path d="M5 10h10" strokeWidth={`${1.25 + i * 1.25}`} />
                                                    </svg>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>


                ) : (
                    //other shapes 



                    <div className="fixed bottom-32 mb-1 left-3 md:hidden block px-2 py-2 z-2 w-fit h-fit border transform -translate-y-1/2  rounded-md">
                        <div className="space-y-2 rounded-md text-black bg-white dark:bg-black dark:text-white">
                            <DropdownMenu  >
                                <DropdownMenuTrigger asChild>
                                    <BsPaintBucket size={20} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side='top' align='center' className='justify-center flex flex-col-reverse gap-1  min-w-[1rem] mb-3 '>
                                    {/* Stroke */}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size='sm'
                                                className="rounded-md border  border-neutral-400 dark:border-neutral-700"
                                                style={{ backgroundColor: activeStrokeColor }}
                                            />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side='right' className="p-2 grid grid-cols-6 gap-2 w-48">
                                            {strokeColors.map((color) => (
                                                <DropdownMenuItem
                                                    key={color}
                                                    onSelect={() => changeActiveStrokeStyle(color)}
                                                    className="p-2 rounded-md cursor-pointer"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-sm border border-black/20 dark:border-white/20"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>


                                    {/* Background */}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size='sm'
                                                className="rounded-md border border-neutral-400 dark:border-neutral-700"
                                                style={{ backgroundColor: activeFillStyle }}
                                            />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side='right' className="p-2 grid grid-cols-6 gap-2 w-48">
                                            {backgroundColors.map((color) => (
                                                <DropdownMenuItem
                                                    key={color}
                                                    onSelect={() => changeActiveFillStyle(color)}
                                                    className="p-2 rounded-md cursor-pointer"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-sm border border-black/20 dark:border-white/20"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>



                                    {/* Stroke Width */}

                                    <div className="text-sm">
                                        <div className="md:hidden block">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size='sm'

                                                    >
                                                        <span className="flex items-center">
                                                            <svg
                                                                aria-hidden="true"
                                                                focusable="false"
                                                                role="img"
                                                                viewBox="0 0 20 20"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            // className="h-5 w-5"
                                                            >
                                                                <path
                                                                    d="M5 10h10"
                                                                    stroke="currentColor"
                                                                    strokeWidth={
                                                                        activestrokeWidth === 3
                                                                            ? "1.25"
                                                                            : activestrokeWidth === 6
                                                                                ? "2.5"
                                                                                : "3.75"
                                                                    }
                                                                />
                                                            </svg>

                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side='right' className="min-w-[3rem] flex flex-row">
                                                    {strokeWidths.map((width, i) => (
                                                        <DropdownMenuItem
                                                            key={width}
                                                            onClick={() => changeActiveLineWidth(width)}
                                                            className={`flex items-center gap-2 `}
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
                                                                className="h-6 w-6"
                                                            >
                                                                <path
                                                                    d="M5 10h10"
                                                                    stroke="currentColor"
                                                                    strokeWidth={`${1.25 + i * 1.25}`}
                                                                ></path>
                                                            </svg>

                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>



                )
                ) : (
                    <></>
                )}

            {/* Hidden input to trigger mobile keyboard */}
            <input
                ref={hiddenInputRef}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCorrect="on"
                style={{
                    position: "absolute",
                    left: -9999,      // offscreen but focusable
                    width: 1,
                    height: 1,
                    opacity: 0.01,    // tiny visibility so mobile reliably opens keyboard
                    caretColor: "transparent", // optional
                }}
                onChange={(e) => {
                    const v = e.target.value;
                    textInp.current = v;
                    if (activeDraw.current?.type === "text") {
                        activeDraw.current.text = v;
                    }
                    if (selectedDraw.current?.type === "text") {
                        selectedDraw.current.text = v;
                    }
                }}
            />

        </div>
    )
}

export default CanvasMobile

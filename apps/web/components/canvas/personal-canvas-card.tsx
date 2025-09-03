import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { renderDraws } from "@/lib/canvas/drawFunctions";
import { useSheetStore } from "@/store/Sheets";
import { useTheme } from "next-themes";
import axios from '@/lib/axios'
import { AxiosError, AxiosResponse } from "axios";
import { ApiResponse } from "@/types/responses.type";
import { SheetWithId } from "@/types/sheet.type";
import { SheetDataType } from "@/types/sheet.type";
import { toast } from "sonner";
import { ApiError } from "@repo/backend-common";
import { Loader2 } from "lucide-react";



const PersonalCanvasCard = ({ sheet, loading, id }: { sheet: SheetDataType | undefined, loading: boolean, id: string }) => {
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const isDark = theme === "dark"
    const colorOffill = isDark ? "#ffffff10" : "#eeeeee";
    const colorOfStroke = isDark ? "#ffffff" : "#000000";
    const [deleteLoader, setDeleteLoader] = useState(false)
    const deleteSheet = useSheetStore((state) => (state.deleteSheet))
    const [opening, setOpening] = useState(false);

    const handleOpen =  () => {
        setOpening(true);
        try {
            router.replace(`/canvas/myroom/${id}`);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    const handleDeleteSheet = async () => {

        setDeleteLoader(true)

        try {

            const response = await axios.delete(`/sheets/delete-sheet/s/${id}`) as AxiosResponse
            const res = response.data as ApiResponse
            if (res.success === false) {
                throw new Error('handleDeleteSheet Error :: Sheet not deleted')
            }
            const sheet = res?.data as SheetWithId
            // console.log(sheet)

            deleteSheet(sheet.id)

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
            setDeleteLoader(false)
        }
    }

    useEffect(() => {

        if (canvasRef.current && sheet?.data) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * window.devicePixelRatio;
                canvas.height = rect.height * window.devicePixelRatio;
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

                let draws = sheet.data;

                if (draws.length === 0) {
                    draws = [
                        {
                            id: "sample1",
                            type: "text",
                            strokeColor: colorOfStroke,
                            fillStyle: colorOffill,
                            strokeWidth: 2,
                            font: "Arial",
                            fontSize: "20",
                            x1: 889,
                            y1: 210,
                            x2: undefined,
                            y2: undefined,
                            text: "",
                            points: [],
                        },
                        {
                            id: "sample2",
                            type: "text",
                            strokeColor: colorOfStroke,
                            fillStyle: colorOffill,
                            strokeWidth: 5,
                            font: "Comic Sans MS",
                            fontSize: "80",
                            x1: -315,
                            y1: -100,
                            x2: -643,
                            y2: -422,
                            text: "Nothing to see here...",
                            points: [],
                        },
                    ];
                }

                let minX = Infinity,
                    minY = Infinity,
                    maxX = -Infinity,
                    maxY = -Infinity;

                draws.forEach((draw) => {
                    if (draw.x1 !== undefined && draw.y1 !== undefined) {
                        minX = Math.min(minX, draw.x1);
                        minY = Math.min(minY, draw.y1);
                        maxX = Math.max(maxX, draw.x1);
                        maxY = Math.max(maxY, draw.y1);
                    }
                    if (draw.x2 !== undefined && draw.y2 !== undefined) {
                        minX = Math.min(minX, draw.x2);
                        minY = Math.min(minY, draw.y2);
                        maxX = Math.max(maxX, draw.x2);
                        maxY = Math.max(maxY, draw.y2);
                    }
                    if (draw.points) {
                        draw.points.forEach((point) => {
                            minX = Math.min(minX, point.x);
                            minY = Math.min(minY, point.y);
                            maxX = Math.max(maxX, point.x);
                            maxY = Math.max(maxY, point.y);
                        });
                    }
                });

                const padding = 20;
                minX -= padding;
                minY -= padding;
                maxX += padding;
                maxY += padding;

                const drawingWidth = maxX - minX;
                const drawingHeight = maxY - minY;
                const canvasWidth = rect.width;
                const canvasHeight = rect.height;

                let scale = 1;
                if (drawingWidth > 0 && drawingHeight > 0) {
                    scale = Math.min(
                        canvasWidth / drawingWidth,
                        canvasHeight / drawingHeight
                    );
                    scale = Math.min(Math.max(scale, 0.1), 2);
                }

                const panOffset = {
                    x: (canvasWidth - drawingWidth * scale) / 2 - minX * scale,
                    y: (canvasHeight - drawingHeight * scale) / 2 - minY * scale,
                };

                renderDraws(
                    ctx,
                    canvas,
                    draws,
                    null, // activeDraw
                    null, // selectionBox
                    "draw", // activeAction
                    null, // selectedDraw
                    [], // toErase
                    panOffset,
                    scale
                );
            }
        }
    }, [sheet?.data, colorOfStroke, colorOffill]);

    return (
        <div>
            <Card key={id} className="flex flex-col justify-between shadow-md border-[#FF7F00]/30 dark:bg-[#1A1A1A] dark:border-[#FF7F00]/30">

                {/* Top Section */}
                <div className="w-full h-[140px] flex items-center justify-center bg-gray-100 dark:bg-[#2a2a2a] rounded-t-md">
                    {loading ? (
                        <Skeleton className="h-[80px] w-[80px] rounded-md" />
                    ) : (
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full bg-neutral-900/70 rounded-md"
                            style={{ minHeight: "140px" }}
                        ></canvas>
                    )}
                </div>

                <CardHeader>
                    {loading ? (
                        <Skeleton className="h-4 w-[70%]" />
                    ) : (
                        <CardTitle className="text-lg text-[#333333] dark:text-white">
                            {sheet?.title ?? 'Unnamed Sheet'}
                        </CardTitle>
                    )}
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <Skeleton className="h-3 w-[60%]" />
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Created: {new Date(sheet?.createdAt ?? '').toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                            })}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between gap-2 mt-auto">
                    {loading ? (
                        <>
                            <Skeleton className="h-8 w-[48%] rounded-md" />
                            <Skeleton className="h-8 w-[48%] rounded-md" />
                        </>
                    ) : (
                        <>

                            <button
                                onClick={handleOpen}
                                disabled={opening}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                                ${opening ? "bg-[#e66f00] cursor-not-allowed" : "bg-[#FF7F00] hover:bg-[#e66f00]"}
                                 text-white flex items-center justify-center gap-2`}
                            >
                                {opening ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4" />
                                        Opening...
                                    </>
                                ) : (
                                    "Open"
                                )}
                            </button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="flex-1 px-3 py-2 text-sm font-medium text-[#FF7F00] border border-[#FF7F00] rounded-md hover:bg-[#FF7F00] hover:text-white transition-colors">
                                        Delete
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. It will permanently delete this sheet.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteSheet}
                                            className="bg-[#FF7F00] hover:bg-[#e66f00] text-white"
                                        >
                                            {deleteLoader ? 'Deleting...' : 'Delete'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>


                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

export default PersonalCanvasCard





import Canvas from "@/components/canvas/canvas";
import { keywords, seo } from "@/components/seo/data";
import { prismaFrontend } from '@repo/db-client'
import { Metadata } from "next";


type paramType = {

    params: Promise<{ slug: [string, string?] }>

}
//since sheet are dynamic so load the sheet title - also this page is server side rendering only canvas component renders client side


async function getSheetTitle(sheetId: string): Promise<string> {

    const sheetTitle = await prismaFrontend.sheet.findUnique({
        where: {
            id: sheetId
        },
        select: {
            title: true
        }
    })
    
    if (!sheetTitle || !sheetTitle.title) return 'Sheet Not Found'

    return sheetTitle.title;
}

export async function generateMetadata({ params }: paramType): Promise<Metadata> {

    const [sheetId, roomId] = (await params).slug;
    const title = await getSheetTitle(sheetId);
   

    const path = roomId
        ? `/canvas/myroom/${sheetId}/${roomId}`
        : `/canvas/myroom/${sheetId}`;

    const base_url = process.env.NEXT_PUBLIC_BASE_URL
    const fullUrl = `${base_url}${path}`;

    return {

        title: `${title}`,
        description: "Collaborative drawing session on Orange Board.",
        keywords: keywords.canvasPage,
        openGraph: {
            ...seo.openGraph,
            title: `${title} | Orange Board`,
            description: roomId ? "Collaborative drawing session on Orange Board." : "You're invited to view this shared Orange Board sheet. Jump in and explore the ideas!",
            url: `${fullUrl}`,
        },
        twitter: {
            ...seo.twitter,
            title: `${title} | Orange Board`,
            description: roomId ? "Join this Orange Board session and collaborate in real time!" : "Someone shared an Orange Board sheet with you. Open it and see what is inside!",
        },
        robots: { index: false, follow: true }

    };

}

export default async function MyRoom({ params }: paramType) {

    const [sheetId, roomId] = (await params).slug;

    return (
        <div>
            <Canvas sheetId={sheetId} roomId={roomId} />
        </div>
    )

}
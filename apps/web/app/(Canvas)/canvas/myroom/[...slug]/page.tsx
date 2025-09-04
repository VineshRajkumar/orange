

/***Why revalidate is used here ? 
 * Ans) Here are few reasons :- 
 * 
 * If revalidate was not used then sheet titles will once be fetched during build time 
 * (when first time website is uploaded or next time when you redeploy) now what will happen 
 * here is when you deploy/redploy your website this will only cache those titles only that 
 * are present in your db at the time when you deployed/redeployed again so once deploy is 
 * over and user starts using the website and now if he creates a new sheet then every time 
 * when he would open the sheet a db call will go again and again for each time opening of
 * sheet so to avoid this revalidate along with "force-dynamic" is used what 
 * "force-dynamic" will do is during build time this wont fetch the sheet title and 
 * what revalidate will do is when the user creates the sheet and when he first time opens 
 * it a db call will go and nextjs will cache the title now and only this cached title will 
 * be served for next 30days (since this time is set in revalidate) once 30days are over then 
 * next time if user open the sheet then again a db call will go and this title will again be 
 * cached and next db call will be in next 30days -> so this is one optimization strategy 
 * -> also this can be used in blog websites too(if new blogs will be added after deployment 
 * also then use revalidate=60 sec OR if new blogs wont be added and blogs are fixed then 
 * just ssg(static site generation) during build  ) 
 * 
 * revalidate -> This is called Incremental Static Regeneration (ISR).
 */

export const revalidate = 2592000; // 30 days because sheet title once created wont change explained above 
export const dynamic = "force-dynamic" //dont call db during build only during runtime 

import Canvas from "@/components/canvas/canvas";
import { keywords, seo } from "@/components/seo/data";
// import { prismaFrontend } from '@repo/db-client'
import { Metadata } from "next";


type paramType = {

    params: Promise<{ slug: [string, string?] }>

}
//since sheet are dynamic so load the sheet title - also this page is server side rendering only canvas component renders client side



async function getSheetTitle(sheetId: string): Promise<string> {
    const { prismaFrontend } = await import('@repo/db-client'); 
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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
// import { useMediaQuery } from "usehooks-ts"
import { useIsMobile } from "@/hooks/use-mobile"

type InfoTooltipProps = {
    children: React.ReactNode
    content: React.ReactNode
    side?: "top" | "bottom" | "left" | "right"
}

export function InfoTooltip({ children, content, side = "top" }: InfoTooltipProps) {
    // const isMobile = useMediaQuery("(max-width: 768px)")
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <Popover>
                <PopoverTrigger asChild>{children}</PopoverTrigger>
                <PopoverContent side={side} className="max-w-sm p-2">
                    {content}
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <TooltipProvider >
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} className="max-w-sm p-2">
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

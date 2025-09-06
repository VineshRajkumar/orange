import { useEffect } from "react"
import { useRouter } from "next/navigation"; 
import { toast } from "sonner" 

export function useSingleSheetTab(
  sheetId: string, 
  isSheetOwner: boolean, 
  message?: string
) {
  const router = useRouter();

  useEffect(() => {
    if (!isSheetOwner) return;

    const bc = new BroadcastChannel("sheet-open");

    // Each tab gets a unique id
    const tabId = crypto.randomUUID();

    // Announce current tab
    bc.postMessage({ type: "open", sheetId, tabId });

    bc.onmessage = (event) => {
      const msg = event.data;

      if (msg.type === "open" && msg.sheetId === sheetId) {
        // If another tab announces itself
        if (msg.tabId !== tabId) {
          // current tab was already here -> let the new tab handle redirect
          bc.postMessage({ type: "reject", sheetId, tabId: msg.tabId });
        }
      }

      if (msg.type === "reject" && msg.sheetId === sheetId) {
        //redirect the new tab back to dashboard
        if (msg.tabId === tabId) {
          if (message) toast(message);
          else toast("This sheet is alredy open in one tab")
          // setTimeout(() => router.push("/dashboard"), 1000);
          setTimeout(() => router.replace("/dashboard"), 1000);
        }
      }
    };

    //when unmount clean it 
    return () => {
      bc.close();
    };
  }, [sheetId, isSheetOwner, router, message]);
}
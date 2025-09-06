export function areCookiesEnabled() {
    try {
        document.cookie = "cookietest=1; SameSite=Strict";
        const cookiesEnabled = document.cookie.indexOf("cookietest=") !== -1;
        // clean up
        document.cookie = "cookietest=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        return cookiesEnabled;
    } catch {
        return false;
    }
}
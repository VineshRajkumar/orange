
import "../styles/globals.css";



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <div className="relative min-h-screen">

            {children}

        </div>

    );
}

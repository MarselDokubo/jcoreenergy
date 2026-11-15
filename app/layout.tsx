import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/site";
export const metadata: Metadata = { title: { default: "JCORE | Transformer & Energy Services", template: "%s | JCORE" }, description: "Transformer repair, manufacturing and technical training enquiries with JCORE Transformer and Energy Services Limited." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html> }

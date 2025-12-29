import { Geist } from "next/font/google";
import "./globals.css";
import Provider from "@/contexts/Provider";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "RupeeFlow",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} bg-gradient-to-b from-background-200 to-background-100 min-h-screen dark flex flex-col`}
      >
        <Provider>
          <main className="flex-1">{children}</main>
        </Provider>
      </body>
    </html>
  );
}

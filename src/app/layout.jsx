import { Geist } from "next/font/google";
import "./globals.css";
import Provider from "@/contexts/Provider";
// import GlobalNavbar from "@/components/Navbar";
// import GlobalFooter from "@/components/Footer";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "RupeeFlow - EV Charging Management System",
  description:
    "Real-time pay-as-you-use EV charging with blockchain settlement",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} bg-gradient-to-b from-background-200 to-background-100 min-h-screen dark flex flex-col`}
      >
        <Provider>
          {/* <GlobalNavbar /> */}
          <main className="flex-1">{children}</main>
          {/* <GlobalFooter /> */}
        </Provider>
      </body>
    </html>
  );
}

import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "POS Software - Pharmacy | Electronics | General Store",
  description: "Professional Point of Sale System for Pharmacy, Electronics Shop, and General Stores",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} antialiased bg-white text-black`}>
        {children}
      </body>
    </html>
  );
}


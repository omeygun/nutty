import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Noto_Sans_Thai } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";

// Initialize the font
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Nutty | นัดที่ - Find the Perfect Time to Meet with Friends",
  description: "Effortlessly coordinate schedules and connect with your university peers.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("Rendering RootLayout"); // Debugging hydration

  return (
    <html lang="en" suppressHydrationWarning>

      <body className={`${notoSansThai.className} font-sans`}>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            {children}
            <Footer />
          </AuthProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import { AppProviders } from "@/components/layout/AppProviders";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Product Admin Dashboard",
  description:
    "Manage products with search, filters, sorting, pagination, and session-local mutations powered by DummyJSON.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

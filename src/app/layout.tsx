
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "DecentTodo App",
  description: "A decentralized task management application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
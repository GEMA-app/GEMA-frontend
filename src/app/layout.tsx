import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GEMA - Gestión Estratégica de Mantenimiento de Activos",
  description: "GEMA - Plataforma de gestión estratégica de mantenimiento de activos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ minHeight: "100vh", backgroundColor: "#ECEAE6" }}>
        {children}
      </body>
    </html>
  );
}

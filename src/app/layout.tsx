import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

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
      <body className={roboto.className} style={{ minHeight: "100vh", backgroundColor: "#ECEAE6" }}>
        <span className={montserrat.className} style={{ display: "none" }} aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

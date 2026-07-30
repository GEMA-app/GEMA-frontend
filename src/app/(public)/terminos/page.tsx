import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, MessageCircle, Phone, Send, Globe, Users } from "lucide-react";
import { sora, inter } from "@/lib/fonts";

const FOOTER_LEGAL_LINKS = [
  { label: "Términos y condiciones", href: "/terminos" },
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Seguridad de datos", href: "#" },
];

const SECCIONES = [
  {
    titulo: "1. Aceptación de los términos",
    parrafos: [
      "GEMA (\"la Plataforma\") es un sistema de gestión de mantenimiento asistido por computadora (CMMS) desarrollado como proyecto académico en el marco de Ingeniería del Software II de la UNEG. Al crear una cuenta o utilizar la Plataforma aceptas estos Términos y Condiciones en su totalidad.",
      "Si no estás de acuerdo con alguno de estos términos, no debes registrarte ni utilizar el servicio.",
    ],
  },
  {
    titulo: "2. Descripción del servicio",
    parrafos: [
      "GEMA permite a empresas industriales gestionar activos, órdenes de trabajo, mantenimiento preventivo, inventario de repuestos, ubicaciones y reportes operativos a través de una plataforma web multiempresa (multi-tenant).",
      "El servicio se ofrece \"tal cual\" con fines educativos y de demostración; no se garantiza disponibilidad continua ni ausencia de errores.",
    ],
  },
  {
    titulo: "3. Cuentas y responsabilidad del usuario",
    parrafos: [
      "Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de toda actividad realizada bajo su cuenta.",
      "La empresa (tenant) que registra la cuenta es responsable de administrar los roles y permisos de sus usuarios dentro de la Plataforma.",
    ],
  },
  {
    titulo: "4. Uso aceptable",
    parrafos: [
      "No está permitido usar la Plataforma para almacenar información falsa con intención de fraude, intentar vulnerar la seguridad del sistema, ni acceder a datos de otras empresas sin autorización.",
    ],
  },
  {
    titulo: "5. Propiedad intelectual",
    parrafos: [
      "El código fuente, diseño y marca GEMA pertenecen a sus autores como parte del proyecto académico UNEG. Los datos que cada empresa carga en la Plataforma (activos, órdenes de trabajo, inventario) siguen siendo propiedad de esa empresa.",
    ],
  },
  {
    titulo: "6. Limitación de responsabilidad",
    parrafos: [
      "Al ser un proyecto académico, GEMA no ofrece garantías de nivel de servicio (SLA) ni se responsabiliza por pérdidas derivadas del uso o la imposibilidad de uso de la Plataforma en un entorno de producción real.",
    ],
  },
  {
    titulo: "7. Cambios en los términos",
    parrafos: [
      "Estos términos pueden actualizarse conforme evolucione el proyecto. El uso continuado de la Plataforma después de una actualización implica la aceptación de los nuevos términos.",
    ],
  },
];

export default function TerminosPage() {
  return (
    <div className={`dark ${sora.variable} ${inter.variable}`}>
      <main className="min-h-screen font-[family-name:var(--font-inter)] bg-gema-bg-dark text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-gema-bg-dark/90 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 md:h-20">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src="/GEMA Logo Perlado.png"
                alt="GEMA"
                width={40}
                height={40}
                className="h-9 w-auto object-contain"
              />
              <span className="font-[family-name:var(--font-sora)] text-lg font-bold tracking-tight">
                GEMA
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </nav>
        </header>

        <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold tracking-tight md:text-4xl">
            Términos y condiciones
          </h1>
          <p className="mt-3 text-sm text-white/50">Última actualización: 2026</p>

          <div className="mt-10 flex flex-col gap-10">
            {SECCIONES.map((seccion) => (
              <div key={seccion.titulo}>
                <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold text-white">
                  {seccion.titulo}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {seccion.parrafos.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-white/70">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-gema-bg-dark text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src="/GEMA Logo Perlado.png"
                  alt="GEMA"
                  width={36}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
                <span className="font-[family-name:var(--font-sora)] text-lg font-bold">GEMA</span>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-white/60">
                Gestión Estratégica de Mantenimiento de Activos para la industria pesada de Ciudad
                Guayana.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Globe, label: "Sitio web" },
                  { icon: MessageCircle, label: "WhatsApp" },
                  { icon: Send, label: "Telegram" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-gema-accent hover:text-gema-bg-dark"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-[family-name:var(--font-sora)] font-semibold">Producto</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href="/#producto" className="text-sm text-white/60 transition-colors hover:text-gema-accent cursor-pointer">
                    Producto
                  </Link>
                </li>
                <li>
                  <Link href="/#precios" className="text-sm text-white/60 transition-colors hover:text-gema-accent cursor-pointer">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-white/60 transition-colors hover:text-gema-accent cursor-pointer">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-[family-name:var(--font-sora)] font-semibold">Legal</h4>
              <ul className="flex flex-col gap-3">
                {FOOTER_LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-gema-accent cursor-pointer">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-[family-name:var(--font-sora)] font-semibold">Contacto</h4>
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Mail size={15} className="shrink-0 text-gema-accent" />
                  <span>contacto@gema-cmms.com</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Phone size={15} className="shrink-0 text-gema-accent" />
                  <span>+58 286 123 4567</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Users size={15} className="shrink-0 text-gema-accent" />
                  <span>Ciudad Guayana, Venezuela</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 px-6 py-6">
            <p className="text-center text-xs text-white/40">
              © {new Date().getFullYear()} GEMA. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

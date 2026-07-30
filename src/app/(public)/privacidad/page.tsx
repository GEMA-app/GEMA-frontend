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
    titulo: "1. Qué datos recopilamos",
    parrafos: [
      "Al usar GEMA recopilamos datos de registro (nombre, correo, teléfono, empresa), datos operativos que tu empresa carga en la Plataforma (activos, órdenes de trabajo, inventario, ubicaciones) y datos técnicos básicos de sesión (token de autenticación, rol asignado).",
    ],
  },
  {
    titulo: "2. Cómo usamos tus datos",
    parrafos: [
      "Los datos se usan exclusivamente para operar la Plataforma: autenticar usuarios, aplicar permisos por rol, mostrar reportes de mantenimiento y mantener el historial de intervenciones de cada empresa.",
      "GEMA es un proyecto académico de la UNEG; los datos no se venden ni se comparten con terceros con fines comerciales.",
    ],
  },
  {
    titulo: "3. Aislamiento de datos entre empresas",
    parrafos: [
      "GEMA es una plataforma multiempresa (multi-tenant). Los datos de cada empresa están lógicamente separados y solo son accesibles por usuarios que pertenezcan a esa empresa y tengan el rol correspondiente.",
    ],
  },
  {
    titulo: "4. Almacenamiento y seguridad",
    parrafos: [
      "Las contraseñas se almacenan cifradas y el acceso a la API se protege mediante tokens de sesión. Aun así, al tratarse de un entorno académico, no se recomienda cargar información sensible o confidencial de producción real.",
    ],
  },
  {
    titulo: "5. Derechos del usuario",
    parrafos: [
      "Puedes solicitar la actualización de tus datos personales desde tu perfil, o solicitar la eliminación de tu cuenta contactando al equipo del proyecto.",
    ],
  },
  {
    titulo: "6. Cookies y sesión",
    parrafos: [
      "GEMA utiliza almacenamiento local del navegador (localStorage) para mantener tu sesión iniciada y tus preferencias de tema (claro/oscuro). No se usan cookies de rastreo publicitario.",
    ],
  },
  {
    titulo: "7. Cambios en esta política",
    parrafos: [
      "Esta política puede actualizarse conforme evolucione el proyecto académico. Cualquier cambio relevante se reflejará en esta misma página con su fecha de actualización.",
    ],
  },
];

export default function PrivacidadPage() {
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
            Política de privacidad
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

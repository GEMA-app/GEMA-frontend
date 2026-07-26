"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sora, inter } from "@/lib/fonts";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Wrench,
  BarChart3,
  Bell,
  Boxes,
  MapPin,
  ShieldCheck,
  Clock,
  TrendingUp,
  Users,
  Factory,
  Mountain,
  Cog,
  Mail,
  Phone,
  Check,
  Quote,
  Gauge,
  Send,
  MessageCircle,
  Globe,
  ClipboardList,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: easeOut },
  }),
};

const NAV_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Precios", href: "#precios" },
  { label: "Nosotros", href: "#nosotros" },
];

const INDUSTRIES = [
  { name: "Siderúrgica", icon: Factory },
  { name: "Aluminio", icon: Boxes },
  { name: "Minería", icon: Mountain },
  { name: "Manufactura", icon: Cog },
  { name: "Energía", icon: Gauge },
  { name: "Construcción", icon: Wrench },
];

const PAIN_POINTS = [
  "Órdenes de trabajo en hojas de cálculo que nadie actualiza a tiempo",
  "Paradas no programadas por fallas que se pudieron prevenir",
  "Repuestos críticos agotados en el peor momento posible",
];

const SOLUTIONS = [
  "Órdenes de trabajo digitales, trazables y en tiempo real",
  "Mantenimiento preventivo con alertas automáticas por activo",
  "Control de inventario de repuestos con umbrales de reposición",
];

const BENEFITS = [
  {
    icon: Wrench,
    title: "Mantenimiento preventivo",
    description:
      "Planifica revisiones por horas de uso, ciclos o calendario y evita paradas costosas antes de que ocurran.",
  },
  {
    icon: Bell,
    title: "Alertas en tiempo real",
    description:
      "Notificaciones automáticas a supervisores y técnicos cuando un activo requiere atención inmediata.",
  },
  {
    icon: BarChart3,
    title: "Reportes e indicadores",
    description:
      "Dashboards con MTBF, MTTR y disponibilidad para tomar decisiones basadas en datos, no en intuición.",
  },
  {
    icon: Boxes,
    title: "Inventario de repuestos",
    description:
      "Controla existencias, costos y proveedores de cada repuesto crítico para tu planta.",
  },
  {
    icon: MapPin,
    title: "Gestión por ubicaciones",
    description:
      "Organiza activos por planta, área y línea de producción para una supervisión clara y jerárquica.",
  },
  {
    icon: ShieldCheck,
    title: "Trazabilidad y cumplimiento",
    description:
      "Historial completo de intervenciones listo para auditorías de seguridad industrial y normativas.",
  },
];

const METRICS = [
  { value: "12,400+", label: "activos gestionados", icon: ClipboardList },
  { value: "38%", label: "reducción de tiempo de parada", icon: Clock },
  { value: "60+", label: "empresas en Ciudad Guayana", icon: Factory },
  { value: "99.2%", label: "disponibilidad de planta", icon: TrendingUp },
];

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/mes",
    description: "Para equipos pequeños que inician su digitalización.",
    features: [
      "Hasta 50 activos",
      "3 usuarios",
      "Órdenes de trabajo básicas",
      "Soporte por correo",
    ],
    highlighted: false,
    cta: "Crear cuenta gratis",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mes",
    description: "Para plantas industriales en crecimiento.",
    features: [
      "Activos ilimitados",
      "Usuarios ilimitados",
      "Mantenimiento preventivo automatizado",
      "Reportes e indicadores avanzados",
      "Inventario de repuestos",
      "Soporte prioritario",
    ],
    highlighted: true,
    cta: "Comenzar prueba gratis",
  },
  {
    name: "Enterprise",
    price: "A medida",
    period: "",
    description: "Para grupos industriales con múltiples plantas.",
    features: [
      "Todo lo de Pro",
      "Múltiples plantas y sedes",
      "Integraciones a medida (SCADA, ERP)",
      "SLA garantizado",
      "Gerente de cuenta dedicado",
    ],
    highlighted: false,
    cta: "Hablar con ventas",
  },
];

const TEAM = [
  { name: "Sebastián Ortiz", role: "Diseño de producto", initials: "SO" },
  { name: "Jesus Rodriguez", role: "Ingeniería de software", initials: "MD" },
  { name: "Jose Miserol", role: "Operaciones industriales", initials: "CR" },
  { name: "Sheen Alburquerque", role: "Éxito del cliente", initials: "AP" },
];

const FOOTER_PRODUCT_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Precios", href: "#precios" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Iniciar sesión", href: "/login" },
];

const FOOTER_LEGAL_LINKS = [
  { label: "Términos de servicio", href: "#" },
  { label: "Política de privacidad", href: "#" },
  { label: "Seguridad de datos", href: "#" },
];

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`${isDark ? "dark" : ""} ${sora.variable} ${inter.variable}`}
    >
      <main className="min-h-screen font-[family-name:var(--font-inter)] bg-white text-gema-primary dark:bg-gema-bg-dark dark:text-white overflow-x-hidden transition-colors duration-300">
        {/* --- NAVBAR --- */}
        <header
          className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
              ? "bg-white/90 dark:bg-gema-bg-dark/90 backdrop-blur-md shadow-sm dark:shadow-black/20"
              : "bg-white/60 dark:bg-gema-bg-dark/60 backdrop-blur-sm"
          } border-b border-gema-primary/10 dark:border-white/10`}
        >
          <nav className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
            <Link href="#top" className="flex items-center gap-2 shrink-0">
              <Image
                src="/gema-logo.png"
                alt="GEMA"
                width={40}
                height={40}
                className="h-9 w-auto object-contain dark:hidden"
              />
              <Image
                src="/GEMA Logo Perlado.png"
                alt="GEMA"
                width={40}
                height={40}
                className="h-9 w-auto object-contain hidden dark:block"
              />
              <span className="font-[family-name:var(--font-sora)] font-bold text-lg tracking-tight">
                GEMA
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gema-primary/80 dark:text-white/80 hover:text-gema-accent dark:hover:text-gema-accent transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDark((v) => !v)}
                aria-label={
                  isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
                className="w-10 h-10 flex items-center justify-center rounded-full text-gema-primary/70 dark:text-white/70 hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link
                href="/login"
                className="text-sm font-semibold px-4 py-2.5 rounded-full text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gema-accent text-gema-bg-dark hover:bg-gema-accent-dark transition-colors shadow-sm shadow-gema-accent/30 cursor-pointer"
              >
                Crear cuenta gratis
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => setIsDark((v) => !v)}
                aria-label={
                  isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
                className="w-11 h-11 flex items-center justify-center rounded-full text-gema-primary/70 dark:text-white/70 cursor-pointer"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={mobileMenuOpen}
                className="w-11 h-11 flex items-center justify-center rounded-full text-gema-primary dark:text-white cursor-pointer"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="md:hidden overflow-hidden border-t border-gema-primary/10 dark:border-white/10 bg-white dark:bg-gema-bg-dark"
              >
                <div className="px-6 py-5 flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 text-base font-medium text-gema-primary dark:text-white border-b border-gema-primary/5 dark:border-white/5 cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 mt-4">
                    <Link
                      href="/login"
                      className="text-center py-3 rounded-full font-semibold border border-gema-primary/20 dark:border-white/20 text-gema-primary dark:text-white cursor-pointer"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="text-center py-3 rounded-full font-semibold bg-gema-accent text-gema-bg-dark cursor-pointer"
                    >
                      Crear cuenta gratis
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* --- HERO --- */}
        <section
          id="top"
          className="relative overflow-hidden bg-gema-bg-light dark:bg-gema-bg-dark"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-100"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgba(236,160,60,0.15) 0%, rgba(236,160,60,0) 60%), radial-gradient(50% 40% at 85% 15%, rgba(43,64,91,0.25) 0%, rgba(43,64,91,0) 60%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="flex flex-col items-center text-center max-w-3xl mx-auto"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border border-gema-accent/20 mb-6">
                <Gauge size={14} /> CMMS para la industria pesada
              </span>
              <h1 className="font-[family-name:var(--font-sora)] font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight text-gema-primary dark:text-white">
                Gestiona el mantenimiento de tus activos{" "}
                <span className="text-gema-accent">sin sorpresas</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gema-primary/70 dark:text-white/70 max-w-2xl">
                GEMA es la plataforma de mantenimiento estratégico pensada para
                plantas industriales de Ciudad Guayana: siderúrgica, aluminio,
                minería y manufactura. Menos paradas, más control.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold bg-gema-accent text-gema-bg-dark hover:bg-gema-accent-dark transition-colors shadow-lg shadow-gema-accent/25 cursor-pointer"
                >
                  Crear cuenta gratis <ArrowRight size={18} />
                </Link>
                <a
                  href="#producto"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold border border-gema-primary/20 dark:border-white/20 text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Ver cómo funciona
                </a>
              </div>
            </motion.div>

            {/* Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
              className="relative mt-16 md:mt-20 max-w-5xl mx-auto"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="rounded-2xl border border-gema-primary/10 dark:border-white/10 bg-white dark:bg-gema-surface-dark shadow-2xl shadow-gema-primary/10 dark:shadow-black/40 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gema-primary/10 dark:border-white/10 bg-gema-bg-light dark:bg-gema-surface-dark-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gema-accent/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-4 text-xs font-medium text-gema-primary/50 dark:text-white/50">
                    app.gema.com/dashboard
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 md:p-6">
                  {METRICS.slice(0, 3).map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 p-4 flex flex-col gap-2"
                    >
                      <m.icon size={18} className="text-gema-accent" />
                      <span className="font-[family-name:var(--font-sora)] font-bold text-2xl text-gema-primary dark:text-white">
                        {m.value}
                      </span>
                      <span className="text-xs text-gema-primary/60 dark:text-white/50">
                        {m.label}
                      </span>
                    </div>
                  ))}
                  <div className="md:col-span-3 rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gema-primary dark:text-white">
                        Órdenes de trabajo activas
                      </span>
                      <span className="text-xs text-gema-accent font-medium">
                        Ver todas
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {[
                        {
                          name: "Motor línea de laminado A-12",
                          status: "En proceso",
                        },
                        { name: "Compresor sala 3", status: "Programado" },
                        {
                          name: "Cinta transportadora B-04",
                          status: "Urgente",
                        },
                      ].map((row) => (
                        <div
                          key={row.name}
                          className="flex items-center justify-between text-sm py-2 border-b border-gema-primary/5 dark:border-white/5 last:border-0"
                        >
                          <span className="text-gema-primary/80 dark:text-white/80">
                            {row.name}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              row.status === "Urgente"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent"
                            }`}
                          >
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* --- MARQUEE INDUSTRIAS --- */}
        <section className="py-10 border-y border-gema-primary/10 dark:border-white/10 bg-gema-bg-light dark:bg-gema-surface-dark overflow-hidden">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gema-primary/50 dark:text-white/40 mb-6">
            Industrias que confían en GEMA en Ciudad Guayana
          </p>
          <div className="relative flex overflow-hidden">
            <motion.div
              className="flex gap-12 pr-12 shrink-0"
              animate={{ x: ["0%", "-100%"] }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            >
              {[...INDUSTRIES, ...INDUSTRIES].map((ind, i) => (
                <div
                  key={`${ind.name}-${i}`}
                  className="flex items-center gap-2.5 text-gema-primary/60 dark:text-white/60 shrink-0"
                >
                  <ind.icon size={20} className="text-gema-accent" />
                  <span className="font-[family-name:var(--font-sora)] font-semibold whitespace-nowrap">
                    {ind.name}
                  </span>
                </div>
              ))}
            </motion.div>
            <motion.div
              className="flex gap-12 pr-12 shrink-0"
              animate={{ x: ["0%", "-100%"] }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              aria-hidden
            >
              {[...INDUSTRIES, ...INDUSTRIES].map((ind, i) => (
                <div
                  key={`dup-${ind.name}-${i}`}
                  className="flex items-center gap-2.5 text-gema-primary/60 dark:text-white/60 shrink-0"
                >
                  <ind.icon size={20} className="text-gema-accent" />
                  <span className="font-[family-name:var(--font-sora)] font-semibold whitespace-nowrap">
                    {ind.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- PROBLEMA / SOLUCIÓN --- */}
        <section id="producto" className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-3xl md:text-4xl text-gema-primary dark:text-white">
              El mantenimiento reactivo le cuesta caro a tu planta
            </h2>
            <p className="mt-4 text-gema-primary/70 dark:text-white/70">
              Estos son los problemas más comunes que vemos en plantas
              industriales de la región — y cómo GEMA los resuelve.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={0}
              className="rounded-2xl border border-gema-primary/10 dark:border-white/10 bg-gema-bg-light dark:bg-gema-surface-dark p-8"
            >
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-lg text-gema-primary dark:text-white mb-6">
                Sin GEMA
              </h3>
              <ul className="flex flex-col gap-4">
                {PAIN_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <XCircle
                      size={20}
                      className="text-red-500/80 shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-gema-primary/70 dark:text-white/70">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={1}
              className="rounded-2xl border border-gema-accent/30 bg-gema-primary dark:bg-gema-surface-dark-2 p-8 relative overflow-hidden"
            >
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-lg text-white mb-6">
                Con GEMA
              </h3>
              <ul className="flex flex-col gap-4">
                {SOLUTIONS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-gema-accent shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-white/80">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* --- BENEFICIOS --- */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-3xl md:text-4xl text-gema-primary dark:text-white">
              Todo lo que tu equipo de mantenimiento necesita
            </h2>
            <p className="mt-4 text-gema-primary/70 dark:text-white/70">
              Una sola plataforma para planificar, ejecutar y medir el
              mantenimiento de tus activos industriales.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-gema-primary/10 dark:border-white/10 bg-white dark:bg-gema-surface-dark p-7 hover:border-gema-accent/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gema-primary dark:bg-gema-accent/15 flex items-center justify-center mb-5">
                  <benefit.icon
                    size={22}
                    className="text-gema-accent dark:text-gema-accent"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-sora)] font-bold text-lg text-gema-primary dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-gema-primary/70 dark:text-white/60">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- METRICAS --- */}
        <section className="bg-gema-primary dark:bg-gema-surface-dark py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {METRICS.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  variants={fadeUp}
                  custom={i}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                    <metric.icon size={20} className="text-gema-accent" />
                  </div>
                  <span className="font-[family-name:var(--font-sora)] font-extrabold text-3xl md:text-4xl text-white tabular-nums">
                    {metric.value}
                  </span>
                  <span className="text-sm text-white/60 max-w-[14ch]">
                    {metric.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="precios" className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-3xl md:text-4xl text-gema-primary dark:text-white">
              Planes para cada tamaño de planta
            </h2>
            <p className="mt-4 text-gema-primary/70 dark:text-white/70">
              Empieza gratis y crece con GEMA a medida que tu operación lo
              necesite.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.highlighted
                    ? "bg-gema-primary text-white border-2 border-gema-accent shadow-xl shadow-gema-accent/10 md:-translate-y-3"
                    : "bg-white dark:bg-gema-surface-dark border border-gema-primary/10 dark:border-white/10 text-gema-primary dark:text-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-gema-accent text-gema-bg-dark">
                    Más popular
                  </span>
                )}
                <h3 className="font-[family-name:var(--font-sora)] font-bold text-xl mb-1">
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    plan.highlighted
                      ? "text-white/70"
                      : "text-gema-primary/60 dark:text-white/60"
                  }`}
                >
                  {plan.description}
                </p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-sora)] font-extrabold text-4xl">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={
                        plan.highlighted
                          ? "text-white/60"
                          : "text-gema-primary/50 dark:text-white/50"
                      }
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <Check
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          plan.highlighted
                            ? "text-gema-accent"
                            : "text-gema-accent-dark dark:text-gema-accent"
                        }`}
                      />
                      <span
                        className={
                          plan.highlighted
                            ? "text-white/85"
                            : "text-gema-primary/80 dark:text-white/75"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`text-center py-3 rounded-full font-semibold transition-colors cursor-pointer ${
                    plan.highlighted
                      ? "bg-gema-accent text-gema-bg-dark hover:bg-gema-accent-dark"
                      : "bg-gema-primary/5 dark:bg-white/10 text-gema-primary dark:text-white hover:bg-gema-primary/10 dark:hover:bg-white/15"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- TESTIMONIO --- */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="rounded-2xl bg-gema-bg-light dark:bg-gema-surface-dark p-10 text-center relative"
          >
            <Quote size={32} className="text-gema-accent/40 mx-auto mb-4" />
            <p className="text-xl md:text-2xl font-medium text-gema-primary dark:text-white leading-relaxed">
              &quot;GEMA nos permitió pasar de hojas de cálculo a un control
              real de nuestros activos. Redujimos las paradas no programadas en
              pocos meses.&quot;
            </p>
            <p className="mt-6 font-[family-name:var(--font-sora)] font-bold text-gema-primary dark:text-white">
              Jesus Rodriguez
            </p>
            <p className="text-sm text-gema-primary/60 dark:text-white/50">
              Diseño de infrastrucctura, GEMA
            </p>
          </motion.div>
        </section>

        {/* --- EQUIPO --- */}
        <section id="nosotros" className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-3xl md:text-4xl text-gema-primary dark:text-white">
              El equipo detrás de GEMA
            </h2>
            <p className="mt-4 text-gema-primary/70 dark:text-white/70">
              Un equipo multidisciplinario construyendo la herramienta de
              mantenimiento que la industria de Ciudad Guayana necesita.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="w-24 h-24 rounded-full bg-gema-primary dark:bg-gema-surface-dark-2 flex items-center justify-center border-2 border-gema-accent/30">
                  <span className="font-[family-name:var(--font-sora)] font-bold text-xl text-gema-accent">
                    {member.initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gema-primary dark:text-white">
                    {member.name}
                  </p>
                  <p className="text-sm text-gema-primary/60 dark:text-white/50">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-gema-bg-dark text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/GEMA Logo Perlado.png"
                  alt="GEMA"
                  width={36}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
                <span className="font-[family-name:var(--font-sora)] font-bold text-lg">
                  GEMA
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-5">
                Gestión Estratégica de Mantenimiento de Activos para la
                industria pesada de Ciudad Guayana.
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
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-gema-accent hover:text-gema-bg-dark flex items-center justify-center text-white/70 transition-colors cursor-pointer"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-sora)] font-semibold mb-4">
                Producto
              </h4>
              <ul className="flex flex-col gap-3">
                {FOOTER_PRODUCT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-gema-accent transition-colors cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-sora)] font-semibold mb-4">
                Legal
              </h4>
              <ul className="flex flex-col gap-3">
                {FOOTER_LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-gema-accent transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-sora)] font-semibold mb-4">
                Contacto
              </h4>
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Mail size={15} className="text-gema-accent shrink-0" />
                  <span>contacto@gema-cmms.com</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Phone size={15} className="text-gema-accent shrink-0" />
                  <span>+58 286 123 4567</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Users size={15} className="text-gema-accent shrink-0" />
                  <span>Ciudad Guayana, Venezuela</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 py-6 px-6">
            <p className="text-center text-xs text-white/40">
              © {new Date().getFullYear()} GEMA. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

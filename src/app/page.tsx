"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sora, inter } from "@/lib/fonts";
import { motion, useInView, AnimatePresence, easeOut } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ScrambleNumber = ({ text }: { text: string | number }) => {
  const stringValue = String(text); 
  const [display, setDisplay] = useState(stringValue);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 }); 

  useEffect(() => {
    if (!isInView) return;
    const chars = "0123456789!@#$%^&*"; 
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay((currentDisplay) =>
        stringValue
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return stringValue[index];
            }
            if (char === " ") return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      iteration += 1 / 3; 
      if (iteration >= stringValue.length) {
        clearInterval(interval);
        setDisplay(stringValue);
      }
    }, 40); 
    return () => clearInterval(interval);
  }, [stringValue, isInView]);

  return <span ref={ref}>{display}</span>;
};

const OrbitNode = ({ 
  name, 
  radius, 
  duration, 
  reverse, 
  startAngle 
}: { 
  name: string; 
  radius: number; 
  duration: number; 
  reverse: boolean; 
  startAngle: number 
}) => {
  const endAngle = reverse ? startAngle - 360 : startAngle + 360;
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{ width: radius * 2, height: radius * 2, x: "-50%", y: "-50%" }}
      initial={{ rotate: startAngle }}
      animate={{ rotate: endAngle }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="absolute top-0 left-1/2 flex flex-col items-center justify-center"
        style={{ x: "-50%", y: "-50%" }}
        initial={{ rotate: -startAngle }}
        animate={{ rotate: -endAngle }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-2 h-2 rounded-full bg-gema-accent shadow-[0_0_12px_theme(colors.gema.accent)]" />
        
        <div className="absolute top-4 pointer-events-auto text-[10px] tracking-widest uppercase text-white/80 bg-white/5 border border-white/10 px-2 py-1 rounded backdrop-blur-md whitespace-nowrap hover:bg-white/10 hover:text-white transition-all cursor-pointer">
          {name}
        </div>
      </motion.div>
    </motion.div>
  );
};

const StarField = () => {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.random() * 5 + 2.5}px`, 
        delay: `${Math.random() * 5}s`,       
        duration: `${Math.random() * 3 + 3}s` 
      }));
    };
    setStars(generateStars());
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: 0,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.3; transform: scale(1.2); } /* Opacidad máxima de 0.3 para ser sutil */
          100% { opacity: 0; transform: scale(0.5); }
        }
        .animate-twinkle {
          animation: twinkle linear infinite;
        }
      `}</style>
    </div>
  );
};

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

const REGIONS = [
  { name: "America del Norte", radius: 120, duration: 25, reverse: false, startAngle: 0 },
  { name: "Europa", radius: 120, duration: 25, reverse: false, startAngle: 180 },
  { name: "Asia-Pacífico", radius: 180, duration: 35, reverse: true, startAngle: 45 },
  { name: "Latinoamérica", radius: 180, duration: 35, reverse: true, startAngle: 225 },
  { name: "Medio Oriente", radius: 240, duration: 45, reverse: false, startAngle: 90 },
  { name: "África", radius: 240, duration: 45, reverse: false, startAngle: 270 },
];

const BENEFITS = [
  {
    id: "01",
    icon: Wrench,
    title: "Mantenimiento preventivo",
    description:
      "Planifica revisiones por horas de uso, ciclos o calendario y evita paradas costosas antes de que ocurran.",
  },
  {
    id: "02",
    icon: Bell,
    title: "Alertas en tiempo real",
    description:
      "Notificaciones automáticas a supervisores y técnicos cuando un activo requiere atención inmediata.",
  },
  {
    id: "03",
    icon: BarChart3,
    title: "Reportes e indicadores",
    description:
      "Dashboards con MTBF, MTTR y disponibilidad para tomar decisiones basadas en datos, no en intuición.",
  },
  {
    id: "04",
    icon: Boxes,
    title: "Inventario de repuestos",
    description:
      "Controla existencias, costos y proveedores de cada repuesto crítico para tu planta.",
  },
  {
    id: "05",
    icon: MapPin,
    title: "Gestión por ubicaciones",
    description:
      "Organiza activos por planta, área y línea de producción para una supervisión clara y jerárquica.",
  },
  {
    id: "06",
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

const TEAM_MEMBERS = [
  { 
    name: "Sebastián Ortiz", 
    role: "UX/UI, Jefe del departamento de diseño", 
    photo: "/foto-sebastian.jpeg",
    description: "Encargado de diseñar interfaces intuitivas que transforman datos complejos en experiencias de usuario fluidas y eficientes para el sector industrial." 
  },
  { 
    name: "José Miserol", 
    role: "Jefe del departamento de desarrollo lógico y computacional", 
    photo: "/foto-miserol.jpg", 
    description: "Arquitecto de la infraestructura técnica. Lidera la implementación de sistemas robustos garantizando el máximo rendimiento y escalabilidad de GEMA." 
  },
  { 
    name: "Jesús Rodríguez", 
    role: "Crudmaster", 
    photo: "/foto-jesus.png", 
    description: "Especialista en la gestión y estructuración de bases de datos, asegurando que cada orden de trabajo y repuesto fluya de manera impecable en el sistema." 
  },
  { 
    name: "Sheen Albuquerque", 
    role: "CEO y relaciones públicas", 
    photo: "/foto-sheen.png", 
    description: "Líder estratégico de GEMA. Construye puentes con la industria pesada y guía la visión a largo plazo del producto para satisfacer las necesidades del mercado." 
  },
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

  const fullTitleText = "Gestiona el mantenimiento de tus activos sin sorpresas";
  const accentStartIndex = 41;
  const [displayedCount, setDisplayedCount] = useState(0);
  const [titleComplete, setTitleComplete] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [activeBenefitIndex, setActiveBenefitIndex] = useState(0);
  const problemTitleText = "El mantenimiento reactivo le cuesta caro a tu planta";
  const [problemTitleCount, setProblemTitleCount] = useState(0);


  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const nextMember = () => setCurrentMemberIndex((prev) => (prev + 1) % TEAM_MEMBERS.length);
  const prevMember = () => setCurrentMemberIndex((prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length);


  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const totalDuration = 1000;
    const intervalTime = totalDuration / fullTitleText.length;

    if (displayedCount < fullTitleText.length) {
      const timer = setTimeout(() => {
        setDisplayedCount((prev) => prev + 1);
      }, intervalTime);
      return () => clearTimeout(timer);
    } else if (!titleComplete) {
      setTitleComplete(true);
    }
  }, [displayedCount, titleComplete, fullTitleText.length]);

  useEffect(() => {
    const totalDuration = 1500;
    const intervalTime = totalDuration / problemTitleText.length;
    if (problemTitleCount < problemTitleText.length) {
      const timer = setTimeout(() => {
        setProblemTitleCount((prev) => prev + 1);
      }, intervalTime);
      return () => clearTimeout(timer);
    }
  }, [problemTitleCount, problemTitleText.length]);

  const activeBenefit = BENEFITS[activeBenefitIndex];

  useEffect(() => {
    if (titleComplete) {
      const badgeTimer = setTimeout(() => {
        setShowBadge(true);
      }, 150);
      return () => clearTimeout(badgeTimer);
    }
  }, [titleComplete]);

  return (
    <div className={`${isDark ? "dark" : ""} ${sora.variable} ${inter.variable}`}>
      <main className="min-h-screen font-[family-name:var(--font-inter)] bg-white text-gema-primary dark:bg-gema-bg-dark dark:text-white overflow-x-hidden transition-colors duration-300">
        
        <header className="absolute top-0 left-0 right-0 z-40 bg-white/60 dark:bg-gema-bg-dark/60 backdrop-blur-sm border-b border-gema-primary/10 dark:border-white/10">
          <div className="md:hidden">
            <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="#top" className="flex items-center gap-2 shrink-0">
                <Image
                  src="/logo-azul.png"
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

              <div className="flex items-center gap-1">
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
          </div>

          <div className="hidden md:block">
            <nav className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
              <div className="flex items-center gap-8">
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

              <motion.div
                whileHover={{ y: [0, -5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex justify-center"
              >
                <Link href="#top" className="flex items-center gap-2 shrink-0">
                  <Image
                    src="/logo-azul.png"
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
              </motion.div>

              <div className="flex items-center justify-end gap-3">
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
            </nav>
          </div>
        </header>

        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-8 bg-white/90 dark:bg-gema-bg-dark/90 backdrop-blur-md rounded-full px-8 py-3 shadow-md border border-gema-primary/10 dark:border-white/10"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gema-primary/80 dark:text-white/80 hover:text-gema-accent dark:hover:text-gema-accent transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <section
          id="top"
          className="relative overflow-hidden bg-gema-bg-light dark:bg-gema-bg-dark pt-20"
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
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <motion.span
                initial={{ y: -150, opacity: 0 }}
                animate={
                  showBadge
                    ? { y: [-150, 25, 0], opacity: [0, 1, 1] }
                    : { y: -150, opacity: 0 }
                }
                transition={{
                  duration: 0.7,
                  times: [0, 0.5, 1],
                  ease: "easeInOut",
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border border-gema-accent/20 mb-6"
              >
                <Gauge size={14} /> CMMS para la industria pesada
              </motion.span>

              <motion.h1
                animate={showBadge ? { y: [0, 15, 0] } : { y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.35,
                  ease: "easeInOut",
                }}
                className="font-[family-name:var(--font-sora)] font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight text-gema-primary dark:text-white"
              >
                {fullTitleText.substring(
                  0,
                  Math.min(displayedCount, accentStartIndex)
                )}
                {displayedCount > accentStartIndex && (
                  <span className="text-gema-accent">
                    {fullTitleText.substring(
                      accentStartIndex,
                      displayedCount
                    )}
                  </span>
                )}
                {displayedCount < fullTitleText.length && (
                  <span className="animate-pulse text-gema-accent">|</span>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={
                  titleComplete
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.6, ease: easeOut }}
                className="mt-6 text-lg md:text-xl text-gema-primary/70 dark:text-white/70 max-w-2xl"
              >
                GEMA es la plataforma de mantenimiento estratégico pensada para
                plantas industriales de Ciudad Guayana: siderúrgica, aluminio,
                minería y manufactura. Menos paradas, más control.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  titleComplete
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
                className="mt-9 flex flex-col sm:flex-row items-center gap-4"
              >
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
              </motion.div>
            </div>

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
                        <ScrambleNumber text={m.value} />
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
            className="grid md:grid-cols-2 gap-12 items-start"
          >
            {/* Lado Izquierdo: Título con mecanografía y subtexto */}
            <div className="flex flex-col justify-center">
              <h2 className="font-[family-name:var(--font-sora)] font-bold text-3xl md:text-5xl text-gema-primary dark:text-white leading-tight min-h-[3em]">
                {problemTitleText.slice(0, problemTitleCount)}
                {problemTitleCount < problemTitleText.length && (
                  <span className="inline-block w-1 h-8 bg-gema-accent ml-1 animate-pulse" />
                )}
              </h2>
              <p className="mt-6 text-gema-primary/70 dark:text-white/70 text-base leading-relaxed">
                Estos son los problemas más comunes que vemos en plantas
                industriales de la región — y cómo GEMA los resuelve.
              </p>
            </div>
            {/* Lado Derecho: Tabla Comparativa al estilo de la Imagen 1 */}
            <div className="border border-gema-primary/20 dark:border-white/20 rounded-lg overflow-hidden bg-white dark:bg-gema-surface-dark">
              {/* Encabezado de la Tabla */}
              <div className="grid grid-cols-2 text-center font-[family-name:var(--font-sora)] font-bold text-sm md:text-base border-b border-gema-primary/20 dark:border-white/20">
                <div className="py-4 px-3 bg-black text-white uppercase tracking-wider flex items-center justify-center">
                  Sin GEMA
                </div>
                <div className="py-4 px-3 bg-gema-accent text-white uppercase tracking-wider flex items-center justify-center">
                  Con GEMA
                </div>
              </div>
              {/* Filas comparativas */}
              <div className="divide-y divide-gema-primary/10 dark:divide-white/10 text-xs md:text-sm">
                {PAIN_POINTS.map((painPoint, idx) => (
                  <div key={idx} className="grid grid-cols-2">
                    <div className="p-4 flex items-center text-gema-primary/80 dark:text-white/80 border-r border-gema-primary/10 dark:border-white/10">
                      {painPoint}
                    </div>
                    <div className="p-4 flex items-center font-semibold text-gema-primary dark:text-white">
                      {SOLUTIONS[idx]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
          
        {/* --- DASHBOARD ORBITAL --- */}
        <section className="relative min-h-screen bg-gema-bg-dark flex flex-col items-center justify-center py-20 px-6 font-[family-name:var(--font-inter)] overflow-hidden">
          
          <StarField />

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16 z-10"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gema-accent rounded-sm" />
              <span className="text-gema-accent text-xs tracking-widest uppercase font-bold">Monitoreo Global</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-sora)] font-bold text-white tracking-tight">
              Control total, todo el tiempo
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-full max-w-[600px] h-[600px] flex items-center justify-center rounded-2xl z-10"
          >
            {/* Anillo Exterior (Lados) - Radio 240px */}
            <div className="absolute w-[480px] h-[480px] rounded-full border border-white/10 border-dashed" />
            <div className="absolute top-[calc(50%-240px)] bg-gema-bg-dark px-3 text-[10px] text-white/40 tracking-widest uppercase -translate-y-1/2 z-0">
              Lados
            </div>

            {/* Anillo Intermedio (Todos) - Radio 180px */}
            <div className="absolute w-[360px] h-[360px] rounded-full border border-white/15" />
            <div className="absolute top-[calc(50%-180px)] bg-gema-bg-dark px-3 text-[10px] text-white/50 tracking-widest uppercase -translate-y-1/2 z-0">
              Todos
            </div>

            {/* Anillo Interior - Radio 120px */}
            <div className="absolute w-[240px] h-[240px] rounded-full border border-white/20" />

            {/* Núcleo Central (En) */}
            <div className="absolute w-14 h-14 rounded-full bg-gema-accent/10 border border-gema-accent/30 flex items-center justify-center shadow-[0_0_40px_rgba(var(--gema-accent-rgb),0.3)] z-10">
              <div className="w-8 h-8 rounded-full bg-gema-accent/20 flex items-center justify-center">
                <span className="text-xs font-bold tracking-widest text-gema-accent uppercase">En</span>
              </div>
            </div>

            {/* Renderizado de Nodos Orbitales */}
            {REGIONS.map((region, i) => (
              <OrbitNode key={i} {...region} />
            ))}
          </motion.div>
        </section>

      {/* --- BENEFICIOS --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-left max-w-3xl mb-12"
        >
          <h2 className="font-[family-name:var(--font-sora)] font-bold text-3xl md:text-4xl text-gema-primary dark:text-white">
            Todo lo que tu equipo de mantenimiento necesita
          </h2>
        </motion.div>
        {/* Estructura interactiva inspirada en la Imagen 2 */}
        <div className="grid md:grid-cols-12 border border-gema-primary/20 dark:border-white/20 rounded-xl overflow-hidden bg-white dark:bg-gema-surface-dark">
          {/* Columna Izquierda: Lista de Navegación Interactiva (5 Columnas en desktop) */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-gema-primary/20 dark:border-white/20 bg-gema-bg-light/50 dark:bg-black/30">
            {BENEFITS.map((benefit, index) => {
              const isActive = activeBenefitIndex === index;
              return (
                <button
                  key={benefit.id}
                  onClick={() => setActiveBenefitIndex(index)}
                  className={`w-full text-left p-4 md:p-5 flex items-center gap-4 transition-colors duration-150 border-b last:border-b-0 border-gema-primary/10 dark:border-white/10 ${
                    isActive
                      ? "bg-gema-accent text-white font-semibold"
                      : "hover:bg-gema-accent/10 text-gema-primary/80 dark:text-white/80"
                  }`}
                >
                  <span
                    className={`font-mono text-xs md:text-sm font-bold ${
                      isActive ? "text-white" : "text-gema-accent"
                    }`}
                  >
                    {benefit.id}
                  </span>
                  <span className="font-[family-name:var(--font-sora)] uppercase tracking-wide text-xs md:text-sm">
                    {benefit.title}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Columna Derecha: Vista del Detalle del Beneficio (7 Columnas en desktop) */}
          <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-white dark:bg-gema-surface-dark">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gema-accent font-mono text-sm font-bold">
                {activeBenefit.id}
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-gema-accent">
                BENEFICIO GEMA
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-sora)] font-bold text-xl md:text-3xl text-gema-primary dark:text-white mb-4">
              {activeBenefit.title}
            </h3>
            <p className="text-sm md:text-base leading-relaxed text-gema-primary/80 dark:text-white/70">
              {activeBenefit.description}
            </p>
          </div>
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
          
          {/* Aquí inyectamos nuestro componente ScrambleNumber conservando tus clases intactas */}
          <span className="font-[family-name:var(--font-sora)] font-extrabold text-3xl md:text-4xl text-white tabular-nums">
            <ScrambleNumber text={metric.value} />
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

        {/* --- TESTIMONIO 2 --- */}
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
        <section id="nosotros" className="max-w-7xl mx-auto px-6 py-24 overflow-hidden">
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

          <div className="relative max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[450px]">
            {/* Botones de Navegación */}
            <button
              onClick={prevMember}
              className="absolute left-0 md:-left-12 z-10 p-3 rounded-full bg-white dark:bg-gema-surface-dark shadow-md border border-gema-primary/10 dark:border-white/10 text-gema-primary dark:text-white hover:text-gema-accent hover:scale-110 transition-all"
              aria-label="Anterior integrante"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextMember}
              className="absolute right-0 md:-right-12 z-10 p-3 rounded-full bg-white dark:bg-gema-surface-dark shadow-md border border-gema-primary/10 dark:border-white/10 text-gema-primary dark:text-white hover:text-gema-accent hover:scale-110 transition-all"
              aria-label="Siguiente integrante"
            >
              <ChevronRight size={24} />
            </button>

            {/* Contenedor de la Card con Animación de Transición */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMemberIndex}
                initial={{ opacity: 0, x: 100, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -100, filter: "blur(4px)" }}
                // Puedes ajustar la velocidad de entrada/salida aquí:
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-sm"
              >
                {/* Contenedor principal para el efecto de Levitación */}
                <motion.div
                  // Animación de levitación infinita (y)
                  animate={{ y: [-12, 8, -12] }}
                  // Puedes ajustar la duración de la levitación aquí:
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="relative z-10 bg-gema-bg-light dark:bg-gema-surface-dark-2 border border-gema-primary/10 dark:border-white/10 p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl dark:shadow-black/50"
                >
                  {/* Contenedor de Foto con perspectiva 3D */}
                  <div
                    className="w-32 h-32 rounded-full mb-6 relative group cursor-pointer"
                    style={{ perspective: "1000px" }}
                  >
                    {/* Efecto de rotación 360 al hacer hover */}
                    <motion.div
                      className="w-full h-full relative"
                      whileHover={{ rotateY: 360 }}
                      // Puedes ajustar la velocidad del giro 3D aquí:
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Image
                        src={TEAM_MEMBERS[currentMemberIndex].photo}
                        alt={TEAM_MEMBERS[currentMemberIndex].name}
                        fill
                        className="object-cover rounded-full border-4 border-gema-accent/30 dark:border-gema-accent/40 shadow-inner"
                      />
                    </motion.div>
                  </div>

                  {/* Textos de la Card */}
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-2xl text-gema-primary dark:text-white mb-1">
                    {TEAM_MEMBERS[currentMemberIndex].name}
                  </h3>
                  <p className="text-sm font-semibold text-gema-accent mb-4">
                    {TEAM_MEMBERS[currentMemberIndex].role}
                  </p>
                  <p className="text-sm text-gema-primary/70 dark:text-white/70 leading-relaxed">
                    {TEAM_MEMBERS[currentMemberIndex].description}
                  </p>
                </motion.div>

                {/* Sombra proyectada en el piso que escala según la altura de la card */}
                <motion.div
                  // La sombra se hace más pequeña y clara cuando la card sube
                  animate={{ scale: [1, 0.7, 1], opacity: [0.4, 0.15, 0.4] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/20 dark:bg-black/60 blur-[12px] rounded-[100%] z-0 pointer-events-none"
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Indicadores (Puntos) opcionales debajo del carrusel */}
            <div className="flex gap-2 mt-12 z-10">
              {TEAM_MEMBERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentMemberIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentMemberIndex === idx
                      ? "bg-gema-accent w-6"
                      : "bg-gema-primary/20 dark:bg-white/20 hover:bg-gema-accent/50"
                  }`}
                  aria-label={`Ir al integrante ${idx + 1}`}
                />
              ))}
            </div>
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

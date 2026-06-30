"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, Calendar, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);      // Estado para el Navbar
  const [footerVisible, setFooterVisible] = useState(false); // Estado para el Footer

  useEffect(() => {
    const handleScroll = () => {
      // 1. Lógica del Navbar (se retrae al bajar 50px)
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // 2. Lógica del Footer (aparece al llegar a 250px del final)
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;

      // Si la posición actual + la altura de la pantalla es >= al total de la página menos 180px
      if (scrollTop + clientHeight >= scrollHeight - 180) {
        setFooterVisible(true);
      } else {
        setFooterVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
  <main className="min-h-screen bg-white text-black overflow-x-hidden pb-52"> 

      {/* --- NAVBAR RETRÁCTIL --- */}
      <nav 
        className={`
          bg-azul-gema text-white px- flex justify-between items-center 
          sticky top-0 z-50 shadow-md relative 
          transition-all duration-300 ease-in-out
          ${scrolled ? 'h-16 py-2' : 'h-18 py-4'}
        `}
      >
        {/* LOGO */}
        <div 
          className={`
            absolute left-6 transition-all duration-300 ease-in-out
            ${scrolled ? '-bottom-2 h-16' : '-bottom-6 h-24'}
          `}
        >
          <Image 
            src="/Group 11.png" 
            alt="Gema" 
            width={200} 
            height={100} 
            className="object-contain h-full w-auto drop-shadow-lg" 
          />
        </div>

        {/* BOTONES */}
        <div className="w-full h-full flex justify-end items-center pl-40 pr-6">
          <div className="flex items-center gap-6">
            <Link href="/register" className="text-sm font-medium hover:underline transition-opacity">
              Crear cuenta
            </Link>
            <Link 
              href="/login" 
              className="bg-naranja-gema text-white px-5 py-2 rounded-full flex items-center gap-1 text-sm font-semibold hover:bg-[#d48c22] transition-colors shadow-md"
            >
              <span>←</span> Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-overlay z-10"></div>
          <img 
            src="/hero.png" 
            alt="Office meeting" 
            className="w-full h-full object-cover z-0" 
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center text-white max-w-4xl px-6 flex flex-col items-center"
        >
          <Image src="/GEMA Logo Perlado.png" alt="Gema White" width={250} height={120} className="mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8 drop-shadow-lg">
            Gestión Estratégica de <br /> Mantenimiento de Activos
          </h1>
          <Link href="/login" className="bg-naranja-gema text-white px-8 py-3 rounded-full flex items-center gap-2 text-lg font-semibold hover:bg-[#d48c22] transition-colors shadow-lg">
            Accede al sistema <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* --- SECCIÓN 1 --- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center gap-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Administrar los activos de una empresa nunca había sido tan sencillo
          </h2>
          <Link href="/login" className="bg-naranja-gema text-white px-8 py-3 rounded-full flex items-center gap-3 w-max font-semibold hover:bg-[#d48c22] transition-colors mt-4">
            Accede al sistema <ArrowRight size={18} />
          </Link>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-first md:order-last"
        >
          <img 
            src="/feature-2.png" 
            alt="Team Illustration" 
            className="w-full h-auto rounded-2xl shadow-xl" 
          />
        </motion.div>
      </section>

      {/* --- SECCIÓN 2--- */}
      <section className="relative py-24 w-full flex justify-center items-center overflow-hidden mt-10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-overlay z-10"></div>
          <img 
            src="/feature-3.png" 
            alt="Data analysis" 
            className="w-full h-full object-cover z-0" 
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-20 w-full max-w-7xl mx-auto px-6 flex justify-center"
        >
          <div className="absolute left-0 lg:left-6 top-1/2 -translate-y-1/2 z-20">
            <Image 
              src="/GEMA Logo Perlado.png" 
              alt="Gema White" 
              width={300} 
              height={200} 
              className="w-32 md:w-48 lg:w-[280px] h-auto object-contain drop-shadow-lg" 
            />
          </div>
          <div className="flex flex-col items-center text-center max-w-4xl w-full ml-0 md:ml-32 lg:ml-56 xl:ml-72">
            <h2 className="text-4xl md:text-5xl max-w-xl font-bold leading-snug mb-8 drop-shadow-md text-white">
              Administra y cuida todos tus equipos de una manera rápida, segura y eficaz
            </h2>
            <Link 
              href="/login" 
              className="bg-naranja-gema text-white px-8 py-3 rounded-full flex items-center gap-2 text-lg font-semibold hover:bg-[#d48c22] transition-colors shadow-lg"
            >
              Accede al sistema <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* --- TESTIMONIO --- */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-sm"
        >
          <p className="text-2xl font-medium text-gray-800 italic mb-4">
            &quot;Una interfaz amigable, cómoda y perfectamente diseñada&quot;
          </p>
          <p className="text-xl font-bold text-gray-900">-Sebastián Ortiz, diseñador de GEMA.</p>
        </motion.div>
      </section>

      {/* --- ICONOS --- */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="bg-azul-gema p-5 rounded-xl flex items-center justify-center w-20 h-20">
            <Bell size={40} className="text-icono-gema" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Notificaciones en tiempo real</h3>
          <p className="text-gray-600 leading-relaxed max-w-xs">
            Notificaciones que llegan a los trabajadores para que los equipos nunca se pasen de su fecha de revisión.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="bg-azul-gema p-5 rounded-xl flex items-center justify-center w-20 h-20">
            <Calendar size={40} className="text-icono-gema" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Recordatorios programados</h3>
          <p className="text-gray-600 leading-relaxed max-w-xs">
            Uso de calendarios simplificados para añadir los equipos y sus fechas de revisión previa y posterior.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="bg-azul-gema p-5 rounded-xl flex items-center justify-center w-20 h-20">
            <Settings size={40} className="text-icono-gema" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Control total de los equipos</h3>
          <p className="text-gray-600 leading-relaxed max-w-xs">
            Con el mando de administrador podrá supervisar todos los equipos y trabajo realizado de los empleados.
          </p>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
    <footer 
        className={`
          fixed bottom-0 left-0 w-full bg-azul-gema text-white py-5 px-5 z-40
          transition-all duration-700 ease-in-out shadow-[0_-4px_10px_rgba(0,0,0,0.1)]
          ${footerVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <p className="text-2xl md:text-3xl font-bold max-w-md text-center md:text-left">Un software para que tus equipos reluzcan como una:</p>
            <Image src="/group-12.png" alt="Gema" width={200} height={80} />
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="font-medium hover:underline">Crear cuenta</Link>
            <Link href="/login" className="bg-naranja-gema text-white px-6 py-2 rounded-full flex items-center gap-2 font-semibold hover:bg-[#d48c22] transition-colors">
              Accede al sistema <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
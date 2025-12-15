import React, { useState } from "react";
import { createRoot } from "react-dom/client";

/* ================= ÍCONES MODERNOS (SVG) ================= */

const IconChat = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.38 8.38 0 0 1-4.9-1.5L3 20l1.5-4.5A8.38 8.38 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/>
  </svg>
);

const IconSparkles = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/>
  </svg>
);

const IconBag = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M6 7h12l-1 14H7L6 7Z"/>
    <path d="M9 7V6a3 3 0 0 1 6 0v1"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const IconHome = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z"/>
  </svg>
);

const IconSettings = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.4 17l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.23 3.4l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 9 2.28V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 20.6 6.23l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01A1.65 1.65 0 0 0 21.72 9H22a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
  </svg>
);

/* ================= APP ================= */

function App() {
  return (
    <div className="min-h-screen bg-bgApp pb-24">
      <Header />
      <Inicio />
      <Menu />
    </div>
  );
}

/* ================= HEADER ================= */

function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="text-lilacDark font-semibold text-lg">BabyConnect</div>
      <IconSettings />
    </header>
  );
}

/* ================= TELA INICIAL ================= */

function Inicio() {
  return (
    <>
      {/* Card principal */}
      <section className="mx-5 mt-2 bg-gradient-to-b from-lilac to-lilacDark rounded-[28px] p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-white">Olá, Mamãe!</h2>
        <p className="text-white/80 text-sm mt-1">
          Como você está se sentindo hoje?
        </p>

        <div className="mt-4 bg-white/25 rounded-2xl px-4 py-3">
          <p className="text-white font-medium flex items-center gap-2">
            <IconCalendar /> Semana 1
          </p>
          <p className="text-white/80 text-sm">
            Aprox. Microscópico
          </p>
        </div>
      </section>

      {/* VIP */}
      <section className="mx-5 mt-5 bg-greenVIP rounded-[28px] p-5 flex items-center justify-between text-white shadow-sm">
        <div>
          <p className="font-semibold">Entre no Grupo VIP</p>
          <p className="text-sm opacity-90">Comunidade exclusiva de mamães</p>
        </div>
        <button className="bg-white text-greenVIP px-5 py-2 rounded-full font-semibold text-sm">
          Entrar
        </button>
      </section>

      {/* Cards (IGUAIS AO PRINT) */}
      <section className="mx-5 mt-6 grid grid-cols-2 gap-4">
        <Card bg="bg-pinkCard" icon={<IconChat />} label="Doula AI" />
        <Card bg="bg-blueCard" icon={<IconSparkles />} label="Nomes" />
        <Card bg="bg-orangeCard" icon={<IconBag />} label="Enxoval" />
        <Card bg="bg-purpleCard" icon={<IconCalendar />} label="Diário" />
      </section>
    </>
  );
}

/* ================= CARD ================= */

function Card({ bg, icon, label }) {
  return (
    <div className={`${bg} rounded-[28px] h-36 flex flex-col items-center justify-center shadow-sm`}>
      <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-white">
        {icon}
      </div>
      <p className="mt-4 font-semibold text-white text-sm">{label}</p>
    </div>
  );
}

/* ================= MENU ================= */

function Menu() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-xs text-gray-400">
      <MenuItem icon={<IconHome />} label="Início" active />
      <MenuItem icon={<IconCalendar />} label="Semanas" />
      <MenuItem icon={<IconChat />} label="Doula" />
      <MenuItem icon={<IconBag />} label="Kit" />
      <MenuItem icon={<IconSparkles />} label="Nomes" />
    </nav>
  );
}

function MenuItem({ icon, label, active }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? "text-purple-600" : ""}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

/* ================= RENDER ================= */

createRoot(document.getElementById("root")).render(<App />);

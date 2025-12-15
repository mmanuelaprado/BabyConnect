import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="min-h-screen pb-20">

      {/* HEADER */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 text-lilacDark font-bold text-lg">
          💜 BabyConnect
        </div>
        ⚙️
      </header>

      {/* CARD OLÁ MAMÃE */}
      <section className="mx-5 mt-3 bg-lilac rounded-3xl p-5 shadow">
        <h2 className="text-xl font-bold text-purple-700">
          Olá, Mamãe! 🌸
        </h2>
        <p className="text-purple-600 text-sm mt-1">
          Como você está se sentindo hoje?
        </p>

        <div className="mt-4 bg-white/40 rounded-2xl p-4">
          <p className="font-semibold text-purple-700">
            📅 Semana 1
          </p>
          <p className="text-sm text-purple-600">
            Aprox. Microscópico
          </p>
        </div>
      </section>

      {/* VIP */}
      <section className="mx-5 mt-5 bg-greenVIP rounded-3xl p-5 flex items-center justify-between text-white shadow">
        <div>
          <p className="font-bold">Entre no Grupo VIP</p>
          <p className="text-sm opacity-90">
            Comunidade exclusiva de mamães
          </p>
        </div>
        <button className="bg-white text-greenVIP px-5 py-2 rounded-full font-semibold">
          Entrar
        </button>
      </section>

      {/* GRID */}
      <section className="mx-5 mt-6 grid grid-cols-2 gap-4">
        <Card color="pinkCard" icon="💬" label="Doula AI" />
        <Card color="blueCard" icon="✨" label="Nomes" />
        <Card color="orangeCard" icon="🧺" label="Enxoval" />
        <Card color="purpleCard" icon="📔" label="Diário" />
      </section>

      {/* MENU INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-sm text-gray-500">
        <MenuItem icon="🏠" label="Início" active />
        <MenuItem icon="📅" label="Semanas" />
        <MenuItem icon="💬" label="Doula" />
        <MenuItem icon="🧺" label="Kit" />
        <MenuItem icon="🛍️" label="Lojinha" />
        <MenuItem icon="✨" label="Nomes" />
      </nav>
    </div>
  );
}

function Card({ color, icon, label }) {
  return (
    <div className={`bg-${color} rounded-3xl h-32 flex flex-col items-center justify-center text-white shadow`}>
      <div className="text-3xl">{icon}</div>
      <p className="mt-2 font-semibold">{label}</p>
    </div>
  );
}

function MenuItem({ icon, label, active }) {
  return (
    <div className={`flex flex-col items-center ${active ? "text-purple-600" : ""}`}>
      <span>{icon}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

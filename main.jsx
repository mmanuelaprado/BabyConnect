import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [page, setPage] = useState("inicio");

  return (
    <div className="min-h-screen bg-bgApp pb-24">
      <Header />

      {page === "inicio" && <Inicio setPage={setPage} />}
      {page !== "inicio" && (
        <Tela
          titulo={pageTitle(page)}
          voltar={() => setPage("inicio")}
        />
      )}

      <Menu page={page} setPage={setPage} />
    </div>
  );
}

/* ================= HEADER ================= */
function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2 text-lilacDark font-semibold text-lg">
        🤍 BabyConnect
      </div>
      <span className="text-gray-400 text-lg">⚙️</span>
    </header>
  );
}

/* ================= INÍCIO ================= */
function Inicio({ setPage }) {
  return (
    <>
      {/* Card Olá Mamãe */}
      <section className="mx-5 mt-2 bg-gradient-to-b from-lilac to-lilacDark rounded-[28px] p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-white">
          Olá, Mamãe! 🌸
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Como você está se sentindo hoje?
        </p>

        <div className="mt-4 bg-white/30 rounded-2xl px-4 py-3">
          <p className="text-white font-medium flex items-center gap-2">
            📅 Semana 1
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
          <p className="text-sm opacity-90">
            Comunidade exclusiva de mamães
          </p>
        </div>
        <button className="bg-white text-greenVIP px-5 py-2 rounded-full font-semibold text-sm">
          Entrar
        </button>
      </section>

      {/* Grid de atalhos */}
      <section className="mx-5 mt-6 grid grid-cols-2 gap-4">
        <Card bg="bg-pinkCard" icon="💬" label="Doula AI" onClick={() => setPage("doula")} />
        <Card bg="bg-blueCard" icon="✨" label="Nomes" onClick={() => setPage("nomes")} />
        <Card bg="bg-orangeCard" icon="🧺" label="Enxoval" onClick={() => setPage("enxoval")} />
        <Card bg="bg-purpleCard" icon="📔" label="Diário" onClick={() => setPage("diario")} />
      </section>
    </>
  );
}

/* ================= TELAS INTERNAS ================= */
function Tela({ titulo, voltar }) {
  return (
    <div className="mx-5 mt-10 bg-white rounded-[28px] p-6 shadow-sm text-center">
      <h2 className="text-2xl font-semibold text-gray-700">{titulo}</h2>
      <p className="mt-3 text-gray-500 text-sm">
        Conteúdo em construção 💗
      </p>

      <button
        onClick={voltar}
        className="mt-6 text-purple-500 font-medium"
      >
        ← Voltar
      </button>
    </div>
  );
}

/* ================= COMPONENTES ================= */
function Card({ bg, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${bg} rounded-[28px] h-32 flex flex-col items-center justify-center text-white shadow-sm`}
    >
      <div className="w-12 h-12 bg-white/25 rounded-full flex items-center justify-center text-2xl">
        {icon}
      </div>
      <p className="mt-3 font-medium">{label}</p>
    </button>
  );
}

function Menu({ page, setPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-xs">
      <MenuItem icon="🏠" label="Início" active={page === "inicio"} onClick={() => setPage("inicio")} />
      <MenuItem icon="📅" label="Semanas" />
      <MenuItem icon="💬" label="Doula" active={page === "doula"} onClick={() => setPage("doula")} />
      <MenuItem icon="🧺" label="Kit" active={page === "enxoval"} onClick={() => setPage("enxoval")} />
      <MenuItem icon="✨" label="Nomes" active={page === "nomes"} onClick={() => setPage("nomes")} />
    </nav>
  );
}

function MenuItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${
        active ? "text-purple-600" : "text-gray-400"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function pageTitle(page) {
  return {
    doula: "Doula AI",
    nomes: "Nomes",
    enxoval: "Enxoval",
    diario: "Diário"
  }[page];
}

createRoot(document.getElementById("root")).render(<App />);

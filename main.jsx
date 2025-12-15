import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [page, setPage] = useState("inicio");

  return (
    <div className="min-h-screen pb-20">
      <Header />

      {page === "inicio" && <Inicio setPage={setPage} />}
      {page === "doula" && <Tela titulo="Doula AI" texto="Converse com sua doula virtual 💬" />}
      {page === "nomes" && <Tela titulo="Nomes" texto="Ideias de nomes para seu bebê ✨" />}
      {page === "enxoval" && <Tela titulo="Enxoval" texto="Checklist completo do enxoval 🧺" />}
      {page === "diario" && <Tela titulo="Diário" texto="Registre seus sentimentos 📔" />}

      <Menu page={page} setPage={setPage} />
    </div>
  );
}

/* COMPONENTES */

function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="font-bold text-lilacDark text-lg">💜 BabyConnect</div>
      ⚙️
    </header>
  );
}

function Inicio({ setPage }) {
  return (
    <>
      <section className="mx-5 mt-3 bg-lilac rounded-3xl p-5 shadow">
        <h2 className="text-xl font-bold text-purple-700">Olá, Mamãe! 🌸</h2>
        <p className="text-purple-600 text-sm mt-1">
          Como você está se sentindo hoje?
        </p>

        <div className="mt-4 bg-white/40 rounded-2xl p-4">
          <p className="font-semibold text-purple-700">📅 Semana 1</p>
          <p className="text-sm text-purple-600">Aprox. Microscópico</p>
        </div>
      </section>

      <section className="mx-5 mt-5 bg-greenVIP rounded-3xl p-5 flex justify-between items-center text-white">
        <div>
          <p className="font-bold">Entre no Grupo VIP</p>
          <p className="text-sm">Comunidade exclusiva de mamães</p>
        </div>
        <button className="bg-white text-greenVIP px-5 py-2 rounded-full font-semibold">
          Entrar
        </button>
      </section>

      <section className="mx-5 mt-6 grid grid-cols-2 gap-4">
        <Card color="pinkCard" icon="💬" label="Doula AI" onClick={() => setPage("doula")} />
        <Card color="blueCard" icon="✨" label="Nomes" onClick={() => setPage("nomes")} />
        <Card color="orangeCard" icon="🧺" label="Enxoval" onClick={() => setPage("enxoval")} />
        <Card color="purpleCard" icon="📔" label="Diário" onClick={() => setPage("diario")} />
      </section>
    </>
  );
}

function Tela({ titulo, texto }) {
  return (
    <div className="mx-5 mt-10 bg-white rounded-3xl p-6 shadow text-center">
      <h2 className="text-2xl font-bold text-purple-600">{titulo}</h2>
      <p className="mt-3 text-gray-600">{texto}</p>
    </div>
  );
}

function Card({ color, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-${color} rounded-3xl h-32 flex flex-col items-center justify-center text-white shadow`}
    >
      <div className="text-3xl">{icon}</div>
      <p className="mt-2 font-semibold">{label}</p>
    </button>
  );
}

function Menu({ page, setPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-sm">
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
      className={`flex flex-col items-center ${
        active ? "text-purple-600 font-semibold" : "text-gray-400"
      }`}
    >
      <span>{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}

createRoot(document.getElementById("root")).render(<App />);

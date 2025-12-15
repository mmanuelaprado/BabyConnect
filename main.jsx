import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-soft-white px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-pink-400 mb-4">
          👶 BabyConnect
        </h1>

        <p className="text-gray-600 mb-6">
          Seu app de apoio para gestantes 💖
        </p>

        <button className="bg-baby-pink hover:bg-pink-300 transition text-white font-semibold py-2 px-6 rounded-full">
          Começar
        </button>
      </div>
    </div>
  );
}

// Renderização
const root = createRoot(document.getElementById("root"));
root.render(<App />);

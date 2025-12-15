import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-white">
      <h1 className="text-3xl font-bold text-pink-400">
        BabyConnect funcionando 💖
      </h1>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

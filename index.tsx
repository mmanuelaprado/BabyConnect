import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./views/Home";
import Doula from "./views/Doula";
import Names from "./views/Names";
import Checklist from "./views/Checklist";
import Store from "./views/Store";
import Tracker from "./views/Tracker";
import Admin from "./views/Admin";

const App = () => (
  <HashRouter>
    <Routes>
      {/* Admin sem layout */}
      <Route path="/admin" element={<Admin />} />

      {/* App com layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/doula" element={<Doula />} />
        <Route path="/names" element={<Names />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/store" element={<Store />} />
        <Route path="/tracker" element={<Tracker />} />
      </Route>
    </Routes>
  </HashRouter>
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

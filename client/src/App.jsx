import React from "react";
import { Routes, Route } from "react-router-dom";
import AppAdmin from "./admin/AppAdmin.jsx";
import AppUser from "./user/AppUser.jsx";
import UseCaseDiagram from "./components/UseCaseDiagram.jsx";
import MongoDBSchemaDiagram from "./components/MongoDBSchemaDiagram.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AppAdmin />} />
      <Route path="/usecase" element={<UseCaseDiagram />} />
      <Route path="/mongodb" element={<MongoDBSchemaDiagram />} />
      <Route path="/*" element={<AppUser />} />
    </Routes>
  );
}

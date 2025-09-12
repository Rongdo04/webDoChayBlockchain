import React from "react";
import { Routes, Route } from "react-router-dom";
import AppAdmin from "./admin/AppAdmin.jsx";
import AppUser from "./user/AppUser.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AppAdmin />} />
      <Route path="/*" element={<AppUser />} />
    </Routes>
  );
}

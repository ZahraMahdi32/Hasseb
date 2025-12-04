import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HaseebHomePage from "./components/Home/HaseebHomePage";
import HaseebAuth from "./components/Home/Haseebauth.jsx";
import Manger from "./Manger.jsx";
import Advisor from "./Advisor.jsx";
import OwnerHome from "./components/businessOwner/BusinessOwnerHome.jsx";
import ForgotPassword from "./components/Home/ForgotPasswordPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login / Landing / ForgetPassword */}
        <Route path="/" element={<HaseebHomePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Role-based dashboards */}
        <Route path="/manager" element={<Manger />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/owner" element={<OwnerHome />} />
        <Route path="/auth" element={<HaseebAuth />} />
      </Routes>
    </BrowserRouter>
  );
}
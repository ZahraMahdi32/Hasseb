import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "./components/AdivosrComponents/AdvisorLayout.jsx";

// PANELS
import DashboardAdvisorPanel from "./components/AdivosrComponents/DashboardAdvisorPanel.jsx";
import FeedbackPanel from "./components/AdivosrComponents/FeedbackPanel.jsx";
import AnalyzerPanel from "./components/AdivosrComponents/AnalyzerPanel.jsx";
import NotificationsPanel from "./components/AdivosrComponents/NotificationsPanel.jsx";
import AccountPanel from "./components/AdivosrComponents/AccountPanel.jsx";
import SupportPanel from "./components/AdivosrComponents/SupportPanel2.jsx";
import RecommendationsPanel from "./components/AdivosrComponents/RecommendationsPanel.jsx";

export default function Advisor() {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const advisorId = user?.userId;

  const [tab, setTab] = useState("dashboard");
  const [theme, setTheme] = useState("light");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [owners, setOwners] = useState([]);
  const [advisor, setAdvisor] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/advisor/dashboard/${advisorId}`
      );
      const data = await res.json();
      
      setAdvisor(data.advisor || null);
      setOwners(data.owners || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "/auth";
  };

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <Header theme={theme} onOpenMenu={() => setSidebarOpen(true)} />

      {/* SIDEBAR */}
      <Sidebar
        tab={tab}
        setTab={setTab}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT */}
      <main className="container-fluid py-4">

        {/* 💙 DASHBOARD */}
        {tab === "dashboard" && (
          <DashboardAdvisorPanel advisorId={advisorId} owners={owners} />
        )}

        {/* 💛 FEEDBACK */}
        {tab === "feedback" && (
          <FeedbackPanel advisorId={advisorId} owners={owners} />
        )}

        {/* 🔵 ANALYZER */}
        {tab === "analyzer" && (
          <AnalyzerPanel owners={owners} />
        )}

        {/* ⭐ NEW: RECOMMENDATIONS PAGE */}
        {tab === "recommendations" && (
          <RecommendationsPanel advisorId={advisorId} owners={owners} />
        )}

        {/* 🔔 NOTIFICATIONS */}
        {tab === "notifications" && (
          <NotificationsPanel advisorId={advisorId} />
        )}

        {/* 👤 ACCOUNT */}
        {tab === "account" && (
          <AccountPanel advisor={advisor} />
        )}

        {/* 🆘 SUPPORT */}
        {tab === "support" && <SupportPanel />}

      </main>
    </div>
  );
}

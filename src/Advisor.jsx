import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "./components/AdivosrComponents/AdvisorLayout.jsx";

import DashboardAdvisorPanel from "./components/AdivosrComponents/DashboardAdvisorPanel.jsx";
import AnalyzerPanel from "./components/AdivosrComponents/AnalyzerPanel.jsx";
import NotificationsPanel from "./components/AdivosrComponents/NotificationsPanel.jsx";
import AccountPanel from "./components/AdivosrComponents/AccountPanel.jsx";
import SupportPanel from "./components/AdivosrComponents/SupportPanel2.jsx";
import RecommendationsPanel from "./components/AdivosrComponents/RecommendationsPanel.jsx";
import FeedbackPanel from "./components/AdivosrComponents/FeedbackPanel.jsx";

export default function Advisor() {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const advisorId = user?.userId;

  const [tab, setTab] = useState("dashboard");
  const [owners, setOwners] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [advisor, setAdvisor] = useState(null);

  // ⭐ NEW: sidebar state
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
      setFeedback(data.feedback || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  return (
    <div className="app-wrapper">

      {/* HEADER with onOpenMenu */}
      <Header onOpenMenu={() => setSidebarOpen(true)} />

      {/* SIDEBAR with proper handlers */}
      <Sidebar
        tab={tab}
        setTab={setTab}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          localStorage.removeItem("loggedUser");
          window.location.href = "/auth";
        }}
      />

      <main className="container-fluid py-4">

        {tab === "dashboard" && (
          <DashboardAdvisorPanel owners={owners} advisorId={advisorId} />
        )}

        {tab === "feedback" && (
          <FeedbackPanel feedback={feedback} owners={owners} advisorId={advisorId} />
        )}

        {tab === "analyzer" && <AnalyzerPanel owners={owners} />}

        {tab === "recommendations" && (
          <RecommendationsPanel advisorId={advisorId} owners={owners} />
        )}

        {tab === "notifications" && <NotificationsPanel advisorId={advisorId} />}

        {tab === "account" && <AccountPanel advisor={advisor} />}

        {tab === "support" && (<SupportPanel advisorId={advisorId} />)}

      </main>
    </div>
  );
}

// Advisor.jsx
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpenMenu = () => setMenuOpen(true);
  const handleCloseMenu = () => setMenuOpen(false);

  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [owners, setOwners] = useState([]);

  // ----------------------- FIXED API CALLS -----------------------

  const fetchTickets = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/advisor/tickets/${advisorId}`
      );
      const data = await res.json();
      if (data?.tickets) setTickets(data.tickets);
    } catch (err) {
      console.error("Error fetching tickets", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/advisor/notifications/${advisorId}`
      );
      const data = await res.json();
      if (data?.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // ---- FIX: USE CORRECT ENDPOINT ----
  const fetchFeedback = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/advisor/feedback/all/${advisorId}`
      );
      const data = await res.json();

      setFeedback(data);
      
      // Owners come from Dashboard API, not feedback
      fetchOwners();
    } catch (err) {
      console.error("Error fetching feedback", err);
    }
  };

  // ---- FIX: GET OWNERS FROM DASHBOARD API ----
  const fetchOwners = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/advisor/dashboard/${advisorId}`
      );
      const data = await res.json();
      if (data?.owners) setOwners(data.owners);
    } catch (err) {
      console.error("Error fetching owners", err);
    }
  };

  // ----------------------------------------------------------------

  useEffect(() => {
    if (!advisorId) return;

    fetchTickets();
    fetchNotifications();
    fetchFeedback();  
    fetchOwners();

  }, [advisorId]);

  const openCount = tickets.filter((t) => t.status === "open").length;

  const renderTab = () => {
    switch (tab) {
      case "dashboard":
        return (
          <DashboardAdvisorPanel
            advisorId={advisorId}
            tickets={tickets}
            notifications={notifications}
            feedback={feedback}
            setTab={setTab}
            openCount={openCount}
          />
        );

      case "analyzer":
        return <AnalyzerPanel advisorId={advisorId} />;

      case "notifications":
        return (
          <NotificationsPanel
            advisorId={advisorId}
            notifications={notifications}
            setNotifications={setNotifications}
            fetchNotifications={fetchNotifications}
          />
        );

      case "account":
        return <AccountPanel advisorId={advisorId} />;

      case "support":
        return (
          <SupportPanel
            tickets={tickets}
            setTickets={setTickets}
            fetchTickets={fetchTickets}
            setTab={setTab}
          />
        );

      case "recommendations":
        return <RecommendationsPanel advisorId={advisorId} owners={owners} />;

      case "feedback":
        return (
          <FeedbackPanel
            feedback={feedback}
            owners={owners}
            advisorId={advisorId}
            setFeedback={setFeedback}
            fetchFeedback={fetchFeedback}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="advisor-layout">
      <Header onOpenMenu={handleOpenMenu} />

      <div className="advisor-body">
        <Sidebar
          tab={tab}
          setTab={setTab}
          isOpen={menuOpen}
          onClose={handleCloseMenu}
        />

        <main className="advisor-content">{renderTab()}</main>
      </div>
    </div>
  );
}

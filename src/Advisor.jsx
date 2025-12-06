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
  const [prevTab, setPrevTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [owners, setOwners] = useState([]);

  // =============== MENU CONTROLS ===============
  const handleOpenMenu = () => setMenuOpen(true);
  const handleCloseMenu = () => setMenuOpen(false);

  // =============== CHANGE TAB WITH HISTORY ===============
  const changeTab = (newTab) => {
    setPrevTab(tab); // save previous tab
    setTab(newTab);  // change to new tab
  };

  // ----------------------- API CALLS -----------------------

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

  const fetchFeedback = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/advisor/feedback/all/${advisorId}`
      );
      const data = await res.json();
      setFeedback(data);

      // ensure owners list stays updated
      fetchOwners();
    } catch (err) {
      console.error("Error fetching feedback", err);
    }
  };

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

  // INITIAL LOAD
  useEffect(() => {
    if (!advisorId) return;

    fetchTickets();
    fetchNotifications();
    fetchFeedback();
    fetchOwners();
  }, [advisorId]);

  const openCount = tickets.filter((t) => t.status === "open").length;

  // ----------------------- PANEL RENDERING -----------------------
  const renderTab = () => {
    switch (tab) {
      case "dashboard":
        return (
          <DashboardAdvisorPanel
            advisorId={advisorId}
            tickets={tickets}
            notifications={notifications}
            feedback={feedback}
            setTab={changeTab}
            openCount={openCount}
          />
        );

      case "analyzer":
        return (
          <AnalyzerPanel
            advisorId={advisorId}
            setTab={changeTab}
          />
        );

      case "notifications":
        return (
          <NotificationsPanel
            advisorId={advisorId}
            notifications={notifications}
            setNotifications={setNotifications}
            fetchNotifications={fetchNotifications}
            setTab={changeTab}
            prevTab={prevTab}
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
            setTab={changeTab}
            prevTab={prevTab}
          />
        );

      case "recommendations":
        return (
          <RecommendationsPanel
            advisorId={advisorId}
            owners={owners}
            setTab={changeTab}
            prevTab={prevTab}
          />
        );

      case "feedback":
        return (
          <FeedbackPanel
            feedback={feedback}
            owners={owners}
            advisorId={advisorId}
            setFeedback={setFeedback}
            fetchFeedback={fetchFeedback}
            setTab={changeTab}
            prevTab={prevTab}
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
          setTab={changeTab}
          isOpen={menuOpen}
          onClose={handleCloseMenu}
        />

        <main className="advisor-content">{renderTab()}</main>
      </div>
    </div>
  );
}

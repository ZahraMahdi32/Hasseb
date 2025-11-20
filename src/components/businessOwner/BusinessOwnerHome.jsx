import React, { useState } from "react";
import "./BusinessOwnerHome.css";

import BusinessDataUpload from "./BusinessDataUpload";
import BreakEvenCalculator from "./BreakEvenCalculator";
import PricingSimulator from "./PricingSimulator";
import CashFlowTool from "./CashFlowTool";
import AccountPanel from "../Mangercopnents/AccountPanel.jsx";
import NotificationsPanel from "../Mangercopnents/NotificationsPanel.jsx";

import { bepTestData } from "../../data/bepTestData";

export default function OwnerHome() {
    const [activeTool, setActiveTool] = useState("data");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [hasUploadedData, setHasUploadedData] = useState(false);

    const tools = [
        {
            id: "data",
            name: "Business Data",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
            ),
            requiresData: false
        },
        {
            id: "breakEven",
            name: "Break-Even Simulator",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            requiresData: true
        },
        {
            id: "pricing",
            name: "Pricing Simulator",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            requiresData: true,
        },
        {
            id: "cashflow",
            name: "Cash Flow Tool",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            requiresData: true,
        },
    ];

    const handleToolClick = (toolId, requiresData) => {
        if (requiresData && !hasUploadedData) {
            // Show warning but still allow navigation to see the tool
            setActiveTool(toolId);
        } else {
            setActiveTool(toolId);
        }
        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const activToolInfo = tools.find(t => t.id === activeTool);

    return (
        <div className="owner-home">
            {/* Top Header */}
            <header className="owner-header">
                <div className="owner-header-content">
                    <div className="owner-header-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                </div>
            </header>

            {/* Sidebar */}
    <aside
        className={`sidebar-neo pm-slide ${sidebarOpen ? "is-open" : ""}`}
        role="navigation"
      >
        <div className="offcanvas-header sidebar-neo__brand">
          <div className="d-flex align-items-center gap-2">
            <img
              src="/assets/Haseeb.png"   
      alt="Haseeb Logo"
      className="sidebar-logo-img"
            />
          
          </div>
        </div>

        <div className="offcanvas-body p-0 d-flex flex-column">
          <nav className="py-3 px-3 flex-grow-1">
            {tools.map((tool) => {
              const active = activeTool === tool.id;
              const disabled = !!tool.comingSoon;

              return (
                <button
                  key={tool.id}
                  disabled={disabled}
                  onClick={() => handleToolClick(tool.id, tool.requiresData)}
                  className={`sidebar-neo__item ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
                >
                  <span className="sidebar-neo__icon">{tool.icon}</span>
                  <span className="sidebar-neo__label">{tool.name}</span>
                  {tool.requiresData && !hasUploadedData && <span className="sidebar-neo__dot" />}
                  {tool.comingSoon && <span className="sidebar-badge">Soon</span>}
                </button>
              );
            })}
          </nav>

          {/* Bottom dock (Account + Notifications) */}
          <div className="sidebar-neo__dock">
            <button
              className="sidebar-neo__dock-btn"
              title="Account"
              aria-label="Account"
              onClick={() => setActiveTool("AccountPanel")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            <button
              className="sidebar-neo__dock-btn"
              title="Notifications"
              aria-label="Notifications"
              onClick={() => setActiveTool("notificationsPanel")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="owner-main">
                <div className="owner-content">
                    {/* Warning Banner */}
                    {activToolInfo?.requiresData && !hasUploadedData && (
                        <div className="warning-banner">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <div className="warning-content">
                                <p className="warning-title">Data Upload Required</p>
                                <p className="warning-text">
                                    Upload your business data template to unlock this feature.{" "}
                                    <button
                                        className="warning-link"
                                        onClick={() => setActiveTool("data")}
                                    >
                                        Go to Business Data
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tool Content */}
                    {activeTool === "data" && (
                        <BusinessDataUpload onUploadSuccess={() => setHasUploadedData(true)} />
                    )}

                    {activeTool === "breakEven" && (
                        <BreakEvenCalculator baseData={hasUploadedData ? bepTestData : null} />
                    )}
                    {activeTool === "pricing" && (
                        <PricingSimulator baseData={bepTestData} />
                    )}
                    {activeTool === "cashflow" && (
                        <CashFlowTool baseData={bepTestData} />
                    )}
                   {activeTool === "accountPanel" && (
            <AccountPanel  />
          )}

                    {activeTool === "notificationsPanel" && (
                    <div className="owner-content">
                        <h4>Notifications</h4>
                        <NotificationsPanel />
                    </div>
                    )}


                </div>
            </main>
        </div>
    );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaWindowMaximize, FaDoorOpen } from "react-icons/fa";

const DrawerSidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [isSubHeaderOpen, setIsSubHeaderOpen] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = (tab: string) => {
    setIsSidebarOpen((prev) => !(prev && currentTab === tab));
    setCurrentTab(tab);
  };

  const watchScreen = () =>
    window.innerWidth <= 1024 && setIsSidebarOpen(false);

  useEffect(() => {
    loadingRef.current?.classList.add("hidden");
    window.addEventListener("resize", watchScreen);
    return () => window.removeEventListener("resize", watchScreen);
  }, []);

  return (
    <div className="text-gray-900 bg-gray-100 dark:bg-dark dark:text-light flex h-screen antialiased">
      {isSidebarOpen && (
        <>
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-10"
          ></div>
        </>
      )}
      <nav className="hidden w-16 flex-shrink-0 flex-col items-center rounded-br-3xl rounded-tr-3xl border-r-2 border-indigo-100 bg-white py-4 shadow-md sm:flex">
        <button
          onClick={() => toggleSidebar("messagesTab")}
          className={`rounded-lg p-2 shadow-md ${isSidebarOpen && currentTab === "messagesTab" ? "bg-indigo-600 text-white" : "text-gray-500 bg-white"}`}
        >
          <FaWindowMaximize />
        </button>
        <button
          onClick={() => toggleSidebar("notificationsTab")}
          className={`rounded-lg p-2 shadow-md ${isSidebarOpen && currentTab === "notificationsTab" ? "bg-indigo-600 text-white" : "text-gray-500 bg-white"}`}
        >
          <FaDoorOpen />
        </button>
      </nav>
      <div
        className={`fixed inset-y-0 left-0 z-10 w-64 flex-shrink-0 transform border-r-2 border-indigo-100 bg-white shadow-lg transition-transform ${isSidebarOpen ? "translate-x-0" : "hidden -translate-x-full"} rounded-br-3xl rounded-tr-3xl sm:left-16 sm:w-72 lg:static lg:w-64`}
      >
        {currentTab && (
          <section className="px-4 py-6">
            <h2 className="text-xl">
              {currentTab === "messagesTab" ? "Windows" : "Doors"}
            </h2>
          </section>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <header className="relative flex flex-shrink-0 items-center justify-between p-4">
          <button
            onClick={() => setIsSubHeaderOpen((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600 rounded-lg bg-white p-2 shadow-md sm:hidden"
          >
            <FaBars />
          </button>
          {isSubHeaderOpen && (
            <div className="absolute left-5 right-5 top-16 flex items-center justify-between rounded-md bg-white p-2 shadow-lg sm:hidden">
              <button
                onClick={() => {
                  toggleSidebar("messagesTab");
                  setIsSubHeaderOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg bg-white p-2 shadow-md"
              >
                <FaWindowMaximize />
              </button>
              <button
                onClick={() => {
                  toggleSidebar("notificationsTab");
                  setIsSubHeaderOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg bg-white p-2 shadow-md"
              >
                <FaDoorOpen />
              </button>
            </div>
          )}
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <h1 className="text-gray-500 text-5xl font-bold">In progress</h1>
        </main>
      </div>
    </div>
  );
};

export default DrawerSidebar;

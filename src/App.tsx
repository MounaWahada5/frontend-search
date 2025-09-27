import './App.css';
import { Chat } from './pages/chat/chat';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import UpdateProfilePage from './pages/auth/UpdateProfilePage';
import CompanyAdminPage from './pages/CompanyAdminPage'; // Updated extension to .tsx
import WebsiteAdminPage from './pages/WebsiteAdminPage';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useState } from 'react';
import { BiChat } from "react-icons/bi";
import { FaGears } from "react-icons/fa6";
import { FiTable } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import { MdOutlineHeadsetMic, MdSpaceDashboard } from "react-icons/md";
import { TiCalendar } from "react-icons/ti";
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ReadMorePage from './pages/ReadMorePage';

function AppContent() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const location = useLocation();

  const leftMenus = [
    { title: "Dashboard", icon: <MdSpaceDashboard />, active: true },
    { title: "Inbox", icon: <BiChat />, gap: true, subMenu: ["Requested Messages", "Unread Messages", "All Messages"], key: "inbox" },
    { title: "Calendar", icon: <TiCalendar /> },
    { title: "Tables", icon: <FiTable /> },
    { title: "Analytics", icon: <GoGraph /> },
    { title: "Support", icon: <MdOutlineHeadsetMic /> },
    { title: "Setting", icon: <FaGears />, subMenu: ["General", "Security", "Notifications"], key: "settings" },
  ];

  const rightMenus = [
    { title: "Projects", icon: <MdSpaceDashboard /> },
    { title: "Tasks", icon: <BiChat />, gap: true, subMenu: ["Active Tasks", "Completed Tasks", "Archived Tasks"], key: "tasks" },
    { title: "Team", icon: <TiCalendar /> },
    { title: "Reports", icon: <FiTable /> },
    { title: "Statistics", icon: <GoGraph /> },
  ];

  const logo = "https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_640.png";

  const resources = [
    { title: "Getting Started | Securing a Web Application - Spring", url: "spring.io" },
    { title: "Spring Security Integration with Spring Boot - GeeksforGeeks", url: "geeksforgeeks.org" },
    { title: "Spring Security Project Example using Java Configuration", url: "geeksforgeeks.org" },
    { title: "Spring Security Example Tutorial - DigitalOcean", url: "digitalocean.com" },
    { title: "Spring Security Basics", url: "example.com" },
    { title: "Advanced Spring Security", url: "example.com" },
    { title: "Spring Security Best Practices", url: "example.com" },
  ];

  const history = [
    { text: "Fixing Sidebar Code for Function", date: "May 23, 2025" },
    { text: "React Component Structure and", date: "May 22, 2025" },
    { text: "Move Sidebar to Right in Dashbc", date: "May 21, 2025" },
  ];

  const showSidebars = ['', ''].includes(location.pathname);
  const showNavbar = location.pathname === '/';

  return (
    <div className="w-full h-screen bg-background text-gray-900 dark:text-white flex flex-col">
      {showNavbar && <Navbar />}
      <div className="flex flex-1">
        {showSidebars && (
          <Sidebar
            isOpen={leftOpen}
            toggleSidebar={() => setLeftOpen(!leftOpen)}
            menus={leftMenus}
            title="Main Menu"
            logo={logo}
            bgColor="bg-zinc-50 dark:bg-gray-800"
            borderColor="border-zinc-300 dark:border-gray-700"
            hoverBgColor="bg-zinc-100 dark:bg-gray-700/50"
            activeBgColor="bg-zinc-200 dark:bg-gray-700"
            position="left"
            history={history}
          />
        )}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/google-callback" element={<GoogleCallbackPage />} />
              <Route path="/read-more" element={<ReadMorePage />} />
              <Route path="/company-admin" element={<CompanyAdminPage />} />
              <Route path="/website-admin" element={<WebsiteAdminPage />} />
              <Route path="/update-profile" element={<UpdateProfilePage />} />
            </Routes>
          </main>
        </div>
        {showSidebars && (
          <Sidebar
            isOpen={rightOpen}
            toggleSidebar={() => setRightOpen(!rightOpen)}
            menus={rightMenus}
            title="Resources"
            logo={logo}
            bgColor="bg-zinc-50 dark:bg-gray-800"
            borderColor="border-zinc-300 dark:border-gray-700"
            hoverBgColor="bg-zinc-100 dark:bg-gray-700/50"
            activeBgColor="bg-zinc-200 dark:bg-gray-700"
            position="right"
            resources={resources}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
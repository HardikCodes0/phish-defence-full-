import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './context/authcontext';
import Navbar from './components/navbar';
import PageTransition from './components/PageTransition';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddCourse from './pages/AddCourse';
import Courses from './pages/CourseList';
import Home from './pages/home';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Coursedetail from './pages/coursedeatil';
import Quiz from './pages/Quiz';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/adminLogin';
import { DashboardRefreshProvider } from './contexts/DashboardRefreshContext';
import OAuthHandler from './components/OAuthHandler';
import JotformChatbot from './components/JotformChatbot';
import AIAssistantNotification from './components/AIAssistantNotification';


const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  // Hide Navbar on quiz page
  const hideNavbar = /^\/courses\/[^/]+\/quiz$/.test(location.pathname);

  return (
    <ThemeProvider>
      <AuthProvider>
        <OAuthHandler />
        <DashboardRefreshProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {!hideNavbar && (
              <Navbar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            )}
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/addcourse" element={<AddCourse />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<Coursedetail />} />
                <Route path="/courses/:courseId/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                <Route path="/admin-login" element={<AdminLogin />} />
              </Routes>
            </PageTransition>
            <JotformChatbot />
            <AIAssistantNotification />
          </div>
        </DashboardRefreshProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

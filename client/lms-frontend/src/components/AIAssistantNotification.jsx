import React, { useState, useEffect, useContext } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AuthContext } from '../context/authcontext';

const AIAssistantNotification = () => {
  const { user } = useContext(AuthContext);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user) {
      // Show notification after a short delay when user logs in
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [user]);

  if (!user || !showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-700 rounded-lg shadow-lg p-4 max-w-sm animate-slideIn">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            AI Assistant Available
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hi {user.username}! Your AI assistant is ready to help with cybersecurity questions.
          </p>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistantNotification; 
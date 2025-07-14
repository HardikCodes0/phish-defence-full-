import React, { useEffect, useContext, useRef, useState } from 'react';
import { AuthContext } from '../context/authcontext';

const JotformChatbot = () => {
  const { user } = useContext(AuthContext);
  const agentInitialized = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Jotform script is loaded
    const checkScriptLoaded = () => {
      if (window.AgentInitializer) {
        setScriptLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkScriptLoaded()) {
      // If not loaded, check every 100ms for up to 10 seconds
      const interval = setInterval(() => {
        if (checkScriptLoaded()) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Only initialize the agent if user is logged in, script is loaded, and agent hasn't been initialized yet
    if (user && scriptLoaded && !agentInitialized.current && window.AgentInitializer) {
      try {
        window.AgentInitializer.init({
          rootId: "JotformAgent-019803871aa976d4b0642ba001eeaeabce5d",
          formID: "019803871aa976d4b0642ba001eeaeabce5d",
          queryParams: ["skipWelcome=1", "maximizable=1"],
          domain: "https://www.jotform.com",
          isInitialOpen: false,
          isDraggable: false,
          background: "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)",
          buttonBackgroundColor: "#14b8a6",
          buttonIconColor: "#FFFFFF",
          variant: false,
          customizations: {
            greeting: "Yes",
            greetingMessage: `Hi ${user.username || 'there'}! I'm your Phish Defense assistant. How can I help you with cybersecurity training today?`,
            pulse: "Yes",
            position: "right"
          }
        });
        agentInitialized.current = true;
        console.log('✅ Jotform AI Agent initialized for logged-in user');
      } catch (error) {
        console.error('❌ Failed to initialize Jotform AI Agent:', error);
      }
    }

    // Cleanup function to remove the agent when user logs out
    return () => {
      if (!user && agentInitialized.current) {
        const agentElement = document.getElementById('JotformAgent-019803871aa976d4b0642ba001eeaeabce5d');
        if (agentElement) {
          agentElement.remove();
          agentInitialized.current = false;
          console.log('🗑️ Jotform AI Agent removed for logged-out user');
        }
      }
    };
  }, [user, scriptLoaded]);

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  // Return a container div for the agent (will be populated by Jotform script)
  return (
    <div 
      id="JotformAgent-019803871aa976d4b0642ba001eeaeabce5d"
      className="jotform-agent-container"
    />
  );
};

export default JotformChatbot; 
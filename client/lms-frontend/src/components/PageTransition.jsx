import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

const PageTransition = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="animate-fadeIn">
      {displayChildren}
    </div>
  );
};

export default PageTransition;
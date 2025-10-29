import { useState, useEffect } from 'react';

// We'll rename the existing hook to match what the sidebar component expects
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on load
    checkIfMobile();
    
    // Add listener for resize events
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
}

// Keep the original function for backward compatibility
export function useMobileDetect() {
  return useIsMobile();
}

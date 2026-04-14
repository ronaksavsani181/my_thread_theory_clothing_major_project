import { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  // Function to trigger the alert from anywhere
  const showAlert = useCallback((message, type = "error") => {
    setAlert({ message, type });
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      
      {/* Global Alert UI */}
      {alert && (
        <div className="fixed top-8 right-8 z-[100] flex min-w-[320px] max-w-md animate-fade-in-down flex-col border border-gray-800 bg-black text-white shadow-2xl">
          <div className="flex items-start justify-between p-5">
            <div className="flex gap-4">
              {/* Dynamic Icon based on Error vs Success */}
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                {alert.type === "error" ? (
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              {/* Alert Text */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-300">
                  {alert.type === "error" ? "Notification" : "Success"}
                </h4>
                <p className="mt-1 text-sm font-light leading-relaxed text-gray-100">
                  {alert.message}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setAlert(null)} 
              className="ml-4 text-gray-500 transition-colors hover:text-white focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar Animation (Optional but adds a premium feel) */}
          <div className="h-1 w-full bg-gray-900">
            <div className={`h-full ${alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'} animate-shrink-width`}></div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
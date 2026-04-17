import { createContext, useContext, useState, useCallback, useRef } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const timerRef = useRef(null);

  // Function to trigger the alert from anywhere
  const showAlert = useCallback((message, type = "error") => {
    // 🌟 FIX: Clear any existing timer so fast, repeated clicks don't glitch the alert closing
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setAlert({ message, type });
    
    // Auto-hide after 4 seconds
    timerRef.current = setTimeout(() => {
      setAlert(null);
    }, 4000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      
      {/* =========================================
          GLOBAL LUXURY ALERT UI (All Devices)
          ========================================= */}
      <div 
        className={`fixed top-4 sm:top-8 left-1/2 sm:left-auto sm:right-8 z-[100] w-[92%] sm:w-auto min-w-[320px] max-w-md transform transition-all duration-500 ease-[0.25,1,0.5,1] ${
          alert ? "translate-y-0 opacity-100 sm:-translate-x-0 -translate-x-1/2" : "-translate-y-10 opacity-0 sm:-translate-x-0 -translate-x-1/2 pointer-events-none"
        }`}
      >
        {alert && (
          <div className="flex flex-col bg-white border border-neutral-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden font-sans">
            
            <div className="flex items-start justify-between p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4 items-start">
                
                {/* Dynamic Lucide Icon based on Error vs Success */}
                <div className="mt-0.5 flex shrink-0 items-center justify-center">
                  {alert.type === "error" ? (
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 stroke-[2]" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 stroke-[2]" />
                  )}
                </div>
                
                {/* Alert Text */}
                <div>
                  <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">
                    {alert.type === "error" ? "Notification" : "Success"}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-neutral-900 pr-4">
                    {alert.message}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => {
                  setAlert(null);
                  if (timerRef.current) clearTimeout(timerRef.current);
                }} 
                className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-900 focus:outline-none p-1 -mr-1 -mt-1 active:scale-95"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.5]" />
              </button>
            </div>
            
            {/* Progress Bar Animation (Premium shrinking line) */}
            <div className="h-[2px] w-full bg-neutral-100">
              {/* Key key dynamically resets animation when a new alert pops up */}
              <div 
                key={new Date().getTime()}
                className={`h-full ${alert.type === 'error' ? 'bg-red-500' : 'bg-neutral-900'} animate-[shrink-width_4s_linear_forwards]`}
              ></div>
            </div>
            
          </div>
        )}
      </div>

      {/* Global override for the progress bar animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
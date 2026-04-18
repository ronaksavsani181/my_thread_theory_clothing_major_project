import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 'instant' ensures the user doesn't see a scrolling animation, 
    // it just snaps instantly to the top of the new page.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", 
    });
  }, [pathname]);

  return null; // This component renders nothing visually
}
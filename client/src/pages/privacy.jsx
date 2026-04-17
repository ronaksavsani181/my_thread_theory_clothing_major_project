import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Always scroll to top when opening this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const sections = [
    {
      id: "our-commitment",
      title: "Our Commitment",
      content: (
        <p>
          At Thread Theory, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy outlines our practices regarding the collection, use, and safeguarding of your data when you interact with our Site, purchase our garments, or communicate with our concierge team.
        </p>
      )
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      content: (
        <>
          <p>
            We collect information to provide a more personalized and seamless luxury shopping experience. This includes:
          </p>
          <ul className="mt-5 space-y-3 list-none pl-0">
            <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-neutral-300 before:rounded-full">
              <strong className="font-medium text-neutral-900">Personal Details:</strong> Your name, email address, phone number, shipping and billing addresses provided during checkout or account creation.
            </li>
            <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-neutral-300 before:rounded-full">
              <strong className="font-medium text-neutral-900">Transaction Data:</strong> Details about the pieces you purchase, sizing preferences, and payment status (processed securely via Razorpay; we do not store your full card details).
            </li>
            <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-neutral-300 before:rounded-full">
              <strong className="font-medium text-neutral-900">Automated Data:</strong> IP addresses, browser types, device identifiers, and browsing behavior collected via cookies to enhance site functionality.
            </li>
          </ul>
        </>
      )
    },
    {
      id: "how-we-use",
      title: "How We Use Your Data",
      content: (
        <>
          <p>
            The data we collect is utilized exclusively to elevate your experience with Thread Theory. Specifically, we use your information to:
          </p>
          <ul className="mt-5 space-y-3 list-none pl-0">
            <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-neutral-300 before:rounded-full">Process and fulfill your orders, including sending shipping updates and delivery confirmations.</li>
            <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-neutral-300 before:rounded-full">Manage your returns, exchanges, and customer service inquiries efficiently.</li>
            <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-neutral-300 before:rounded-full">Tailor our editorial content and product recommendations to your sartorial preferences.</li>
            <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-neutral-300 before:rounded-full">Send you exclusive invitations, collection previews, and promotional materials (only if you have opted in).</li>
          </ul>
        </>
      )
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      content: (
        <p>
          Thread Theory does not sell, rent, or trade your personal information to third parties. We only share your data with trusted partners who assist us in operating our platform and conducting our business, such as payment gateways (Razorpay), premium courier services, and secure cloud hosting providers. These partners are strictly obligated to keep your information confidential and secure.
        </p>
      )
    },
    {
      id: "cookies-tracking",
      title: "Cookies & Tracking",
      content: (
        <p>
          Our Site uses cookies and similar tracking technologies to distinguish you from other users, preserve your shopping bag contents, and analyze site traffic. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some elegant features of our Site may become unavailable to you.
        </p>
      )
    },
    {
      id: "data-security",
      title: "Data Security",
      content: (
        <p>
          We implement state-of-the-art security measures to maintain the safety of your personal information. All sensitive payment information is encrypted and transmitted via Secure Socket Layer (SSL) technology directly to our payment gateway providers. Access to your personal data within Thread Theory is strictly restricted to authorized personnel only.
        </p>
      )
    },
    {
      id: "your-rights",
      title: "Your Rights & Choices",
      content: (
        <p>
          You reserve the right to access, update, or request the deletion of your personal information at any time. If you possess a registered account, you may modify your details via the <Link to="/dashboard" className="text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 transition-colors pb-0.5">Account Dashboard</Link>. To opt out of our editorial newsletters, simply click the "unsubscribe" link located at the bottom of our emails.
        </p>
      )
    }
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Adjust offset for fixed glassmorphism headers
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // 🟢 CINEMATIC REDIRECTION HANDLER
  const handleConciergeRedirect = (e) => {
    e.preventDefault();
    setIsRedirecting(true);
    
    // Allow the button animation and state change to render, then route smoothly
    setTimeout(() => {
      navigate("/contact");
    }, 800);
  };

  return (
    <div className={`bg-white min-h-[100dvh] font-sans pb-24 sm:pb-32 selection:bg-neutral-200 overflow-hidden transition-opacity duration-700 ${isRedirecting ? 'opacity-50' : 'opacity-100'}`}>
      
      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 lg:pt-36">
        
        {/* =========================================
            EDITORIAL HEADER 
            ========================================= */}
        <div className="flex flex-col mb-12 sm:mb-16 border-b border-neutral-200 pb-8 sm:pb-10 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">
            Privacy Policy
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Thread Theory • Data Protection & Security
          </p>
          <p className="text-[10px] sm:text-xs text-neutral-400 font-light mt-5 sm:mt-6 tracking-wider">
            Last Updated: October 2026
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* =========================================
              LEFT PANEL: STICKY TABLE OF CONTENTS 
              ========================================= */}
          <aside className="hidden lg:block w-64 flex-shrink-0 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            <div className="sticky top-32">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900 mb-8">
                Contents
              </h3>
              <ul className="space-y-6 border-l border-neutral-100 pl-5">
                {sections.map((section, index) => (
                  <li key={section.id} className="relative group">
                    {/* Animated dot indicator on hover */}
                    <span className="absolute -left-[23px] top-1.5 w-1.5 h-1.5 bg-neutral-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <button 
                      onClick={() => handleScroll(section.id)}
                      className="text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 group-hover:text-neutral-900 transition-all duration-300 text-left flex items-baseline transform group-hover:translate-x-1"
                    >
                      <span className="mr-3 text-[9px] text-neutral-300 transition-colors group-hover:text-neutral-500">0{index + 1}.</span> 
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* =========================================
              RIGHT PANEL: LEGAL CONTENT 
              ========================================= */}
          <main className="flex-1 w-full max-w-4xl">
            <div className="space-y-20 sm:space-y-24">
              {sections.map((section, index) => (
                <section 
                  id={section.id} 
                  key={section.id} 
                  className="scroll-mt-32 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]"
                  style={{ animationDelay: `${0.3 + (index * 0.1)}s` }} // Cascading section load
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5 mb-5 sm:mb-6">
                    <span className="text-xl sm:text-2xl font-light text-neutral-300 tracking-tighter">0{index + 1}.</span>
                    <h2 className="text-xl sm:text-2xl font-light tracking-wide uppercase text-neutral-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-sm sm:text-base font-light text-neutral-500 leading-[1.8] sm:leading-loose tracking-wide space-y-5">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {/* =========================================
                CONTACT SUPPORT FOOTER 
                ========================================= */}
            <div className="mt-24 sm:mt-32 pt-12 sm:pt-16 border-t border-neutral-200 opacity-0 animate-[fade-in-up_0.8s_ease-out_1s_forwards]">
              <h3 className="text-lg sm:text-xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">
                Data & Privacy Inquiries
              </h3>
              <p className="text-xs sm:text-sm font-light text-neutral-500 leading-relaxed tracking-wide mb-8 max-w-lg">
                Should you have any concerns regarding how your data is handled, our dedicated data protection team is at your complete disposal.
              </p>
              
              {/* 🟢 REDIRECTION BUTTON */}
              <button 
                onClick={handleConciergeRedirect}
                disabled={isRedirecting}
                className="group/btn relative overflow-hidden inline-flex items-center justify-center border border-neutral-950 bg-white text-neutral-950 px-8 sm:px-10 py-4.5 sm:py-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white disabled:opacity-80 active:scale-[0.98] w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center gap-3 transition-colors duration-500 group-hover/btn:text-white">
                  {isRedirecting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      Contact Concierge
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2] transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </>
                  )}
                </span>
                {/* Cinematic Hover Fill - Disabled during loading */}
                {!isRedirecting && (
                  <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                )}
              </button>

            </div>
          </main>

        </div>
      </div>

      {/* GLOBAL CSS FOR SCROLLBAR & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Always scroll to top when opening this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: (
        <>
          <p>
            By accessing, browsing, or using the Thread Theory website (the "Site"), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Site.
          </p>
          <p className="mt-5">
            We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Site following any changes constitutes your acceptance of the revised terms.
          </p>
        </>
      )
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      content: (
        <p>
          All content on this Site, including but not limited to text, graphics, logos, images, audio clips, digital downloads, data compilations, and garment designs, is the exclusive property of Thread Theory and is protected by international copyright and trademark laws. You may not reproduce, duplicate, copy, sell, or otherwise exploit any portion of this Site without express written consent from us.
        </p>
      )
    },
    {
      id: "products-pricing",
      title: "Products & Pricing",
      content: (
        <>
          <p>
            We strive to display the colors, textures, and details of our garments as accurately as possible. However, we cannot guarantee that your monitor's display of any color will be perfectly accurate. 
          </p>
          <p className="mt-5">
            All prices are shown in INR (₹) and are inclusive of applicable taxes unless otherwise stated. We reserve the right to change the prices of our products at any time without notice. In the event of a pricing error on the Site, Thread Theory reserves the right to cancel any orders placed for the item at the incorrect price.
          </p>
        </>
      )
    },
    {
      id: "orders-payments",
      title: "Orders & Payments",
      content: (
        <>
          <p>
            Placing an order on our Site constitutes an offer to purchase. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information, or problems identified by our fraud avoidance department.
          </p>
          <p className="mt-5">
            We utilize Razorpay as our secure payment gateway. By submitting your payment information, you grant us the right to provide such information to third parties for purposes of facilitating the completion of your purchase.
          </p>
        </>
      )
    },
    {
      id: "shipping-delivery",
      title: "Shipping & Delivery",
      content: (
        <p>
          Thread Theory offers complimentary shipping on selected orders. Delivery timelines are estimates and commence from the date of shipping, rather than the date of order. We are not responsible for delays caused by customs clearance processes or courier delays. Risk of loss and title for items purchased from our Site pass to you upon delivery of the items to the carrier.
        </p>
      )
    },
    {
      id: "returns-exchanges",
      title: "Returns & Exchanges",
      content: (
        <p>
          We take immense pride in the craftsmanship of our garments. If you are not entirely satisfied with your purchase, you may request a return within the specified return window. Items must be unworn, unwashed, and retain all original tags and packaging. Please review our detailed Return Policy or visit your <Link to="/orders" className="text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 transition-colors pb-0.5">Order History</Link> for more information on processing a dispute or refund.
        </p>
      )
    },
    {
      id: "user-conduct",
      title: "User Conduct",
      content: (
        <p>
          You agree to use the Site only for lawful purposes. You are prohibited from posting or transmitting to or from the Site any unlawful, threatening, libelous, defamatory, obscene, scandalous, inflammatory, pornographic, or profane material, or any other material that could give rise to any civil or criminal liability under the law.
        </p>
      )
    },
    {
      id: "limitation",
      title: "Limitation of Liability",
      content: (
        <p>
          To the fullest extent permitted by applicable law, Thread Theory shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Site.
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
            Terms & Conditions
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Thread Theory • Legal Framework & Policies
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
                Further Inquiries
              </h3>
              <p className="text-xs sm:text-sm font-light text-neutral-500 leading-relaxed tracking-wide mb-8 max-w-lg">
                If you have any questions or require further clarification regarding our Terms & Conditions, our concierge team is at your complete disposal.
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
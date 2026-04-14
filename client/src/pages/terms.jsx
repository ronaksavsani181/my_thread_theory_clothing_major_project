import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Terms() {
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
          <p className="mt-4">
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
          <p className="mt-4">
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
          <p className="mt-4">
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
          We take immense pride in the craftsmanship of our garments. If you are not entirely satisfied with your purchase, you may request a return within the specified return window. Items must be unworn, unwashed, and retain all original tags and packaging. Please review our detailed Return Policy or visit your <Link to="/my-returns" className="text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 transition-colors">Returns Ledger</Link> for more information on processing a dispute or refund.
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
      // Adjust offset for fixed headers
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

  return (
    <div className="bg-white min-h-screen font-sans pb-32 selection:bg-neutral-200">
      
      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 pt-28 lg:pt-36">
        
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col mb-16 border-b border-neutral-200 pb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Thread Theory • Legal Framework & Policies
          </p>
          <p className="text-xs text-neutral-500 font-light mt-6 tracking-wider">
            Last Updated: October 2026
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* LEFT PANEL: STICKY TABLE OF CONTENTS */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900 mb-8">
                Contents
              </h3>
              <ul className="space-y-5 border-l border-neutral-200 pl-4">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <button 
                      onClick={() => handleScroll(section.id)}
                      className="text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-400 hover:text-neutral-900 transition-colors text-left"
                    >
                      <span className="mr-3 text-[9px] text-neutral-300">0{index + 1}.</span> 
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* RIGHT PANEL: LEGAL CONTENT */}
          <main className="flex-1 w-full max-w-3xl">
            <div className="space-y-20">
              {sections.map((section, index) => (
                <section id={section.id} key={section.id} className="scroll-mt-32">
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-2xl font-light text-neutral-300 tracking-tighter">0{index + 1}.</span>
                    <h2 className="text-xl sm:text-2xl font-light tracking-wide uppercase text-neutral-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-sm font-light text-neutral-500 leading-loose tracking-wide space-y-4">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {/* CONTACT SUPPORT FOOTER */}
            <div className="mt-24 pt-12 border-t border-neutral-200">
              <h3 className="text-lg font-light tracking-wide uppercase text-neutral-900 mb-4">
                Further Inquiries
              </h3>
              <p className="text-sm font-light text-neutral-500 leading-relaxed tracking-wide mb-8">
                If you have any questions or require further clarification regarding our Terms & Conditions, our concierge team is at your disposal.
              </p>
              <Link 
                to="/contact" 
                className="group relative overflow-hidden inline-flex items-center justify-center border border-neutral-950 bg-white text-neutral-950 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white"
              >
                <span className="relative z-10">Contact Concierge</span>
                <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
              </Link>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
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
          <ul className="mt-4 space-y-2 list-disc list-inside pl-4 marker:text-neutral-300">
            <li><strong className="font-medium text-neutral-900">Personal Details:</strong> Your name, email address, phone number, shipping and billing addresses provided during checkout or account creation.</li>
            <li><strong className="font-medium text-neutral-900">Transaction Data:</strong> Details about the pieces you purchase, sizing preferences, and payment status (processed securely via Razorpay; we do not store your full card details).</li>
            <li><strong className="font-medium text-neutral-900">Automated Data:</strong> IP addresses, browser types, device identifiers, and browsing behavior collected via cookies to enhance site functionality.</li>
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
          <ul className="mt-4 space-y-2 list-disc list-inside pl-4 marker:text-neutral-300">
            <li>Process and fulfill your orders, including sending shipping updates and delivery confirmations.</li>
            <li>Manage your returns, exchanges, and customer service inquiries efficiently.</li>
            <li>Tailor our editorial content and product recommendations to your sartorial preferences.</li>
            <li>Send you exclusive invitations, collection previews, and promotional materials (only if you have opted in).</li>
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
          You reserve the right to access, update, or request the deletion of your personal information at any time. If you possess a registered account, you may modify your details via the <Link to="/dashboard" className="text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 transition-colors">Account Dashboard</Link>. To opt out of our editorial newsletters, simply click the "unsubscribe" link located at the bottom of our emails.
        </p>
      )
    }
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Adjust offset for fixed headers
      const offset = 120;
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
            Privacy Policy
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Thread Theory • Data Protection & Security
          </p>
          <p className="text-xs text-neutral-500 font-light mt-6 tracking-wider">
            Last Updated: October 2026
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* LEFT PANEL: STICKY TABLE OF CONTENTS */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-36">
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
                <section id={section.id} key={section.id} className="scroll-mt-36">
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
                Data & Privacy Inquiries
              </h3>
              <p className="text-sm font-light text-neutral-500 leading-relaxed tracking-wide mb-8">
                Should you have any concerns regarding how your data is handled, our dedicated data protection team is at your service.
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
"use client";
import React, { useEffect } from 'react';

export default function LandingPage() {
  useEffect(() => {
    // Add logic here from the original script if needed
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    const handleScroll = () => {
      if(window.scrollY > 50) header?.classList.add('scrolled');
      else header?.classList.remove('scrolled');
    };

    const toggleMenu = () => {
      burger?.classList.toggle('open');
      mobileMenu?.classList.toggle('open');
    };

    window.addEventListener('scroll', handleScroll);
    burger?.addEventListener('click', toggleMenu);

    // Reveal animations
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('show');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12});
    reveals.forEach(el => io.observe(el));

    // Counter animation
    const counters = document.querySelectorAll('[data-count]');
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || '';
        const dur = 1600, start = performance.now();
        const step = (now) => {
          const p = Math.min((now-start)/dur, 1);
          const val = Math.floor((1-Math.pow(1-p, 3)) * target);
          el.textContent = val.toLocaleString('en-IN') + suffix;
          if(p<1) requestAnimationFrame(step); 
          else el.textContent = target.toLocaleString('en-IN') + suffix;
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, {threshold: 0.5});
    counters.forEach(c => cio.observe(c));

    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    const handleFaqClick = function() {
      const item = this.closest('.faq-item');
      const a = item.querySelector('.faq-a');
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const ans = i.querySelector('.faq-a');
        if (ans) ans.style.maxHeight = null;
      });
      if(!open){
        item.classList.add('open');
        if (a) a.style.maxHeight = a.scrollHeight + 'px';
      }
    };
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-q');
      if (q) q.addEventListener('click', handleFaqClick);
    });

    // Smooth anchor offset for fixed header
    const handleAnchorClick = function(ev) {
      const id = this.getAttribute('href');
      if(id && id.length > 1){
        const t = document.querySelector(id);
        if(t){
          ev.preventDefault();
          const y = t.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }
    };
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(a => a.addEventListener('click', handleAnchorClick));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      burger?.removeEventListener('click', toggleMenu);
      reveals.forEach(el => io.unobserve(el));
      counters.forEach(c => cio.unobserve(c));
      faqItems.forEach(item => {
        const q = item.querySelector('.faq-q');
        if (q) q.removeEventListener('click', handleFaqClick);
      });
      anchors.forEach(a => a.removeEventListener('click', handleAnchorClick));
    };
  }, []);

  return (
    <div className="landing-page-container">
      

{/* ============= NAVBAR ============= */}
<header id="header">
 <div className="wrap nav">
 <a href="#" className="logo">
 <span className="logo-mark" style={{background: "transparent", boxShadow: "none"}}>
 <svg width="32" height="32" viewBox="0 0 189 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M45.0879 63.4871C45.1245 61.3863 46.7801 59.6719 48.8783 59.5621L111.882 56.2645C115.508 56.0747 117.491 60.4256 114.968 63.0377L50.8679 129.416C48.3455 132.028 43.9281 130.198 43.9912 126.567L45.0879 63.4871Z" fill="var(--primary)"/>
  <path d="M131.109 138.872C131.072 140.973 129.417 142.687 127.318 142.797L64.3147 146.094C60.6884 146.284 58.7058 141.933 61.2283 139.321L125.329 72.9434C127.851 70.3313 132.269 72.1609 132.205 75.7916L131.109 138.872Z" fill="var(--primary)"/>
  <rect x="76" width="113" height="25" rx="4" fill="var(--primary)"/>
  <rect x="189" y="17" width="96" height="25" rx="4" transform="rotate(90 189 17)" fill="var(--primary)"/>
 </svg>
 </span>
 <span className="logo-text" style={{display: 'flex', gap: '5px'}}>Innonsh<span style={{color: "var(--primary)"}}>LeadGen</span></span>
 </a>
 <nav className="nav-links">
 <a href="#challenges">Challenges</a>
 <a href="#features">Features</a>
 <a href="#workflow">Workflow</a>
 <a href="#dashboard">Dashboard</a>
 <a href="#why">Why Innonsh</a>
 <a href="#faq">FAQ</a>
 </nav>
 <div className="nav-cta">
 <a href="/login" className="btn btn-ghost">Sign In</a>
 <a href="#contact" className="btn btn-primary">Book a Demo</a>
 </div>
 <button className="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
 </div>
</header>
<div className="mobile-menu" id="mobileMenu">
 <a href="#challenges">Challenges</a>
 <a href="#features">Features</a>
 <a href="#workflow">Workflow</a>
 <a href="#dashboard">Dashboard</a>
 <a href="#why">Why Innonsh</a>
 <a href="#faq">FAQ</a>
 <a href="#contact" className="btn btn-primary">Book a Demo</a>
</div>

{/* ============= HERO ============= */}
<section className="hero">
 <div className="hero-bg">
 <div className="grid-bg"></div>
 <div className="blob b1"></div><div className="blob b2"></div><div className="blob b3"></div>
 </div>
 <div className="wrap hero-grid">
 <div>
 <span className="eyebrow reveal">★ Enterprise-grade Sales CRM</span>
 <h1 className="reveal d1">Transform Leads Into <span className="grad-text">Loyal Customers</span></h1>
 <p className="hero-sub reveal d2">A complete customer relationship management platform that streamlines lead management, customer engagement, quotations, invoicing, team collaboration, and sales analytics all in one place.</p>
 <div className="hero-cta reveal d3">
 <a href="#contact" className="btn btn-primary">Book a Demo
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
 </a>
 <a href="/login" className="btn btn-ghost">Sign In</a>
 </div>
 <div className="trust reveal d4">
 <div className="trust-stars">
 <div className="stars">
 <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg>
 <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg>
 <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg>
 <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg>
 <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg>
 </div>
 <span>4.9/5 from 1,200+ sales teams</span>
 </div>
 <div className="logos">
 <span><i className="dot"></i>NorthBridge</span>
 <span><i className="dot"></i>Vertex Labs</span>
 <span><i className="dot"></i>Apex Retail</span>
 <span><i className="dot"></i>Lumen Co.</span>
 </div>
 </div>
 </div>

 {/* Hero dashboard mockup */}
 <div className="dash-wrap reveal d3">
 <div className="float-card fc-1">
        <span className="fi" style={{background: "var(--green)"}}>
 <svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
 </span>
 <div><div className="ft">Deal Closed</div><div className="fv">₹4.8L Won</div></div>
 </div>
 <div className="float-card fc-2">
        <span className="fi" style={{background: "var(--secondary)"}}>
 <svg viewBox="0 0 24 24" fill="none"><path d="M3 17l5-5 4 3 7-8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
 </span>
 <div><div className="ft">Conversion</div><div className="fv">+38% ↑</div></div>
 </div>

 <div className="dash">
 <div className="dash-bar">
 <div className="dots"><i></i><i></i><i></i></div>
 <div className="dash-url">app.innonshcrm.com/dashboard</div>
 </div>
 <div className="dash-body">
 <div className="dash-side">
 <div className="ic active"><svg viewBox="0 0 24 24" fill="none"><path d="M3 12l9-8 9 8M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <div className="ic"><svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M16 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <div className="ic"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M7 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
 <div className="ic"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V9m5 10V5m5 14v-7m5 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
 <div className="ic"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
 </div>
 <div className="dash-main">
 <h4>Sales Overview</h4>
 <div className="ds-sub">Welcome back, Priya · Updated just now</div>
 <div className="kpis">
 <div className="kpi"><div className="lbl">Pipeline</div><div className="val">₹18.4L</div><div className="chg up">▲ 12%</div></div>
 <div className="kpi"><div className="lbl">New Leads</div><div className="val">248</div><div className="chg up">▲ 9%</div></div>
 <div className="kpi"><div className="lbl">Won</div><div className="val">62</div><div className="chg up">▲ 21%</div></div>
 </div>
 <div className="dash-cols">
 <div className="panel">
 <div className="pt">Revenue Trend <small>Last 8 weeks</small></div>
 <div className="chart">
 <div className="bar" style={{height: "40%"}}></div>
 <div className="bar" style={{height: "58%"}}></div>
 <div className="bar alt" style={{height: "48%"}}></div>
 <div className="bar" style={{height: "72%"}}></div>
 <div className="bar alt" style={{height: "64%"}}></div>
 <div className="bar" style={{height: "88%"}}></div>
 <div className="bar alt" style={{height: "78%"}}></div>
 <div className="bar" style={{height: "100%"}}></div>
 </div>
 </div>
 <div className="panel">
 <div className="pt">Conversion</div>
 <div className="donut"><span>68%</span></div>
 <div className="leg">
                  <div><i style={{background: "var(--primary)"}}></i>Won</div>
                  <div><i style={{background: "var(--secondary)"}}></i>In Progress</div>
                  <div><i style={{background: "var(--line)"}}></i>Lost</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
</section>

{/* ============= STATS STRIP ============= */}
<section className="stats-strip">
 <div className="wrap stats-grid">
 <div className="stat reveal"><div className="num" data-count="38" data-suffix="%">0%</div><div className="lbl">Higher conversion rates</div></div>
 <div className="stat reveal d1"><div className="num" data-count="4" data-suffix="x">0x</div><div className="lbl">Faster quotation cycles</div></div>
 <div className="stat reveal d2"><div className="num" data-count="1200" data-suffix="+">0+</div><div className="lbl">Sales teams onboarded</div></div>
 <div className="stat reveal d3"><div className="num" data-count="99" data-suffix="%">0%</div><div className="lbl">Follow-ups never missed</div></div>
 </div>
</section>

{/* ============= CHALLENGES ============= */}
<section className="pad alt-bg" id="challenges">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow sec">The Problem</span>
 <h2>Sales teams lose deals to <span className="grad-text">chaos, not competition</span></h2>
 <p>Spreadsheets, sticky notes and scattered inboxes quietly leak revenue every single day. Here's what that looks like and how Innonsh CRM fixes it.</p>
 </div>
 <div className="split">
 <div className="prob-list reveal">
 <div className="prob"><span className="pic"><svg viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><div><b>Lost leads</b><p>Inquiries slip through the cracks with no central capture.</p></div></div>
 <div className="prob"><span className="pic"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><div><b>Missed follow-ups</b><p>No reminders means warm prospects go cold.</p></div></div>
 <div className="prob"><span className="pic"><svg viewBox="0 0 24 24" fill="none"><path d="M9 7h6m-6 4h6m-6 4h4M5 4h14v16H5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><div><b>Manual quotations</b><p>Hours wasted building quotes by hand, error after error.</p></div></div>
 <div className="prob"><span className="pic"><svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><div><b>Poor communication tracking</b><p>Nobody knows who said what, or when.</p></div></div>
 <div className="prob"><span className="pic"><svg viewBox="0 0 24 24" fill="none"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><div><b>Payment tracking issues</b><p>Outstanding invoices vanish into the void.</p></div></div>
 <div className="prob"><span className="pic"><svg viewBox="0 0 24 24" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7M3 21l18-18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><div><b>Lack of sales visibility</b><p>No real-time view of pipeline or performance.</p></div></div>
 <div className="prob"><span className="pic"><svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 14l-3 3m0-3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><div><b>Unorganized customer data</b><p>Contacts and documents scattered everywhere.</p></div></div>
 </div>
 <div className="sol-card reveal d2">
 <h3>Innonsh CRM solves all of it</h3>
 <p>One unified platform that captures, organizes and automates your entire sales motion.</p>
 <div className="sol-list">
 <div className="sol-item"><span className="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><b>Capture every lead</b> automatically from web, calls & WhatsApp.</span></div>
 <div className="sol-item"><span className="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><b>Smart reminders</b> so no follow-up is ever missed again.</span></div>
 <div className="sol-item"><span className="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><b>One-click quotations</b> with GST, discounts & instant invoicing.</span></div>
 <div className="sol-item"><span className="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><b>Full activity timeline</b> across every channel and rep.</span></div>
 <div className="sol-item"><span className="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><b>Live payment tracking</b> with outstanding balance alerts.</span></div>
 <div className="sol-item"><span className="ck"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><b>Real-time analytics</b> for total pipeline visibility.</span></div>
 </div>
 </div>
 </div>
 </div>
</section>

{/* ============= FEATURES ============= */}
<section className="pad" id="features">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow">Platform Modules</span>
 <h2>Everything your sales team needs, <span className="grad-text">beautifully unified</span></h2>
 <p>Seven powerful modules working together to run your entire revenue operation end to end.</p>
 </div>
 <div className="feat-grid">

 <div className="feat-card reveal">
 <span className="tag">Module A</span>
 <div className="feat-ic g1"><svg viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4-9 4-9-4Zm0 5l9 4 9-4M3 17l9 4 9-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <h3>Lead Management</h3>
 <p>Prioritize, track and never lose a single opportunity.</p>
 <ul className="feat-list">
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Hot / Warm / Cold prioritization</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Lead lifecycle tracking</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Customer documents storage</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Full interaction history</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Follow-up reminders</li>
 </ul>
 </div>

 <div className="feat-card reveal d1">
 <span className="tag">Module B</span>
 <div className="feat-ic g2"><svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="#fff" strokeWidth="2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 9l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <h3>Customer Engagement</h3>
 <p>Stay close to every customer at every touchpoint.</p>
 <ul className="feat-list">
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Call logging</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Meeting scheduling</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Task management</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Activity timeline</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Communication records</li>
 </ul>
 </div>

 <div className="feat-card reveal d2">
 <span className="tag">Module C</span>
 <div className="feat-ic g3"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="2"/><path d="M4 7l8 6 8-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <h3>Email & Message Tracking</h3>
 <p>Know exactly when prospects open and engage.</p>
 <ul className="feat-list">
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Email open tracking</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Proposal download tracking</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>WhatsApp integration</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Multi-channel communication</li>
 </ul>
 </div>

 <div className="feat-card reveal">
 <span className="tag">Module D</span>
 <div className="feat-ic g4"><svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-5 9 5v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div>
 <h3>Product Catalog</h3>
 <p>A single source of truth for products & services.</p>
 <ul className="feat-list">
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Product database</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>SKU management</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Standard pricing</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Service catalog</li>
 </ul>
 </div>

 <div className="feat-card reveal d1">
 <span className="tag">Module E</span>
 <div className="feat-ic g5"><svg viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v15H6z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/><path d="M14 2v5h5M9 13h6m-6 4h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div>
 <h3>Estimation & Invoicing</h3>
 <p>Quote to cash, automated and error-free.</p>
 <ul className="feat-list">
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Quotation builder & GST calc</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Discount management</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>One-click quote → invoice</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Partial payment tracking</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Outstanding balance monitoring</li>
 </ul>
 </div>

 <div className="feat-card reveal d2">
 <span className="tag">Module F</span>
 <div className="feat-ic g6"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div>
 <h3>Team Management</h3>
 <p>Align, track and motivate your entire sales force.</p>
 <ul className="feat-list">
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Sales target management</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Regional team allocation</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Performance monitoring</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Team productivity tracking</li>
 </ul>
 </div>

 <div className="feat-card reveal d3" style={{gridColumn: "span 1"}}>
 <span className="tag">Module G</span>
 <div className="feat-ic g7"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <h3>Analytics Dashboard</h3>
 <p>Turn raw sales data into confident decisions.</p>
 <ul className="feat-list">
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Revenue pipeline</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Conversion rates</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Sales forecasting</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Agent scorecards</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Performance reports</li>
 </ul>
 </div>

 {/* Mini CTA card to fill the 8th slot */}
      <div className="feat-card reveal d4" style={{background: "var(--grad)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gridColumn: "span 2"}}>
 <h3 style={{color: "#fff", fontSize: "24px"}}>All modules. One subscription.</h3>
 <p style={{color: "rgba(255,255,255,.92)", fontSize: "15px", maxWidth: "460px"}}>No add-on fees, no surprise costs. Everything your team needs to sell smarter is included from day one.</p>
 <a href="#contact" className="btn btn-white" style={{marginTop: "8px"}}>Book a Demo</a>
 </div>

 </div>
 </div>
</section>

{/* ============= ROLES ============= */}
<section className="pad alt-bg" id="roles">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow acc">Built for Every Role</span>
 <h2>Role-based access that <span className="grad-text">fits your hierarchy</span></h2>
 <p>From the boardroom to the field, everyone gets exactly the tools and visibility they need.</p>
 </div>
 <div className="role-grid">
 <div className="role-card reveal">
        <span className="role-badge" style={{background: "rgba(37,99,235,.1)", color: "var(--primary)"}}>Full Access</span>
 <div className="role-top">
          <div className="role-av" style={{background: "linear-gradient(135deg,#10B981,#34d399)"}}>SO</div>
 <div className="rt"><b>System Owner</b><small>Administrator</small></div>
 </div>
 <ul>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Company administration</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Employee onboarding</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Billing management</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>System settings</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Full reports access</li>
 </ul>
 </div>
 <div className="role-card reveal d1">
        <span className="role-badge" style={{background: "rgba(124,58,237,.1)", color: "var(--secondary)"}}>Team Lead</span>
 <div className="role-top">
          <div className="role-av" style={{background: "linear-gradient(135deg,#0D9488,#2dd4bf)"}}>SM</div>
 <div className="rt"><b>Sales Manager</b><small>Team Supervisor</small></div>
 </div>
 <ul>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Team supervision</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Lead assignment</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Performance reviews</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Target allocation</li>
 </ul>
 </div>
 <div className="role-card reveal d2">
 <span className="role-badge" style={{background: "rgba(6,182,212,.12)", color: "#0e7490"}}>Field Team</span>
 <div className="role-top">
          <div className="role-av" style={{background: "linear-gradient(135deg,#14B8A6,#5eead4)"}}>SR</div>
 <div className="rt"><b>Sales Representative</b><small>Front-line Sales</small></div>
 </div>
 <ul>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Customer communication</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Follow-up management</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Meeting scheduling</li>
 <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Quotation creation</li>
 </ul>
 </div>
 </div>
 </div>
</section>

{/* ============= WORKFLOW ============= */}
<section className="pad" id="workflow">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow">The Sales Journey</span>
 <h2>From first touch to <span className="grad-text">loyal customer</span></h2>
 <p>Innonsh CRM guides every deal through a structured, repeatable flow nothing falls through the cracks.</p>
 </div>
 <div className="flow">
 <div className="flow-step left reveal"><div className="flow-card"><b>Lead Captured</b><p>Auto-collected from web, call & WhatsApp</p></div><div className="flow-num">1</div><div className="spacer"></div></div>
 <div className="flow-step right reveal"><div className="spacer"></div><div className="flow-num">2</div><div className="flow-card"><b>Lead Assigned</b><p>Routed to the right rep instantly</p></div></div>
 <div className="flow-step left reveal"><div className="flow-card"><b>Follow-Up</b><p>Smart reminders keep momentum</p></div><div className="flow-num">3</div><div className="spacer"></div></div>
 <div className="flow-step right reveal"><div className="spacer"></div><div className="flow-num">4</div><div className="flow-card"><b>Meeting Scheduled</b><p>Calendar-synced, zero double booking</p></div></div>
 <div className="flow-step left reveal"><div className="flow-card"><b>Quotation Sent</b><p>One-click quote with GST & discounts</p></div><div className="flow-num">5</div><div className="spacer"></div></div>
 <div className="flow-step right reveal"><div className="spacer"></div><div className="flow-num">6</div><div className="flow-card"><b>Customer Approval</b><p>Tracked opens & download analytics</p></div></div>
 <div className="flow-step left reveal"><div className="flow-card"><b>Invoice Generated</b><p>Convert quote to invoice instantly</p></div><div className="flow-num">7</div><div className="spacer"></div></div>
 <div className="flow-step right reveal"><div className="spacer"></div><div className="flow-num">8</div><div className="flow-card"><b>Payment Received</b><p>Partial & full payments auto-tracked</p></div></div>
 <div className="flow-step left reveal"><div className="flow-card"><b>Customer Retained</b><p>Ongoing engagement & upsell ready</p></div><div className="flow-num">9</div><div className="spacer"></div></div>
 </div>
 </div>
</section>

{/* ============= DASHBOARD PREVIEW ============= */}
<section className="pad alt-bg" id="dashboard">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow sec">Live Workspace</span>
 <h2>Your entire sales operation, <span className="grad-text">at a glance</span></h2>
 <p>A real-time command centre built for clarity. This is the actual Innonsh CRM dashboard.</p>
 </div>

 <div className="preview-shell reveal">
 <div className="pv-top">
 <div className="pv-l">
 <div className="pv-logo"><svg viewBox="0 0 24 24" fill="none"><path d="M3 12c2-5 6-7 9-7s7 2 9 7c-2 5-6 7-9 7s-7-2-9-7Z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.6" fill="#fff"/></svg></div>
 <b>Sales Dashboard</b>
 </div>
 <div className="pv-search"><svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Search leads, deals, invoices…</div>
 <div className="pv-right">
 <div className="pv-bell"><svg viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M10 21a2 2 0 004 0" stroke="currentColor" strokeWidth="2"/></svg></div>
 <div className="pv-ava">PK</div>
 </div>
 </div>

 <div className="pv-body">
 {/* KPI row */}
 <div className="pv-kpis">
 <div className="pv-kpi">
 <div className="ki g1"><svg viewBox="0 0 24 24" fill="none"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div>
 <div className="kl">Total Revenue</div>
 <div className="kv">₹42.6L</div>
 <div className="kc up">▲ 18.2% vs last month</div>
 </div>
 <div className="pv-kpi">
 <div className="ki g2"><svg viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4-9 4-9-4Zm0 5l9 4 9-4M3 17l9 4 9-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <div className="kl">Active Leads</div>
 <div className="kv">1,284</div>
 <div className="kc up">▲ 9.4% this week</div>
 </div>
 <div className="pv-kpi">
 <div className="ki g3"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
 <div className="kl">Conversion Rate</div>
 <div className="kv">68%</div>
 <div className="kc up">▲ 6.1% improvement</div>
 </div>
 <div className="pv-kpi">
 <div className="ki g5"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div>
 <div className="kl">Outstanding</div>
 <div className="kv">₹6.2L</div>
 <div className="kc down">▼ 3.5% pending dues</div>
 </div>
 </div>

 {/* Revenue chart + conversion donut */}
 <div className="pv-row">
 <div className="pv-panel">
 <div className="ph"><b>Revenue Pipeline</b><div className="seg"><span>Week</span><span className="on">Month</span><span>Quarter</span></div></div>
 <div className="pv-chart">
 <div className="pv-bar-col"><div className="bset"><div className="pv-bar" style={{height: "48%"}}></div><div className="pv-bar s" style={{height: "32%"}}></div></div><small>Jan</small></div>
 <div className="pv-bar-col"><div className="bset"><div className="pv-bar" style={{height: "62%"}}></div><div className="pv-bar s" style={{height: "44%"}}></div></div><small>Feb</small></div>
 <div className="pv-bar-col"><div className="bset"><div className="pv-bar" style={{height: "54%"}}></div><div className="pv-bar s" style={{height: "38%"}}></div></div><small>Mar</small></div>
 <div className="pv-bar-col"><div className="bset"><div className="pv-bar" style={{height: "78%"}}></div><div className="pv-bar s" style={{height: "56%"}}></div></div><small>Apr</small></div>
 <div className="pv-bar-col"><div className="bset"><div className="pv-bar" style={{height: "70%"}}></div><div className="pv-bar s" style={{height: "50%"}}></div></div><small>May</small></div>
 <div className="pv-bar-col"><div className="bset"><div className="pv-bar" style={{height: "92%"}}></div><div className="pv-bar s" style={{height: "68%"}}></div></div><small>Jun</small></div>
 <div className="pv-bar-col"><div className="bset"><div className="pv-bar" style={{height: "100%"}}></div><div className="pv-bar s" style={{height: "74%"}}></div></div><small>Jul</small></div>
 </div>
 <div className="don-leg" style={{marginTop: "14px", justifyContent: "flex-start"}}>
              <div><i style={{background: "var(--primary)"}}></i>Closed Won</div>
              <div><i style={{background: "var(--secondary)"}}></i>In Pipeline</div>
 </div>
 </div>
 <div className="pv-panel">
 <div className="ph"><b>Conversion</b></div>
 <div className="pv-don">
 <div className="don2"><div className="dc"><b>68%</b><small>Win Rate</small></div></div>
 <div className="don-leg">
                <div><i style={{background: "var(--primary)"}}></i>Won</div>
                <div><i style={{background: "var(--secondary)"}}></i>Negotiation</div>
                <div><i style={{background: "var(--accent)"}}></i>Proposal</div>
                <div><i style={{background: "var(--line)"}}></i>Lost</div>
 </div>
 </div>
 </div>
 </div>

 {/* Recent leads + Upcoming meetings */}
 <div className="pv-row2">
 <div className="pv-panel">
 <div className="ph"><b>Recent Leads</b><div className="seg"><span className="on">All</span></div></div>
            <div className="lead-row"><div className="lead-av" style={{background: "linear-gradient(135deg,#10B981,#34d399)"}}>AR</div><div className="lead-info"><b>Arjun Retail Pvt Ltd</b><small>₹2.4L · Bangalore</small></div><span className="pill hot">Hot</span></div>
            <div className="lead-row"><div className="lead-av" style={{background: "linear-gradient(135deg,#0D9488,#2dd4bf)"}}>MS</div><div className="lead-info"><b>Meera Solutions</b><small>₹1.1L · Pune</small></div><span className="pill warm">Warm</span></div>
            <div className="lead-row"><div className="lead-av" style={{background: "linear-gradient(135deg,#14B8A6,#5eead4)"}}>TC</div><div className="lead-info"><b>TechCorp Systems</b><small>₹3.8L · Mumbai</small></div><span className="pill hot">Hot</span></div>
            <div className="lead-row"><div className="lead-av" style={{background: "linear-gradient(135deg,#10B981,#34d399)"}}>NV</div><div className="lead-info"><b>Nova Ventures</b><small>₹0.9L · Delhi</small></div><span className="pill cold">Cold</span></div>
 </div>
 <div className="pv-panel">
 <div className="ph"><b>Upcoming Meetings</b><div className="seg"><span className="on">Today</span></div></div>
 <div className="meet-row"><div className="meet-time"><b>10:00</b><small>AM</small></div><div className="meet-info"><b>Demo Arjun Retail</b><small>Video call · Priya K.</small></div></div>
 <div className="meet-row"><div className="meet-time"><b>12:30</b><small>PM</small></div><div className="meet-info"><b>Proposal Review</b><small>On-site · TechCorp</small></div></div>
 <div className="meet-row"><div className="meet-time"><b>3:00</b><small>PM</small></div><div className="meet-info"><b>Follow-up Call</b><small>Phone · Meera Solutions</small></div></div>
 <div className="meet-row"><div className="meet-time"><b>4:45</b><small>PM</small></div><div className="meet-info"><b>Contract Signing</b><small>Video call · Nova Ventures</small></div></div>
 </div>
 </div>

 {/* Tasks + Team performance */}
 <div className="pv-row2">
 <div className="pv-panel">
 <div className="ph"><b>Tasks</b><div className="seg"><span>3 of 5 done</span></div></div>
 <div className="task-row is-done"><div className="cbox done"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div><span>Send quotation to Arjun Retail</span><span className="task-tag">Quote</span></div>
 <div className="task-row is-done"><div className="cbox done"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div><span>Log call with Meera Solutions</span><span className="task-tag">Call</span></div>
 <div className="task-row"><div className="cbox"></div><span>Follow up on TechCorp proposal</span><span className="task-tag">Follow-up</span></div>
 <div className="task-row"><div className="cbox"></div><span>Generate invoice for Nova Ventures</span><span className="task-tag">Invoice</span></div>
 <div className="task-row is-done"><div className="cbox done"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div><span>Schedule Q3 review meeting</span><span className="task-tag">Meeting</span></div>
 </div>
 <div className="pv-panel">
 <div className="ph"><b>Team Performance</b><div className="seg"><span className="on">This Month</span></div></div>
 <table className="tbl">
 <thead><tr><th>Agent</th><th>Target</th><th>Status</th></tr></thead>
 <tbody>
                <tr><td><div className="agent"><div className="a-av" style={{background: "linear-gradient(135deg,#10B981,#34d399)"}}>PK</div>Priya K.</div></td><td><div className="prog"><i style={{width: "94%"}}></i></div></td><td><span className="target-met">94%</span></td></tr>
                <tr><td><div className="agent"><div className="a-av" style={{background: "linear-gradient(135deg,#0D9488,#2dd4bf)"}}>RS</div>Rahul S.</div></td><td><div className="prog"><i style={{width: "78%"}}></i></div></td><td><span className="target-met">78%</span></td></tr>
                <tr><td><div className="agent"><div className="a-av" style={{background: "linear-gradient(135deg,#14B8A6,#5eead4)"}}>AN</div>Ananya N.</div></td><td><div className="prog"><i style={{width: "62%"}}></i></div></td><td><span className="target-miss">62%</span></td></tr>
                <tr><td><div className="agent"><div className="a-av" style={{background: "linear-gradient(135deg,#10B981,#34d399)"}}>VM</div>Vikram M.</div></td><td><div className="prog"><i style={{width: "88%"}}></i></div></td><td><span className="target-met">88%</span></td></tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </div>
</section>

{/* ============= BENEFITS ============= */}
<section className="pad" id="benefits">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow">Business Impact</span>
 <h2>Measurable results, <span className="grad-text">from week one</span></h2>
 <p>Innonsh CRM doesn't just organize your data it moves your most important numbers.</p>
 </div>
 <div className="ben-grid">
 <div className="ben reveal"><div className="ben-ic g1"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div><b>Never miss a follow-up</b><p>Automated reminders keep every prospect warm and every promise kept.</p></div>
 <div className="ben reveal d1"><div className="ben-ic g2"><svg viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8Z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></svg></div><b>Faster quotations</b><p>Generate accurate, GST-ready quotes in seconds, not hours.</p></div>
 <div className="ben reveal d2"><div className="ben-ic g3"><svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="#fff" strokeWidth="2"/><path d="M3 20c0-3 2.5-5 5-5M15 11l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><b>Better collaboration</b><p>One shared workspace keeps every team member perfectly aligned.</p></div>
 <div className="ben reveal d3"><div className="ben-ic g4"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><b>Higher conversion</b><p>Prioritized hot leads and timely action close more deals, faster.</p></div>
 <div className="ben reveal d1"><div className="ben-ic g5"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6.5 7 .6-5.3 4.6L18.5 21 12 17l-6.5 4 1.8-6.7L2 9.1l7-.6L12 2Z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></svg></div><b>Improved experience</b><p>Personal, timely communication that customers actually remember.</p></div>
 <div className="ben reveal d2"><div className="ben-ic g6"><svg viewBox="0 0 24 24" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="2"/></svg></div><b>Complete visibility</b><p>Real-time dashboards give leadership total pipeline clarity.</p></div>
 <div className="ben reveal d3"><div className="ben-ic g7"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.5-6.5l-2.8 2.8M9.3 14.7l-2.8 2.8m11 0l-2.8-2.8M9.3 9.3L6.5 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div><b>Automated operations</b><p>Repetitive admin runs itself, freeing reps to sell more.</p></div>
      <div className="ben reveal d4" style={{background: "var(--text)", color: "#fff"}}><div className="ben-ic" style={{background: "rgba(255,255,255,.15)"}}><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div><b style={{color: "#fff"}}>Ready to grow</b><p style={{color: "#94a3b8"}}>Scales effortlessly from a 3-person team to a 300-person org.</p></div>
 </div>
 </div>
</section>

{/* ============= WHY CHOOSE / COMPARISON ============= */}
<section className="pad alt-bg" id="why">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow acc">Why Innonsh CRM</span>
 <h2>The difference is <span className="grad-text">night and day</span></h2>
 <p>See how the old way of selling stacks up against a modern, unified CRM.</p>
 </div>
 <div className="cmp reveal">
 <table>
 <thead>
 <tr>
 <th className="c-feat">Feature</th>
 <th className="c-trad">Traditional Method</th>
 <th className="c-inn">Innonsh CRM</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td className="feat-name">Lead Capture</td>
 <td className="c-trad-cell"><span className="x"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>Manual entry in spreadsheets</span></td>
 <td className="c-inn-cell"><span className="v"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Auto-captured, multi-channel</span></td>
 </tr>
 <tr>
 <td className="feat-name">Follow-ups</td>
 <td className="c-trad-cell"><span className="x"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>Easily forgotten</span></td>
 <td className="c-inn-cell"><span className="v"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Automated reminders</span></td>
 </tr>
 <tr>
 <td className="feat-name">Quotations</td>
 <td className="c-trad-cell"><span className="x"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>Hours of manual work</span></td>
 <td className="c-inn-cell"><span className="v"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>One-click with GST</span></td>
 </tr>
 <tr>
 <td className="feat-name">Invoicing</td>
 <td className="c-trad-cell"><span className="x"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>Separate tool, re-keying data</span></td>
 <td className="c-inn-cell"><span className="v"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Quote → invoice instantly</span></td>
 </tr>
 <tr>
 <td className="feat-name">Payment Tracking</td>
 <td className="c-trad-cell"><span className="x"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>Guesswork & chasing</span></td>
 <td className="c-inn-cell"><span className="v"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Live balance & alerts</span></td>
 </tr>
 <tr>
 <td className="feat-name">Sales Visibility</td>
 <td className="c-trad-cell"><span className="x"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>Monthly manual reports</span></td>
 <td className="c-inn-cell"><span className="v"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Real-time dashboards</span></td>
 </tr>
 <tr>
 <td className="feat-name">Team Productivity</td>
 <td className="c-trad-cell"><span className="x"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>No measurable insight</span></td>
 <td className="c-inn-cell"><span className="v"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Agent scorecards & targets</span></td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
</section>

{/* ============= TESTIMONIALS ============= */}
<section className="pad" id="testimonials">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow sec">Customer Stories</span>
 <h2>Loved by sales teams <span className="grad-text">across India</span></h2>
 <p>Don't just take our word for it here's what growing businesses say.</p>
 </div>
 <div className="test-grid">
 <div className="test-card reveal">
 <div className="quote-mark">"</div>
 <div className="test-stars"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg></div>
 <p>Innonsh CRM cut our quotation time from 2 hours to under 5 minutes. Our reps finally spend time selling instead of paperwork. Conversions are up 34%.</p>
        <div className="test-who"><div className="test-av" style={{background: "linear-gradient(135deg,#10B981,#34d399)"}}>RK</div><div><b>Rohan Kapoor</b><small>Sales Director, NorthBridge Retail</small></div></div>
 </div>
 <div className="test-card reveal d1">
 <div className="quote-mark">"</div>
 <div className="test-stars"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg></div>
 <p>The WhatsApp integration and follow-up reminders alone paid for the whole platform. We haven't lost a single warm lead in six months.</p>
        <div className="test-who"><div className="test-av" style={{background: "linear-gradient(135deg,#0D9488,#2dd4bf)"}}>SD</div><div><b>Sneha Desai</b><small>Founder, Lumen Co.</small></div></div>
 </div>
 <div className="test-card reveal d2">
 <div className="quote-mark">"</div>
 <div className="test-stars"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6 3.5 1.6-6.8L2 9.1l7-.6Z"/></svg></div>
 <p>As a manager, the agent scorecards give me instant clarity on who needs support. Our regional teams are finally working off one source of truth.</p>
        <div className="test-who"><div className="test-av" style={{background: "linear-gradient(135deg,#14B8A6,#5eead4)"}}>VM</div><div><b>Vikram Mehta</b><small>Regional Head, Apex Retail</small></div></div>
 </div>
 </div>
 </div>
</section>

{/* ============= FAQ ============= */}
<section className="pad alt-bg" id="faq">
 <div className="wrap">
 <div className="section-head reveal">
 <span className="eyebrow">Questions</span>
 <h2>Frequently asked <span className="grad-text">questions</span></h2>
 <p>Everything you need to know before getting started with Innonsh CRM.</p>
 </div>
 <div className="faq reveal">
 <div className="faq-item">
 <div className="faq-q">How long does it take to set up Innonsh CRM?<span className="pl"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg></span></div>
 <div className="faq-a"><p>Most teams are fully onboarded within 24–48 hours. Our guided setup imports your existing leads, configures your products and pricing, and trains your team with white-glove support at no extra cost.</p></div>
 </div>
 <div className="faq-item">
 <div className="faq-q">Can I import my existing customer data?<span className="pl"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg></span></div>
 <div className="faq-a"><p>Absolutely. You can import leads, contacts and historical data from spreadsheets (CSV/Excel) or other CRMs in just a few clicks. Nothing gets left behind.</p></div>
 </div>
 <div className="faq-item">
 <div className="faq-q">Does it support GST and Indian invoicing standards?<span className="pl"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg></span></div>
 <div className="faq-a"><p>Yes. Innonsh CRM is built for Indian businesses with automatic GST calculations, compliant invoice formats, discount handling, and partial payment tracking out of the box.</p></div>
 </div>
 <div className="faq-item">
 <div className="faq-q">Is my data secure?<span className="pl"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg></span></div>
 <div className="faq-a"><p>Security is foundational. All data is encrypted in transit and at rest, with role-based access controls, regular backups, and strict access permissions so each user only sees what they should.</p></div>
 </div>
 <div className="faq-item">
 <div className="faq-q">Can I track my team's performance?<span className="pl"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg></span></div>
 <div className="faq-a"><p>Yes. Managers get live agent scorecards, target tracking, regional team allocation and productivity reports giving you complete visibility into who's performing and where to coach.</p></div>
 </div>
 <div className="faq-item">
 <div className="faq-q">Does Innonsh CRM work on mobile?<span className="pl"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg></span></div>
 <div className="faq-a"><p>Completely. The platform is fully responsive and works beautifully on desktop, tablet and mobile, so your field reps can update leads, log calls and send quotes from anywhere.</p></div>
 </div>
 </div>
 </div>
</section>

{/* ============= FINAL CTA ============= */}
<section className="cta-final" id="contact">
 <div className="wrap">
 <div className="cta-box reveal">
 <span className="eyebrow">Get Started</span>
 <h2>Ready to Transform Your Sales Process?</h2>
 <p>Join 1,200+ teams already closing more with Innonsh CRM.</p>
 <div className="hero-cta">
 <a href="#" className="btn btn-white">Schedule Demo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
 </a>
 <a href="#" className="btn btn-outline-w">Contact Sales</a>
 </div>
 <div className="cta-note">
 <span><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>14-day free trial</span>
 <span><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>No credit card required</span>
 <span><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Free onboarding</span>
 </div>
 </div>
 </div>
</section>

{/* ============= FOOTER ============= */}
<footer>
 <div className="wrap">
 <div className="foot-grid">
 <div className="foot-brand">
 <a href="#" className="logo">
 <span className="logo-mark" style={{background: "transparent", boxShadow: "none"}}>
 <svg width="32" height="32" viewBox="0 0 189 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M45.0879 63.4871C45.1245 61.3863 46.7801 59.6719 48.8783 59.5621L111.882 56.2645C115.508 56.0747 117.491 60.4256 114.968 63.0377L50.8679 129.416C48.3455 132.028 43.9281 130.198 43.9912 126.567L45.0879 63.4871Z" fill="var(--primary)"/>
  <path d="M131.109 138.872C131.072 140.973 129.417 142.687 127.318 142.797L64.3147 146.094C60.6884 146.284 58.7058 141.933 61.2283 139.321L125.329 72.9434C127.851 70.3313 132.269 72.1609 132.205 75.7916L131.109 138.872Z" fill="var(--primary)"/>
  <rect x="76" width="113" height="25" rx="4" fill="var(--primary)"/>
  <rect x="189" y="17" width="96" height="25" rx="4" transform="rotate(90 189 17)" fill="var(--primary)"/>
 </svg>
 </span>
 <span className="logo-text" style={{display: 'flex', gap: '5px'}}>Innonsh<span style={{color: "var(--primary)"}}>CRM</span></span>
 </a>
 <p>A complete customer relationship management platform that turns leads into loyal customers from first touch to repeat business.</p>
 <div className="foot-contact">
 <div><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>hello@innonshcrm.com</div>
 <div><svg viewBox="0 0 24 24" fill="none"><path d="M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>+91 98765 43210</div>
 <div><svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2"/></svg>Pune, Maharashtra, India</div>
 </div>
 </div>
 <div className="foot-col">
 <h4>Product</h4>
 <a href="#features">Lead Management</a>
 <a href="#features">Estimation & Invoicing</a>
 <a href="#features">Analytics Dashboard</a>
 <a href="#dashboard">Live Workspace</a>
 <a href="#workflow">Sales Workflow</a>
 </div>
 <div className="foot-col">
 <h4>Company</h4>
 <a href="#why">Why Innonsh</a>
 <a href="#testimonials">Customer Stories</a>
 <a href="#benefits">Benefits</a>
 <a href="#faq">FAQ</a>
 <a href="#contact">Book a Demo</a>
 </div>
 <div className="foot-col">
 <h4>Resources</h4>
 <a href="#">Documentation</a>
 <a href="#">API Reference</a>
 <a href="#">Help Center</a>
 <a href="#">Privacy Policy</a>
 <a href="#">Terms of Service</a>
 </div>
 </div>
 <div className="foot-bottom">
 <p>© 2026 Innonsh CRM. All rights reserved.</p>
 <div className="socials">
 <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6c0-1.45-.03-3.3-2-3.3s-2.3 1.57-2.3 3.2V21h-4z"/></svg></a>
 <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4 4 0 00-6.9 3.7A11.4 11.4 0 013 4.8a4 4 0 001.2 5.4c-.6 0-1.2-.2-1.8-.5v.1a4 4 0 003.2 4 4 4 0 01-1.8.1 4 4 0 003.7 2.8A8 8 0 012 18.3a11.3 11.3 0 006.1 1.8c7.4 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.3 2-2.1Z"/></svg></a>
 <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12Z"/></svg></a>
 <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg></a>
 </div>
 </div>
 </div>
</footer>



    </div>
  );
}

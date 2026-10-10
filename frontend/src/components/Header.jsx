import React, { useState } from 'react';
import { Activity, ShieldCheck, Menu, X, Shield, Lock } from 'lucide-react';

export default function Header({ onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand-logo" onClick={() => window.location.reload()} title="MedSimplify Home">
          <div className="logo-icon-wrap">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              Med<span>Simplify</span>
            </span>
            <span className="brand-tagline">Understand your medical reports in simple language</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button type="button" className="nav-link" onClick={() => handleNavClick('safety-notice')}>
            <Shield size={15} />
            <span>Safety</span>
          </button>
          <button type="button" className="nav-link" onClick={() => handleNavClick('privacy-notice')}>
            <Lock size={15} />
            <span>Privacy</span>
          </button>
          <div className="header-badge">
            <ShieldCheck size={16} />
            <span>Patient-First AI</span>
          </div>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button type="button" className="mobile-nav-link" onClick={() => handleNavClick('safety-notice')}>
            <Shield size={18} />
            <span>Safety Notice</span>
          </button>
          <button type="button" className="mobile-nav-link" onClick={() => handleNavClick('privacy-notice')}>
            <Lock size={18} />
            <span>Privacy & Security</span>
          </button>
        </div>
      )}
    </header>
  );
}

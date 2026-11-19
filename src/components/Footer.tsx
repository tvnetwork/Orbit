import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Orbit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 text-white pt-20 pb-16 px-4 mt-auto border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Orbit className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">{t('common.brandName')}</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            {t('common.tagline', { defaultValue: 'Elite global marketplace for jobs, talent, and projects. Find or post jobs, connect with top talent worldwide.' })}
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Kontyra Services Operational</span>
          </div>
        </div>

        {/* Column 1: Products */}
        <div>
          <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-slate-400">Products</h4>
          <ul className="space-y-3.5 text-slate-400 text-sm">
            <li>
              <a 
                href="https://devos.kontyra.name.ng" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>DevOS Cloud Runtime</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <a 
                href="https://accounts.kontyra.name.ng" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>Identity & SSO</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <a 
                href="https://docs.kontyra.name.ng/kora" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>KORA AI Engine</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <a 
                href="https://vux.kontyra.name.ng" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>VUX Events</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-white transition-colors text-white font-medium">
                VyntaJobs Marketplace
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Resources & Company */}
        <div>
          <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-slate-400">Resources</h4>
          <ul className="space-y-3.5 text-slate-400 text-sm">
            <li>
              <a 
                href="https://docs.kontyra.name.ng" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>Documentation</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <a 
                href="https://blog.kontyra.name.ng" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>Official Blog</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <Link to="/community" className="hover:text-white transition-colors">
                Community
              </Link>
            </li>
            <li>
              <Link to="/help-center" className="hover:text-white transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/trust-safety" className="hover:text-white transition-colors">
                Trust & Safety
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Governance */}
        <div>
          <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-slate-400">Legal</h4>
          <ul className="space-y-3.5 text-slate-400 text-sm">
            <li>
              <a 
                href="https://legal.kontyra.name.ng/privacy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>Privacy Policy</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <a 
                href="https://legal.kontyra.name.ng/terms" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>Terms of Service</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <a 
                href="https://legal.kontyra.name.ng/cookies" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>Cookie Policy</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Kontyra
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 text-slate-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 Kontyra Technologies. All rights reserved.</p>
        <p className="text-slate-400 font-medium">Built for what's next.</p>
      </div>
    </footer>
  );
}

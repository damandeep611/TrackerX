"use client"

import type React from "react";
import { ArrowRight, Github, Hexagon, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] pt-24 pb-12 text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-electric/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Big CTA */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-16 mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to accelerate your{" "}
              <span className="text-accent-electric">growth</span>?
            </h2>
            <p className="text-gray-400 text-lg">
              Join 10,000+ developers who are tracking their way to mastery.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={18} />
            </button>
            <button className="px-8 py-4 bg-transparent border border-gray-700 text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Hexagon fill="#6C63FF" strokeWidth={0} size={32} />
              <span className="font-display font-bold text-2xl tracking-tight">
                BuildXskill
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              The learning management system designed for the modern stack.
              Built for speed, clarity, and results.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<Twitter size={20} />} href="#" />
              <SocialLink icon={<Github size={20} />} href="#" />
              <SocialLink icon={<Linkedin size={20} />} href="#" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <FooterLink href="#">Features</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Integrations</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Pricing</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Changelog</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Docs</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <FooterLink href="#">About</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Blog</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Careers</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Customers</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Brand</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <FooterLink href="#">Community</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Help Center</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Status</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Privacy</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Terms</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-xs text-gray-600">
          <p>© 2024 BuildXskill Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const SocialLink: React.FC<{ icon: React.ReactNode; href: string }> = ({
  icon,
  href,
}) => (
  <a
    href={href}
    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-accent-electric hover:text-white transition-all"
  >
    {icon}
  </a>
);

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a href={href} className="hover:text-white transition-colors">
    {children}
  </a>
);

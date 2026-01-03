'use client'

import Link from 'next/link'
import { Twitter, Github, Mail } from 'lucide-react'
import { TempleIcon } from './TempleIcon'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    services: [
      { name: 'Smart Contract Audit', href: '#services' },
      { name: 'Security Assessment', href: '#services' },
      { name: 'Penetration Testing', href: '#services' },
      { name: 'DeFi Review', href: '#services' },
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Audits', href: '#audits' },
      { name: 'Contact', href: '#contact' },
    ],
    social: [
      { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
      { name: 'GitHub', href: 'https://github.com/lefgiak', icon: Github },
    ],
  }

  return (
    <footer id="contact" className="relative pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0A0B]" />
      <div className="divider absolute top-0 left-0 right-0" />

      {/* Decorative temple silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-[0.02]">
        <div className="flex justify-around items-end h-full">
          <TempleIcon className="w-16 h-16" gradient={false} />
          <TempleIcon className="w-20 h-20" gradient={false} />
          <TempleIcon className="w-14 h-14" gradient={false} />
          <TempleIcon className="w-18 h-18" gradient={false} />
          <TempleIcon className="w-16 h-16" gradient={false} />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* CTA Section */}
        <div className="card-highlight rounded-3xl p-12 mb-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to secure your protocol?
          </h2>
          <p className="text-[#9CA3AF] text-lg mb-8 max-w-xl mx-auto">
            Get in touch to discuss your security needs. We respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@bangkokaudits.com"
              className="btn-primary text-base"
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base"
            >
              <Twitter className="w-5 h-5" />
              DM on Twitter
            </a>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <TempleIcon className="w-9 h-9" />
              <span className="text-xl font-bold">
                Bangkok<span className="gradient-text">Audits</span>
              </span>
            </Link>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Elite Web3 security auditing from Bangkok. Protecting smart contracts from vulnerabilities.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {links.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#9CA3AF] hover:text-[#D4AF37] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#9CA3AF] hover:text-[#D4AF37] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              {links.social.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)] transition-all"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="divider mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#9CA3AF] text-sm">
            © {currentYear} Bangkok Audits. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-[#9CA3AF] hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[#9CA3AF] hover:text-[#D4AF37] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

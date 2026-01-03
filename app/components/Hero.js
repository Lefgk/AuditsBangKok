'use client'

import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { TempleIcon } from './TempleIcon'

export function Hero() {
  const stats = [
    { value: '50+', label: 'Audits Completed' },
    { value: '$500M+', label: 'TVL Secured' },
    { value: '200+', label: 'Vulnerabilities Found' },
    { value: '0', label: 'Exploits Post-Audit' },
  ]

  const features = [
    'Smart Contract Security',
    'DeFi Protocol Analysis',
    'Formal Verification',
    '24/7 Support',
  ]

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0A0B]" />
      <div className="absolute inset-0 grid-bg" />

      {/* Gradient orbs - Gold themed */}
      <div className="glow-gold -top-48 -left-48 animate-float" />
      <div className="glow-maroon top-1/2 -right-48 animate-float" style={{ animationDelay: '3s' }} />

      {/* Temple silhouette decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5">
        <div className="flex justify-around items-end h-full">
          <TempleIcon className="w-24 h-24" gradient={false} />
          <TempleIcon className="w-32 h-32" gradient={false} />
          <TempleIcon className="w-20 h-20" gradient={false} />
          <TempleIcon className="w-28 h-28" gradient={false} />
          <TempleIcon className="w-24 h-24" gradient={false} />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="badge badge-gradient mb-8 inline-flex">
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
            <span>Web3 Security from Bangkok</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1]">
            Protecting the{' '}
            <span className="gradient-text">Decentralized</span>{' '}
            Future
          </h1>

          {/* Subheading */}
          <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10 leading-relaxed">
            Elite smart contract auditing for DeFi protocols, NFT platforms, and blockchain infrastructure.
            We find vulnerabilities before hackers do.
          </p>

          {/* Features list */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <a href="#audits" className="btn-primary text-base">
              View Audits
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#contact" className="btn-secondary text-base">
              Request Audit
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card gold-shimmer">
              <div className="stat-value">{stat.value}</div>
              <div className="text-[#9CA3AF] text-sm mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

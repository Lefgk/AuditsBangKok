'use client'

import { Code, Search, Bug, Cpu, FileCheck, Lock } from 'lucide-react'

const services = [
  {
    icon: Code,
    title: 'Smart Contract Audit',
    description: 'Comprehensive line-by-line review of Solidity, Vyper, and Rust contracts with manual analysis.',
  },
  {
    icon: Search,
    title: 'Security Assessment',
    description: 'Full protocol analysis covering economic attacks, oracle manipulation, and cross-chain risks.',
  },
  {
    icon: Bug,
    title: 'Penetration Testing',
    description: 'Real-world attack simulations against deployed contracts and infrastructure.',
  },
  {
    icon: Cpu,
    title: 'DeFi Protocol Review',
    description: 'Specialized audits for AMMs, lending protocols, yield aggregators, and complex DeFi.',
  },
  {
    icon: FileCheck,
    title: 'Formal Verification',
    description: 'Mathematical proofs of contract correctness for critical functions and invariants.',
  },
  {
    icon: Lock,
    title: 'Continuous Security',
    description: 'Ongoing monitoring and security reviews as your protocol evolves.',
  },
]

export function Services() {
  return (
    <section id="services" className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0A0B]" />

      {/* Gold glow */}
      <div className="glow-gold -bottom-48 -right-48 opacity-30" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="section-header thai-border pt-8">
          <p className="section-label">What We Do</p>
          <h2 className="section-title">
            Security <span className="gradient-text">Services</span>
          </h2>
          <p className="section-subtitle">
            Comprehensive security solutions for every stage of your Web3 project
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div key={index} className="card p-8 group gold-shimmer">
              {/* Icon */}
              <div className="feature-icon mb-6 group-hover:scale-110 transition-transform">
                <service.icon />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-[#9CA3AF] leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

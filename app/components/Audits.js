'use client'

import { useState, useEffect } from 'react'
import { FileText, ExternalLink, Download, Calendar, X } from 'lucide-react'
import { StonewallLogo } from './StonewallLogo'
import { MonadLogo, PulseChainLogo, AvalancheLogo, BNBChainLogo, SolanaLogo } from './ChainLogos'

// Configure your GitHub repo here
const GITHUB_CONFIG = {
  owner: 'Lefgk',
  repo: 'StoneWall',
  branch: 'main',
  auditsPath: 'audits',
}

// Manually add audits with metadata here
const MANUAL_AUDITS = [
  // Lemonad Ecosystem (Monad)
  {
    name: 'Lemonad Core',
    date: 'Jan 2026',
    client: 'Lemonad',
    logo: '/projects/lemonad.jpg',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 2, low: 2, info: 1 },
    sloc: 1200,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Lemonad-Core-Security-Audit.pdf',
    description: 'Token, yield farming, vault, treasury',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  {
    name: 'Lemonad DEX',
    date: 'Jan 2026',
    client: 'Lemonad',
    logo: '/projects/lemonad.jpg',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 1, low: 2, info: 2 },
    sloc: 800,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Lemonad-DEX-Security-Audit.pdf',
    description: 'Uniswap V2 fork',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  {
    name: 'Lemonad Gaming',
    date: 'Jan 2026',
    client: 'Lemonad',
    logo: '/projects/lemonad.jpg',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 2, low: 3, info: 3 },
    sloc: 1870,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Lemonad-Gaming-Security-Audit.pdf',
    description: 'Dice, Lotto, Battles, Racing',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  {
    name: 'iLemonati NFT',
    date: 'Jan 2026',
    client: 'Lemonad',
    logo: '/projects/lemonad.jpg',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 1, low: 3, info: 2 },
    sloc: 350,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/iLemonati-Security-Audit.pdf',
    description: 'NFT minting with phases',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  // MonadFactory (Monad)
  {
    name: 'MonadFactory',
    date: 'Jan 2026',
    client: 'MonadFactory',
    logo: '/projects/monadfactory.png',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 1, high: 2, medium: 3, low: 4, info: 2 },
    sloc: 1500,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/MonadFactory-Security-Audit.pdf',
    description: 'Token & Farm Factory',
    socials: { twitter: 'https://x.com/MonadLaunchgrid', discord: 'https://discord.gg/AhYKdnCr' },
  },
  {
    name: 'MonadGrid Marketplace',
    date: 'Jan 2026',
    client: 'MonadGrid',
    logo: '/projects/monadfactory.png',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 2, low: 4, info: 2 },
    sloc: 450,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/MonadGridMarketplace-Security-Audit.pdf',
    description: 'NFT Marketplace with offers & royalties',
    socials: { twitter: 'https://x.com/MonadLaunchgrid', discord: 'https://discord.gg/AhYKdnCr' },
  },
  // Global Internet Money (PulseChain)
  {
    name: 'Global Internet Money',
    date: 'Jan 2026',
    client: 'MoniesTree',
    chain: { name: 'PulseChain', logo: PulseChainLogo, color: '#00FF00' },
    findings: { critical: 1, high: 2, medium: 3, low: 3, info: 0 },
    sloc: 1140,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/GlobalInternetMoney-Security-Audit.pdf',
    description: 'Auction, vesting & staking protocol',
    socials: {},
  },
  // PulseFun (PulseChain)
  {
    name: 'PulseFun Betting',
    date: 'Jan 2026',
    client: 'PulseFun',
    logo: '/projects/pulsefun.png',
    chain: { name: 'PulseChain', logo: PulseChainLogo, color: '#00FF00' },
    findings: { critical: 0, high: 0, medium: 3, low: 3, info: 0 },
    sloc: 1320,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/PulseFun-Betting-Security-Audit.pdf',
    description: 'Prediction markets',
    socials: { twitter: 'https://x.com/nexionpulse', telegram: 'https://t.me/NexionPulse' },
  },
  {
    name: 'PulseFun NEON',
    date: 'Jan 2026',
    client: 'PulseFun',
    logo: '/projects/pulsefun.png',
    chain: { name: 'PulseChain', logo: PulseChainLogo, color: '#00FF00' },
    findings: { critical: 0, high: 1, medium: 2, low: 3, info: 0 },
    sloc: 1230,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/PulseFun-NEON-Security-Audit.pdf',
    description: 'Deflationary token ecosystem',
    socials: { twitter: 'https://x.com/nexionpulse', telegram: 'https://t.me/NexionPulse' },
  },
  // StackFi (Avalanche)
  {
    name: 'StackFi Avax',
    date: 'Jan 2026',
    client: 'StackFi',
    logo: '/projects/stackfi.png',
    chain: { name: 'Avalanche', logo: AvalancheLogo, color: '#E84142' },
    findings: { critical: 0, high: 1, medium: 3, low: 6, info: 5 },
    sloc: 3450,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/StackFi-Avax-Security-Audit.pdf',
    description: 'Gearbox V3 fork with Aave V3 adapters & position tracking',
    socials: { twitter: 'https://x.com/stackfibase', discord: 'https://discord.com/invite/WwdrKyyfnZ' },
  },
  // DTreon (BNB Chain)
  {
    name: 'DTreon Platform',
    date: 'Jan 2026',
    client: 'DTreon',
    logo: '/projects/dtreon.png',
    chain: { name: 'BNB Chain', logo: BNBChainLogo, color: '#F3BA2F' },
    findings: { critical: 0, high: 1, medium: 3, low: 3, info: 0 },
    sloc: 2160,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/DTreon-Security-Audit.pdf',
    description: 'Web3 creator platform',
    socials: { twitter: 'https://x.com/Dtreon_Official', discord: 'https://discord.gg/jUdwMWfEtJ' },
  },
  // Solana Ecosystem
  {
    name: 'Skinflip Staking',
    date: 'Jan 2026',
    client: 'Skinflip',
    chain: { name: 'Solana', logo: SolanaLogo, color: '#14F195' },
    findings: { critical: 0, high: 1, medium: 2, low: 3, info: 2 },
    sloc: 200,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Solana-Skinflip-Staking-Security-Audit.pdf',
    description: 'NFT staking prototype',
    socials: { twitter: 'https://github.com/rpajo/solana-staking' },
  },
  {
    name: 'Escrow Swap',
    date: 'Jan 2026',
    client: 'Solana Examples',
    chain: { name: 'Solana', logo: SolanaLogo, color: '#14F195' },
    findings: { critical: 0, high: 0, medium: 2, low: 3, info: 2 },
    sloc: 250,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Solana-Escrow-Swap-Security-Audit.pdf',
    description: 'Atomic token swaps',
    socials: { twitter: 'https://github.com/rustjesty/solana-escrow-smart-contract' },
  },
  {
    name: 'SOLotery',
    date: 'Jan 2026',
    client: 'SOLotery',
    chain: { name: 'Solana', logo: SolanaLogo, color: '#14F195' },
    findings: { critical: 1, high: 1, medium: 2, low: 2, info: 2 },
    sloc: 220,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Solana-SOLotery-Security-Audit.pdf',
    description: 'Decentralized lottery',
    socials: { twitter: 'https://github.com/mateolafalce/SOLotery' },
  },
  {
    name: 'Token Swap AMM',
    date: 'Jan 2026',
    client: 'Solana Developers',
    chain: { name: 'Solana', logo: SolanaLogo, color: '#14F195' },
    findings: { critical: 0, high: 0, medium: 2, low: 3, info: 2 },
    sloc: 560,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Solana-Token-Swap-AMM-Security-Audit.pdf',
    description: 'Constant-product AMM',
    socials: { twitter: 'https://github.com/solana-developers/program-examples' },
  },
  {
    name: 'NFT Raffle',
    date: 'Jan 2026',
    client: 'Riff Raffle',
    chain: { name: 'Solana', logo: SolanaLogo, color: '#14F195' },
    findings: { critical: 1, high: 1, medium: 2, low: 2, info: 2 },
    sloc: 600,
    pdfUrl: 'https://github.com/Lefgk/StoneWall/raw/main/audits/Solana-NFT-Raffle-Security-Audit.pdf',
    description: 'NFT raffle system',
    socials: { twitter: 'https://github.com/reecen96/Riff-Raffle-Solana-NFT' },
  },
]

// Get unique chains from audits
const CHAINS = [
  { name: 'All', logo: null, color: '#D4AF37' },
  ...Array.from(new Map(MANUAL_AUDITS.map(a => [a.chain.name, a.chain])).values())
]

export function Audits() {
  const [audits, setAudits] = useState(MANUAL_AUDITS)
  const [loading, setLoading] = useState(true)
  const [selectedAudit, setSelectedAudit] = useState(null)
  const [selectedChain, setSelectedChain] = useState('All')

  useEffect(() => {
    // Just use manual audits for now
    setLoading(false)
  }, [])

  // Filter audits by selected chain
  const filteredAudits = selectedChain === 'All'
    ? audits
    : audits.filter(a => a.chain.name === selectedChain)

  const getTotalFindings = (findings) => {
    if (!findings) return 0
    return (findings.critical || 0) + (findings.high || 0) + (findings.medium || 0) + (findings.low || 0) + (findings.info || 0)
  }

  return (
    <section id="audits" className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0A0A0B]" />
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="section-header thai-border pt-8">
          <p className="section-label">Our Work</p>
          <h2 className="section-title">
            Audit <span className="gradient-text">Portfolio</span>
          </h2>
          <p className="section-subtitle">
            Security reviews completed by Stonewall. Full reports available for download.
          </p>
        </div>

        {/* Chain Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 mb-8">
          {CHAINS.map((chain) => (
            <button
              key={chain.name}
              onClick={() => setSelectedChain(chain.name)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedChain === chain.name
                  ? 'bg-[rgba(212,175,55,0.2)] border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-[#9CA3AF] hover:text-white hover:border-[rgba(255,255,255,0.2)]'
              } border`}
              style={selectedChain === chain.name && chain.name !== 'All' ? {
                backgroundColor: `${chain.color}15`,
                borderColor: `${chain.color}60`,
                color: chain.color
              } : {}}
            >
              {chain.logo && <chain.logo className="w-4 h-4" />}
              {chain.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedChain === chain.name
                  ? 'bg-[rgba(212,175,55,0.3)]'
                  : 'bg-[rgba(255,255,255,0.1)]'
              }`}
              style={selectedChain === chain.name && chain.name !== 'All' ? {
                backgroundColor: `${chain.color}30`
              } : {}}
              >
                {chain.name === 'All'
                  ? MANUAL_AUDITS.length
                  : MANUAL_AUDITS.filter(a => a.chain.name === chain.name).length}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="loading-spinner" />
          </div>
        )}

        {/* Audits Table */}
        {!loading && filteredAudits.length > 0 && (
          <div className="max-w-5xl mx-auto">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider border-b border-[rgba(212,175,55,0.1)]">
              <div className="col-span-4">Project</div>
              <div className="col-span-2">Chain</div>
              <div className="col-span-3">Findings</div>
              <div className="col-span-1 text-center">SLOC</div>
              <div className="col-span-2 text-right">Report</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[rgba(212,175,55,0.1)]">
              {filteredAudits.map((audit, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 hover:bg-[rgba(212,175,55,0.03)] transition-colors cursor-pointer items-center"
                  onClick={() => setSelectedAudit(audit)}
                >
                  {/* Project Info */}
                  <div className="col-span-1 md:col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{audit.name}</h3>
                        <p className="text-xs text-[#9CA3AF]">{audit.client} · {audit.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chain */}
                  <div className="col-span-1 md:col-span-2">
                    {audit.chain && (
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${audit.chain.color}15`,
                          border: `1px solid ${audit.chain.color}40`
                        }}
                      >
                        <audit.chain.logo className="w-3.5 h-3.5" />
                        <span style={{ color: audit.chain.color }}>{audit.chain.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Findings */}
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex flex-wrap gap-1">
                      {audit.findings?.critical > 0 && (
                        <span className="severity-critical text-xs px-2 py-0.5">{audit.findings.critical}C</span>
                      )}
                      {audit.findings?.high > 0 && (
                        <span className="severity-high text-xs px-2 py-0.5">{audit.findings.high}H</span>
                      )}
                      {audit.findings?.medium > 0 && (
                        <span className="severity-medium text-xs px-2 py-0.5">{audit.findings.medium}M</span>
                      )}
                      {audit.findings?.low > 0 && (
                        <span className="severity-low text-xs px-2 py-0.5">{audit.findings.low}L</span>
                      )}
                      {audit.findings?.info > 0 && (
                        <span className="severity-info text-xs px-2 py-0.5">{audit.findings.info}I</span>
                      )}
                      {getTotalFindings(audit.findings) === 0 && (
                        <span className="text-xs text-[#9CA3AF]">No issues</span>
                      )}
                    </div>
                  </div>

                  {/* SLOC */}
                  <div className="hidden md:block col-span-1 text-center">
                    <span className="text-sm text-[#9CA3AF]">{audit.sloc ? `${(audit.sloc / 1000).toFixed(1)}k` : '-'}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                    <a
                      href={audit.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#D4AF37] hover:text-[#F4C430] bg-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.15)] rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                    <a
                      href={audit.pdfUrl}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {selectedAudit && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedAudit(null)}
          >
            <div
              className="card w-full max-w-5xl max-h-[90vh] overflow-hidden border-[rgba(212,175,55,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-[rgba(212,175,55,0.15)]">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedAudit.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {selectedAudit.client && (
                      <span className="text-sm text-[#D4AF37]">{selectedAudit.client}</span>
                    )}
                    {selectedAudit.chain && (
                      <div
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${selectedAudit.chain.color}15`,
                          border: `1px solid ${selectedAudit.chain.color}40`
                        }}
                      >
                        <selectedAudit.chain.logo className="w-3.5 h-3.5" />
                        <span style={{ color: selectedAudit.chain.color }}>{selectedAudit.chain.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={selectedAudit.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Open in New Tab
                  </a>
                  <button
                    onClick={() => setSelectedAudit(null)}
                    className="text-[#9CA3AF] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Embed */}
              <div className="h-[70vh] bg-[rgba(212,175,55,0.02)]">
                <iframe
                  src={`${selectedAudit.pdfUrl}#view=FitH`}
                  className="w-full h-full"
                  title={selectedAudit.name}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

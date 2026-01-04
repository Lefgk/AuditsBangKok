'use client'

import { useState, useEffect } from 'react'
import { FileText, ExternalLink, Download, Calendar, X } from 'lucide-react'
import { StonewallLogo } from './StonewallLogo'
import { MonadLogo, PulseChainLogo, AvalancheLogo, BNBChainLogo } from './ChainLogos'

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
    name: 'Lemonad Core Security Review',
    date: 'January 2026',
    client: 'Lemonad',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 2, low: 2, info: 1 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/Lemonad-Core-Security-Audit.md',
    description: 'Token, yield farming (LemonChef), YieldBoostVault, and treasury management.',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  {
    name: 'Lemonad DEX Security Review',
    date: 'January 2026',
    client: 'Lemonad',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 1, low: 2, info: 2 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/Lemonad-DEX-Security-Audit.md',
    description: 'Uniswap V2 fork: Factory, Router, Pair, FeeCollector, and WMON contracts.',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  {
    name: 'Lemonad Gaming Suite Security Review',
    date: 'January 2026',
    client: 'Lemonad',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 2, low: 3, info: 3 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/Lemonad-Gaming-Security-Audit.md',
    description: 'On-chain gaming: Dice, Lotto, Battles, Racing, Predictions with Pyth VRF.',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  {
    name: 'iLemonati NFT Security Review',
    date: 'January 2026',
    client: 'Lemonad',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 0, high: 0, medium: 1, low: 3, info: 2 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/iLemonati-Security-Audit.md',
    description: 'NFT minting contract with OG/WL/public phases and tiered pricing.',
    socials: { twitter: 'https://x.com/LeMONAD_Factory', telegram: 'https://t.me/LeMONAD_Factory' },
  },
  // MonadFactory (Monad)
  {
    name: 'MonadFactory Protocol Security Review',
    date: 'January 2026',
    client: 'MonadFactory',
    chain: { name: 'Monad', logo: MonadLogo, color: '#836EF9' },
    findings: { critical: 1, high: 2, medium: 3, low: 4, info: 2 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/MonadFactory-Security-Audit.md',
    description: 'Token factory, farm factory, vesting, and vault contracts with critical findings.',
    socials: { twitter: 'https://x.com/MonadLaunchgrid', discord: 'https://discord.gg/AhYKdnCr' },
  },
  // PulseFun (PulseChain)
  {
    name: 'PulseFun Betting Security Review',
    date: 'January 2026',
    client: 'PulseFun',
    chain: { name: 'PulseChain', logo: PulseChainLogo, color: '#00FF00' },
    findings: { critical: 0, high: 0, medium: 3, low: 3, info: 0 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/PulseFun-Betting-Security-Audit.md',
    description: 'Prediction markets with price bets, custom bets, and PoolV3 yield integration.',
    socials: { twitter: 'https://x.com/nexionpulse', telegram: 'https://t.me/NexionPulse' },
  },
  {
    name: 'PulseFun NEON Security Review',
    date: 'January 2026',
    client: 'PulseFun',
    chain: { name: 'PulseChain', logo: PulseChainLogo, color: '#00FF00' },
    findings: { critical: 0, high: 1, medium: 2, low: 3, info: 0 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/PulseFun-NEON-Security-Audit.md',
    description: 'Deflationary NEON token with staking, auctions, vault, and buy-n-burn.',
    socials: { twitter: 'https://x.com/nexionpulse', telegram: 'https://t.me/NexionPulse' },
  },
  // StackFi (Avalanche)
  {
    name: 'StackFi Avax Security Review',
    date: 'January 2026',
    client: 'StackFi',
    chain: { name: 'Avalanche', logo: AvalancheLogo, color: '#E84142' },
    findings: { critical: 0, high: 0, medium: 0, low: 1, info: 2 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/StackFi-Avax-Security-Audit.md',
    description: 'Gearbox Protocol V3 fork for leveraged yield farming on Avalanche.',
    socials: { twitter: 'https://x.com/stackfibase', discord: 'https://discord.com/invite/WwdrKyyfnZ' },
  },
  // DTreon (BNB Chain)
  {
    name: 'DTreon Platform Security Review',
    date: 'January 2026',
    client: 'DTreon',
    chain: { name: 'BNB Chain', logo: BNBChainLogo, color: '#F3BA2F' },
    findings: { critical: 0, high: 1, medium: 3, low: 3, info: 0 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/StoneWall/main/audits/DTreon-Security-Audit.md',
    description: 'Web3 Patreon: subscriptions, PPV content, DMs, tips, and profit-sharing staking.',
    socials: { twitter: 'https://x.com/Dtreon_Official', discord: 'https://discord.gg/jUdwMWfEtJ' },
  },
]

export function Audits() {
  const [audits, setAudits] = useState(MANUAL_AUDITS)
  const [loading, setLoading] = useState(true)
  const [selectedAudit, setSelectedAudit] = useState(null)

  useEffect(() => {
    fetchAuditsFromGitHub()
  }, [])

  async function fetchAuditsFromGitHub() {
    try {
      const { owner, repo, branch, auditsPath } = GITHUB_CONFIG
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${auditsPath}?ref=${branch}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        setLoading(false)
        return
      }

      const files = await response.json()

      if (!Array.isArray(files)) {
        setLoading(false)
        return
      }

      const pdfAudits = files
        .filter(file => file.name.endsWith('.pdf'))
        .map(file => ({
          name: formatAuditName(file.name),
          fileName: file.name,
          pdfUrl: file.download_url,
          htmlUrl: file.html_url,
          size: formatFileSize(file.size),
        }))

      setAudits([...MANUAL_AUDITS, ...pdfAudits])
    } catch (error) {
      console.error('Error fetching audits:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatAuditName(fileName) {
    return fileName
      .replace('.pdf', '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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
            Public <span className="gradient-text">Audits</span>
          </h2>
          <p className="section-subtitle">
            Browse our completed security reviews. Full reports in Pashov format available for download.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="loading-spinner" />
          </div>
        )}

        {/* Empty State */}
        {!loading && audits.length === 0 && (
          <div className="card p-12 text-center max-w-2xl mx-auto">
            <StonewallLogo className="w-20 h-20 mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-3">Audits Coming Soon</h3>
            <p className="text-[#9CA3AF] mb-8">
              Our security reviews will be published here. Add PDF files to the{' '}
              <code className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded">audits/</code>{' '}
              folder in your GitHub repository.
            </p>
            <div className="bg-[#0A0A0A] rounded-lg p-4 text-left font-mono text-sm border border-[rgba(212,175,55,0.15)]">
              <div className="text-[#9CA3AF] mb-2">$ Add your first audit:</div>
              <code className="text-[#D4AF37]">
                mkdir audits<br />
                cp your-audit.pdf audits/<br />
                git add . && git commit -m "Add audit"<br />
                git push
              </code>
            </div>
          </div>
        )}

        {/* Audits Grid */}
        {!loading && audits.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {audits.map((audit, index) => (
              <div
                key={index}
                className="audit-card p-6 cursor-pointer gold-shimmer"
                onClick={() => setSelectedAudit(audit)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="feature-icon">
                    <FileText className="w-6 h-6" />
                  </div>
                  {audit.size && (
                    <span className="text-xs text-[#9CA3AF] bg-white/5 px-3 py-1 rounded-full">
                      {audit.size}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {audit.name}
                </h3>

                {/* Chain Badge */}
                {audit.chain && (
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${audit.chain.color}15`,
                        border: `1px solid ${audit.chain.color}40`
                      }}
                    >
                      <audit.chain.logo className="w-4 h-4" />
                      <span style={{ color: audit.chain.color }}>{audit.chain.name}</span>
                    </div>
                  </div>
                )}

                {/* Client & Date */}
                {(audit.client || audit.date) && (
                  <div className="flex items-center gap-4 text-sm text-[#9CA3AF] mb-4">
                    {audit.client && <span className="text-[#D4AF37]">{audit.client}</span>}
                    {audit.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {audit.date}
                      </span>
                    )}
                  </div>
                )}

                {/* Findings Summary */}
                {audit.findings && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {audit.findings.critical > 0 && (
                      <span className="severity-critical">{audit.findings.critical} Critical</span>
                    )}
                    {audit.findings.high > 0 && (
                      <span className="severity-high">{audit.findings.high} High</span>
                    )}
                    {audit.findings.medium > 0 && (
                      <span className="severity-medium">{audit.findings.medium} Medium</span>
                    )}
                    {audit.findings.low > 0 && (
                      <span className="severity-low">{audit.findings.low} Low</span>
                    )}
                    {audit.findings.info > 0 && (
                      <span className="severity-info">{audit.findings.info} Info</span>
                    )}
                  </div>
                )}

                {/* Description */}
                {audit.description && (
                  <p className="text-[#9CA3AF] text-sm mb-4 line-clamp-2">
                    {audit.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-4 mt-auto pt-4 border-t border-[rgba(212,175,55,0.1)]">
                  <a
                    href={audit.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#F4C430] transition-colors font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                  <a
                    href={audit.pdfUrl}
                    download
                    className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            ))}
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

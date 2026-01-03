'use client'

import { useState, useEffect } from 'react'
import { FileText, ExternalLink, Download, Calendar, Shield, X } from 'lucide-react'

// Configure your GitHub repo here
const GITHUB_CONFIG = {
  owner: 'Lefgk',
  repo: 'AuditsBangKok',
  branch: 'main',
  auditsPath: 'audits',
}

// Manually add audits with metadata here
const MANUAL_AUDITS = [
  {
    name: 'Lemonad Protocol Security Audit',
    date: 'January 2026',
    client: 'Lemonad',
    findings: { critical: 0, high: 1, medium: 4, low: 5, info: 3 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/AuditsBangKok/main/audits/Lemonad-Security-Audit.md',
    description: 'Comprehensive audit of DEX, gaming contracts, yield farming, and treasury management.',
  },
  {
    name: 'MonadFactory Protocol Security Audit',
    date: 'January 2026',
    client: 'MonadFactory',
    findings: { critical: 1, high: 2, medium: 3, low: 4, info: 2 },
    pdfUrl: 'https://raw.githubusercontent.com/Lefgk/AuditsBangKok/main/audits/MonadFactory-Security-Audit.md',
    description: 'Security audit of token factory, farm factory, vesting, and vault contracts.',
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
      <div className="absolute inset-0 bg-[#0E0E0E]" />
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="section-header">
          <p className="section-label">Our Work</p>
          <h2 className="section-title">
            Public <span className="gradient-text">Audits</span>
          </h2>
          <p className="section-subtitle">
            Browse our completed security audits. Full reports available for download.
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
            <Shield className="w-16 h-16 text-[#B6509E] mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-3">Audits Coming Soon</h3>
            <p className="text-[#A1A1AA] mb-8">
              Our audit reports will be published here. Add PDF files to the{' '}
              <code className="text-[#B6509E] bg-[#B6509E]/10 px-2 py-1 rounded">audits/</code>{' '}
              folder in your GitHub repository.
            </p>
            <div className="bg-[#0A0A0A] rounded-lg p-4 text-left font-mono text-sm">
              <div className="text-[#A1A1AA] mb-2">$ Add your first audit:</div>
              <code className="text-[#2EBAC6]">
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
                className="audit-card p-6 cursor-pointer"
                onClick={() => setSelectedAudit(audit)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="feature-icon">
                    <FileText className="w-6 h-6" />
                  </div>
                  {audit.size && (
                    <span className="text-xs text-[#A1A1AA] bg-white/5 px-3 py-1 rounded-full">
                      {audit.size}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {audit.name}
                </h3>

                {/* Client & Date */}
                {(audit.client || audit.date) && (
                  <div className="flex items-center gap-4 text-sm text-[#A1A1AA] mb-4">
                    {audit.client && <span>{audit.client}</span>}
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
                  <p className="text-[#A1A1AA] text-sm mb-4 line-clamp-2">
                    {audit.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-4 mt-auto pt-4 border-t border-white/5">
                  <a
                    href={audit.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#B6509E] hover:text-[#B6509E]/80 transition-colors font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                  <a
                    href={audit.pdfUrl}
                    download
                    className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors font-medium"
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
              className="card w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedAudit.name}</h3>
                  {selectedAudit.client && (
                    <p className="text-sm text-[#A1A1AA]">{selectedAudit.client}</p>
                  )}
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
                    className="text-[#A1A1AA] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Embed */}
              <div className="h-[70vh] bg-white/5">
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

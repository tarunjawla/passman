'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  ComputerDesktopIcon,
  CommandLineIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { FaLinux, FaApple, FaWindows } from 'react-icons/fa'
import { getAllPlatformInfo, PlatformInfo } from '@/lib/github'

interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  downloadUrl: string;
  size: string;
  version: string;
  downloadCount?: number;
  checksumUrl?: string;
}

const steps = [
  { id: 'download', title: 'Download', description: 'Get the installer for your platform' },
  { id: 'verify', title: 'Verify', description: 'Check the file integrity' },
  { id: 'install', title: 'Install', description: 'Run the installer' },
  { id: 'configure', title: 'Configure', description: 'Set up your master password' },
  { id: 'run', title: 'Run', description: 'Start using PassMan' },
]

// Default platform icons and colors
const platformConfig = {
  linux: { icon: FaLinux, color: 'text-primary' },
  macos: { icon: FaApple, color: 'text-secondary' },
  windows: { icon: FaWindows, color: 'text-primary' },
  cli: { icon: CommandLineIcon, color: 'text-secondary' }
}

export default function Download() {
  const [activeTab, setActiveTab] = useState('linux')
  const [activeStep, setActiveStep] = useState('download')
  const [copied, setCopied] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [allPlatforms, setAllPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checksums, setChecksums] = useState<Record<string, string>>({})
  const [linuxPackageType, setLinuxPackageType] = useState<'deb' | 'appimage'>('deb')

  // Load platform data from GitHub
  useEffect(() => {
    const loadPlatformData = async () => {
      try {
        setLoading(true)
        const platformData = await getAllPlatformInfo()
        
        // Use fallback platforms as base and only override with GitHub data if available
        const fallbackPlatforms: Platform[] = [
          {
            id: 'linux',
            name: 'Linux',
            icon: FaLinux,
            color: 'text-primary',
            downloadUrl: '/downloads/PassMan_1.0.0_amd64.deb',
            size: '3.4 MB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/PassMan_1.0.0_amd64.deb.sha256'
          },
          {
            id: 'linux-appimage',
            name: 'Linux (AppImage)',
            icon: FaLinux,
            color: 'text-primary',
            downloadUrl: '/downloads/PassMan_1.0.0_amd64.AppImage',
            size: '77 MB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/PassMan_1.0.0_amd64.AppImage.sha256'
          },
          {
            id: 'macos',
            name: 'macOS',
            icon: FaApple,
            color: 'text-secondary',
            downloadUrl: '/downloads/PassMan_1.0.0_aarch64.dmg',
            size: '3.9 MB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/PassMan_1.0.0_aarch64.dmg.sha256'
          },
          {
            id: 'windows',
            name: 'Windows',
            icon: FaWindows,
            color: 'text-primary',
            downloadUrl: '#',
            size: 'Coming Soon',
            version: 'v1.0.0',
          },
          {
            id: 'cli',
            name: 'CLI Only',
            icon: CommandLineIcon,
            color: 'text-secondary',
            downloadUrl: '/downloads/passman-cli-linux-x86_64.tar.gz',
            size: '730 KB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/passman-cli-linux-x86_64.tar.gz.sha256'
          },
        ]
        
        // Merge GitHub data with fallback data
        const platformsList: Platform[] = fallbackPlatforms.map(fallback => {
          const githubData = platformData[fallback.id]
          if (githubData && githubData.downloadUrl !== '#') {
            return {
              ...fallback,
              downloadUrl: githubData.downloadUrl,
              size: githubData.size,
              version: githubData.version,
              downloadCount: githubData.downloadCount,
              checksumUrl: githubData.checksumUrl
            }
          }
          return fallback
        })
        
        // Store all platforms including linux-appimage for internal use
        setAllPlatforms(platformsList)
        
        // Filter to show only main platforms in tabs (exclude linux-appimage from tabs)
        const mainPlatforms = platformsList.filter(p => p.id !== 'linux-appimage')
        setPlatforms(mainPlatforms)
        
        // Load checksums
        const checksumPromises = platformsList
          .filter(p => p.checksumUrl && p.checksumUrl !== '#')
          .map(async (platform) => {
            try {
              const response = await fetch(platform.checksumUrl!)
              if (response.ok) {
                const checksum = await response.text()
                return { platform: platform.id, checksum: checksum.trim() }
              }
            } catch (err) {
              console.warn(`Failed to load checksum for ${platform.id}:`, err)
            }
            return null
          })
        
        const checksumResults = await Promise.all(checksumPromises)
        const checksumMap: Record<string, string> = {}
        checksumResults.forEach(result => {
          if (result) {
            checksumMap[result.platform] = result.checksum
          }
        })
        setChecksums(checksumMap)
        
      } catch (err) {
        console.error('Failed to load platform data:', err)
        setError('Failed to load download information. Please try again later.')
        
        // Use the same fallback platforms as base
        const fallbackPlatforms: Platform[] = [
          {
            id: 'linux',
            name: 'Linux',
            icon: FaLinux,
            color: 'text-primary',
            downloadUrl: '/downloads/PassMan_1.0.0_amd64.deb',
            size: '3.4 MB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/PassMan_1.0.0_amd64.deb.sha256'
          },
          {
            id: 'linux-appimage',
            name: 'Linux (AppImage)',
            icon: FaLinux,
            color: 'text-primary',
            downloadUrl: '/downloads/PassMan_1.0.0_amd64.AppImage',
            size: '77 MB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/PassMan_1.0.0_amd64.AppImage.sha256'
          },
          {
            id: 'macos',
            name: 'macOS',
            icon: FaApple,
            color: 'text-secondary',
            downloadUrl: '/downloads/PassMan_1.0.0_aarch64.dmg',
            size: '3.9 MB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/PassMan_1.0.0_aarch64.dmg.sha256'
          },
          {
            id: 'windows',
            name: 'Windows',
            icon: FaWindows,
            color: 'text-primary',
            downloadUrl: '#',
            size: 'Coming Soon',
            version: 'v1.0.0',
          },
          {
            id: 'cli',
            name: 'CLI Only',
            icon: CommandLineIcon,
            color: 'text-secondary',
            downloadUrl: '/downloads/passman-cli-linux-x86_64.tar.gz',
            size: '730 KB',
            version: 'v1.0.0',
            checksumUrl: '/downloads/passman-cli-linux-x86_64.tar.gz.sha256'
          },
        ]
        setAllPlatforms(fallbackPlatforms)
        const mainPlatforms = fallbackPlatforms.filter(p => p.id !== 'linux-appimage')
        setPlatforms(mainPlatforms)
      } finally {
        setLoading(false)
      }
    }

    loadPlatformData()
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const activePlatform = platforms.find(p => p.id === activeTab)
  
  // Get the current Linux platform based on toggle
  const getCurrentLinuxPlatform = () => {
    if (activeTab === 'linux' && activePlatform) {
      const linuxAppImagePlatform = allPlatforms.find(p => p.id === 'linux-appimage')
      return linuxPackageType === 'deb' 
        ? activePlatform
        : linuxAppImagePlatform || activePlatform
    }
    return activePlatform
  }
  
  const currentPlatform = getCurrentLinuxPlatform()
  
  // Don't render if platform data isn't loaded yet
  if (!currentPlatform) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading platform information...</p>
        </div>
      </div>
    )
  }

  const getInstallCommands = (platform: string) => {
    // For Linux, use the toggle to determine which platform data to use
    let activePlatformData
    if (platform === 'linux') {
      activePlatformData = linuxPackageType === 'deb' 
        ? allPlatforms.find(p => p.id === 'linux')
        : allPlatforms.find(p => p.id === 'linux-appimage')
    } else {
      activePlatformData = allPlatforms.find(p => p.id === platform)
    }
    
    const downloadUrl = activePlatformData?.downloadUrl || '#'
    const checksumUrl = activePlatformData?.checksumUrl || '#'
    
    // Get the base URL for absolute downloads
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
    const absoluteDownloadUrl = downloadUrl.startsWith('/') ? `${baseUrl}${downloadUrl}` : downloadUrl
    const absoluteChecksumUrl = checksumUrl.startsWith('/') ? `${baseUrl}${checksumUrl}` : checksumUrl
    
    switch (platform) {
      case 'linux':
        if (linuxPackageType === 'deb') {
          return {
            download: `wget ${absoluteDownloadUrl}`,
            verify: `sha256sum ${downloadUrl.split('/').pop()}`,
            install: 'sudo dpkg -i PassMan_1.0.0_amd64.deb && sudo apt-get install -f',
            configure: 'passman init',
            run: 'passman --help'
          }
        } else {
          return {
            download: `wget ${absoluteDownloadUrl}`,
            verify: `sha256sum ${downloadUrl.split('/').pop()}`,
            install: 'chmod +x PassMan_1.0.0_amd64.AppImage',
            configure: './PassMan_1.0.0_amd64.AppImage',
            run: './PassMan_1.0.0_amd64.AppImage'
          }
        }
      case 'macos':
        const dmgFileName = downloadUrl.split('/').pop() || 'PassMan_1.0.0_aarch64.dmg'
        return {
          download: `curl -LO ${absoluteDownloadUrl}`,
          verify: `shasum -a 256 ${dmgFileName}`,
          install: `open ${dmgFileName} && echo "Drag PassMan.app to Applications folder"`,
          configure: 'Open PassMan from Applications and set up your master password',
          run: 'Open PassMan from Applications or Launchpad'
        }
      case 'windows':
        return {
          download: `Invoke-WebRequest -Uri "${absoluteDownloadUrl}" -OutFile "${downloadUrl.split('/').pop()}"`,
          verify: `Get-FileHash ${downloadUrl.split('/').pop()} -Algorithm SHA256`,
          install: `.\\${downloadUrl.split('/').pop()}`,
          configure: 'passman init',
          run: 'passman --help'
        }
      case 'cli':
        return {
          download: `wget ${absoluteDownloadUrl}`,
          verify: `sha256sum ${downloadUrl.split('/').pop()}`,
          install: 'tar -xzf passman-cli-linux-x86_64.tar.gz && sudo mv passman /usr/local/bin/',
          configure: 'passman init',
          run: 'passman --help'
        }
      default:
        return {}
    }
  }

  const commands = getInstallCommands(activeTab)

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading download information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-orbitron text-4xl md:text-5xl font-bold mb-6"
          >
            Download{' '}
            <span className="text-primary">PassMan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted text-lg max-w-2xl mx-auto"
          >
            Choose your platform and get started with secure password management in minutes.
          </motion.p>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}
        </div>
      </section>

      {/* Platform Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="glass-surface rounded-2xl p-2">
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <motion.button
                    key={platform.id}
                    onClick={() => setActiveTab(platform.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === platform.id
                        ? 'bg-primary text-background'
                        : 'text-muted hover:text-white hover:bg-surface/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <platform.icon className="h-5 w-5" />
                    <span>{platform.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Steps Menu */}
            <div className="lg:col-span-1">
              <div className="glass-surface rounded-xl p-6 sticky top-24">
                <h3 className="font-orbitron text-lg font-bold mb-4 text-primary">
                  Installation Steps
                </h3>
                <nav className="space-y-2">
                  {steps.map((step, index) => (
                    <motion.button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                        activeStep === step.id
                          ? 'bg-primary/20 border-l-4 border-primary text-primary'
                          : 'text-muted hover:text-white hover:bg-surface/50'
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          activeStep === step.id
                            ? 'bg-primary text-background'
                            : 'bg-surface text-muted'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-semibold">{step.title}</div>
                          <div className="text-xs opacity-75">{step.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${activeStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-surface rounded-xl p-8"
                >
                  {/* Platform Info */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-surface/50 ${currentPlatform.color}`}>
                        <currentPlatform.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="font-orbitron text-2xl font-bold">
                          {currentPlatform.name}
                        </h2>
                        <p className="text-muted">
                          Version {currentPlatform.version} • {currentPlatform.size}
                          {currentPlatform.downloadCount && (
                            <span> • {currentPlatform.downloadCount.toLocaleString()} downloads</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        if (currentPlatform.downloadUrl && currentPlatform.downloadUrl !== '#') {
                          const baseUrl = window.location.origin
                          const absoluteUrl = currentPlatform.downloadUrl.startsWith('/') 
                            ? `${baseUrl}${currentPlatform.downloadUrl}` 
                            : currentPlatform.downloadUrl
                          
                          const link = document.createElement('a')
                          link.href = absoluteUrl
                          link.download = currentPlatform.downloadUrl.split('/').pop() || 'passman'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }
                      }}
                      disabled={!currentPlatform.downloadUrl || currentPlatform.downloadUrl === '#'}
                      className={`btn-primary ${(!currentPlatform.downloadUrl || currentPlatform.downloadUrl === '#') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Download
                    </motion.button>
                  </div>

                  {/* Linux Package Type Toggle */}
                  {activeTab === 'linux' && (
                    <div className="mb-6">
                      <div className="glass-surface rounded-xl p-4">
                        <h3 className="font-semibold text-primary mb-3">Package Type</h3>
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => setLinuxPackageType('deb')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              linuxPackageType === 'deb'
                                ? 'bg-primary text-background'
                                : 'bg-surface/50 text-muted hover:text-white'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            DEB Package
                          </motion.button>
                          <motion.button
                            onClick={() => setLinuxPackageType('appimage')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              linuxPackageType === 'appimage'
                                ? 'bg-primary text-background'
                                : 'bg-surface/50 text-muted hover:text-white'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            AppImage
                          </motion.button>
                        </div>
                        <p className="text-muted text-sm mt-2">
                          {linuxPackageType === 'deb' 
                            ? 'DEB package for Ubuntu, Debian, and other Debian-based distributions. Requires installation.'
                            : 'AppImage is a portable executable that runs on most Linux distributions without installation.'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step Content */}
                  <div className="space-y-6">
                    <h3 className="font-orbitron text-xl font-bold text-primary">
                      Step {steps.findIndex(s => s.id === activeStep) + 1}: {steps.find(s => s.id === activeStep)?.title}
                    </h3>

                    {commands[activeStep as keyof typeof commands] && (
                      <div className="space-y-4">
                        <div className="code-block relative group">
                          <code className="text-primary">{commands[activeStep as keyof typeof commands]}</code>
                          <motion.button
                            onClick={() => copyToClipboard(commands[activeStep as keyof typeof commands] as string, activeStep)}
                            className="absolute right-3 top-3 p-2 rounded-lg bg-surface/50 hover:bg-surface transition-colors duration-300 opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {copied === activeStep ? (
                              <CheckIcon className="h-4 w-4 text-primary" />
                            ) : (
                              <DocumentDuplicateIcon className="h-4 w-4 text-muted" />
                            )}
                          </motion.button>
                        </div>
                        {copied === activeStep && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-primary text-sm"
                          >
                            ✓ Copied to clipboard!
                          </motion.p>
                        )}
                      </div>
                    )}

                    {/* Step-specific content */}
                    {activeStep === 'download' && (
                      <div className="space-y-4">
                        <p className="text-muted">
                          Download the latest version of PassMan for {currentPlatform.name}.
                          {activeTab === 'linux' && linuxPackageType === 'deb' && (
                            <span className="block mt-2 text-sm">
                              <strong>DEB Package:</strong> Compatible with Ubuntu, Debian, and other Debian-based distributions. Requires installation.
                            </span>
                          )}
                          {activeTab === 'linux' && linuxPackageType === 'appimage' && (
                            <span className="block mt-2 text-sm">
                              <strong>AppImage:</strong> Portable executable that runs on most Linux distributions without installation.
                            </span>
                          )}
                          {activeTab === 'cli' && (
                            <span className="block mt-2 text-sm">
                              <strong>CLI Tool:</strong> Command-line interface for advanced users and automation.
                            </span>
                          )}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass-surface p-4 rounded-lg">
                            <h4 className="font-semibold text-primary mb-2">File Size</h4>
                            <p className="text-muted">{currentPlatform.size}</p>
                          </div>
                          <div className="glass-surface p-4 rounded-lg">
                            <h4 className="font-semibold text-primary mb-2">Version</h4>
                            <p className="text-muted">{currentPlatform.version}</p>
                          </div>
                        </div>
                        {(activeTab === 'linux' || activeTab === 'cli') && (
                          <div className="glass-surface p-4 rounded-lg">
                            <h4 className="font-semibold text-primary mb-2">System Requirements</h4>
                            <ul className="text-muted text-sm space-y-1">
                              <li>• Ubuntu 18.04+ / Debian 10+ / Fedora / Arch Linux</li>
                              <li>• x86_64 architecture</li>
                              <li>• GTK 3.0+ and WebKit2GTK</li>
                              {activeTab === 'linux' && linuxPackageType === 'appimage' && (
                                <li>• FUSE (for AppImage execution)</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeStep === 'verify' && (
                      <div className="space-y-4">
                        <p className="text-muted">
                          Verify the integrity of the downloaded file using the checksum.
                        </p>
                        <div className="glass-surface p-4 rounded-lg">
                          <h4 className="font-semibold text-primary mb-2">Expected SHA256</h4>
                          {checksums[activeTab] ? (
                            <code className="text-xs text-muted break-all">
                              {checksums[activeTab]}
                            </code>
                          ) : (
                            <p className="text-muted text-sm">
                              Checksum not available. Please verify manually from the GitHub release page.
                            </p>
                          )}
                        </div>
                        <div className="glass-surface p-4 rounded-lg">
                          <h4 className="font-semibold text-primary mb-2">How to verify</h4>
                          <div className="text-muted text-sm space-y-2">
                            <p><strong>Linux/macOS:</strong> <code>sha256sum filename</code></p>
                            <p><strong>Windows:</strong> <code>Get-FileHash filename -Algorithm SHA256</code></p>
                            <p>The output should match the expected checksum above.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 'configure' && (
                      <div className="space-y-4">
                        <p className="text-muted">
                          Set up your master password to encrypt your vault. Choose a strong, memorable password.
                        </p>
                        <div className="glass-surface p-4 rounded-lg">
                          <h4 className="font-semibold text-primary mb-2">Security Tips</h4>
                          <ul className="text-muted space-y-1 text-sm">
                            <li>• Use at least 12 characters</li>
                            <li>• Include uppercase, lowercase, numbers, and symbols</li>
                            <li>• Don&apos;t reuse passwords from other accounts</li>
                            <li>• Consider using a passphrase</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                    <motion.button
                      onClick={() => {
                        const currentIndex = steps.findIndex(s => s.id === activeStep)
                        if (currentIndex > 0) {
                          setActiveStep(steps[currentIndex - 1].id)
                        }
                      }}
                      disabled={steps.findIndex(s => s.id === activeStep) === 0}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: steps.findIndex(s => s.id === activeStep) === 0 ? 1 : 1.05 }}
                    >
                      Previous
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const currentIndex = steps.findIndex(s => s.id === activeStep)
                        if (currentIndex < steps.length - 1) {
                          setActiveStep(steps[currentIndex + 1].id)
                        }
                      }}
                      disabled={steps.findIndex(s => s.id === activeStep) === steps.length - 1}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: steps.findIndex(s => s.id === activeStep) === steps.length - 1 ? 1 : 1.05 }}
                    >
                      Next
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

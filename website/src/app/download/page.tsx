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

const platforms = [
  {
    id: 'linux',
    name: 'Linux',
    icon: FaLinux,
    color: 'text-primary',
    downloadUrl: '#',
    size: '12.5 MB',
    version: 'v1.0.0',
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: FaApple,
    color: 'text-secondary',
    downloadUrl: '#',
    size: '15.2 MB',
    version: 'v1.0.0',
  },
  {
    id: 'windows',
    name: 'Windows',
    icon: FaWindows,
    color: 'text-primary',
    downloadUrl: '#',
    size: '18.7 MB',
    version: 'v1.0.0',
  },
  {
    id: 'cli',
    name: 'CLI Only',
    icon: CommandLineIcon,
    color: 'text-secondary',
    downloadUrl: '#',
    size: '8.3 MB',
    version: 'v1.0.0',
  },
]

const steps = [
  { id: 'download', title: 'Download', description: 'Get the installer for your platform' },
  { id: 'verify', title: 'Verify', description: 'Check the file integrity' },
  { id: 'install', title: 'Install', description: 'Run the installer' },
  { id: 'configure', title: 'Configure', description: 'Set up your master password' },
  { id: 'run', title: 'Run', description: 'Start using PassMan' },
]

export default function Download() {
  const [activeTab, setActiveTab] = useState('linux')
  const [activeStep, setActiveStep] = useState('download')
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const activePlatform = platforms.find(p => p.id === activeTab)!

  const getInstallCommands = (platform: string) => {
    switch (platform) {
      case 'linux':
        return {
          download: 'wget https://github.com/tarunjawla/passman/releases/latest/download/passman-linux.tar.gz',
          verify: 'sha256sum passman-linux.tar.gz',
          install: 'tar -xzf passman-linux.tar.gz && sudo mv passman /usr/local/bin/',
          configure: 'passman init',
          run: 'passman --help'
        }
      case 'macos':
        return {
          download: 'curl -LO https://github.com/tarunjawla/passman/releases/latest/download/passman-macos.dmg',
          verify: 'shasum -a 256 passman-macos.dmg',
          install: 'open passman-macos.dmg',
          configure: 'passman init',
          run: 'passman --help'
        }
      case 'windows':
        return {
          download: 'Invoke-WebRequest -Uri "https://github.com/tarunjawla/passman/releases/latest/download/passman-windows.exe" -OutFile "passman-windows.exe"',
          verify: 'Get-FileHash passman-windows.exe -Algorithm SHA256',
          install: '.\\passman-windows.exe',
          configure: 'passman init',
          run: 'passman --help'
        }
      case 'cli':
        return {
          download: 'cargo install passman',
          verify: 'passman --version',
          install: 'Already installed via cargo',
          configure: 'passman init',
          run: 'passman --help'
        }
      default:
        return {}
    }
  }

  const commands = getInstallCommands(activeTab)

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
                      <div className={`p-3 rounded-xl bg-surface/50 ${activePlatform.color}`}>
                        <activePlatform.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="font-orbitron text-2xl font-bold">
                          {activePlatform.name}
                        </h2>
                        <p className="text-muted">
                          Version {activePlatform.version} • {activePlatform.size}
                        </p>
                      </div>
                    </div>
                    <motion.a
                      href={activePlatform.downloadUrl}
                      className="btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Download
                    </motion.a>
                  </div>

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
                          Download the latest version of PassMan for {activePlatform.name}.
                          The download will start automatically when you click the download button above.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass-surface p-4 rounded-lg">
                            <h4 className="font-semibold text-primary mb-2">File Size</h4>
                            <p className="text-muted">{activePlatform.size}</p>
                          </div>
                          <div className="glass-surface p-4 rounded-lg">
                            <h4 className="font-semibold text-primary mb-2">Version</h4>
                            <p className="text-muted">{activePlatform.version}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 'verify' && (
                      <div className="space-y-4">
                        <p className="text-muted">
                          Verify the integrity of the downloaded file using the checksum.
                        </p>
                        <div className="glass-surface p-4 rounded-lg">
                          <h4 className="font-semibold text-primary mb-2">Expected SHA256</h4>
                          <code className="text-xs text-muted break-all">
                            a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
                          </code>
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
                            <li>• Don't reuse passwords from other accounts</li>
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

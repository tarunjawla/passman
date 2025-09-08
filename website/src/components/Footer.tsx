'use client'

import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaGlobe, FaInstagram } from 'react-icons/fa'
import { HiShieldCheck } from 'react-icons/hi2'

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/tarunjawla/passman',
    icon: FaGithub,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/tarunjawla/',
    icon: FaLinkedin,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/tarun_jawla/',
    icon: FaInstagram,
  },
  {
    name: 'Website',
    href: 'http://tarunjawla.com/',
    icon: FaGlobe,
  },
]

export default function Footer() {
  return (
    <footer className="bg-surface/50 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and description */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <HiShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-orbitron text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PassMan
              </span>
            </div>
            <span className="text-muted text-sm">
              Secure local password management
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center space-x-6">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-primary transition-colors duration-300"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={link.name}
              >
                <link.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} PassMan. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  )
}

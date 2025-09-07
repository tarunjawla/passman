'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  ShieldCheckIcon,
  HeartIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CodeBracketIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { FaRust, FaReact, FaGithub } from 'react-icons/fa'
import { SiTauri, SiNextdotjs, SiTailwindcss, SiFramer } from 'react-icons/si'

const values = [
  {
    name: 'Privacy First',
    description: 'Your data never leaves your device. No telemetry, no tracking, complete privacy.',
    icon: LockClosedIcon,
    color: 'text-primary',
  },
  {
    name: 'Open Source',
    description: 'Transparent, auditable code. Community-driven development and security.',
    icon: CodeBracketIcon,
    color: 'text-secondary',
  },
  {
    name: 'Security by Design',
    description: 'Built with security as the foundation, not an afterthought.',
    icon: ShieldCheckIcon,
    color: 'text-primary',
  },
  {
    name: 'User-Centric',
    description: 'Simple, intuitive design that puts user experience first.',
    icon: HeartIcon,
    color: 'text-secondary',
  },
]

const techStack = [
  {
    name: 'Rust',
    description: 'Memory-safe systems programming language',
    icon: FaRust,
    color: 'text-orange-500',
    category: 'Backend',
  },
  {
    name: 'Tauri',
    description: 'Build cross-platform desktop apps',
    icon: SiTauri,
    color: 'text-blue-400',
    category: 'Desktop',
  },
  {
    name: 'React',
    description: 'Modern UI library for interactive interfaces',
    icon: FaReact,
    color: 'text-blue-400',
    category: 'Frontend',
  },
  {
    name: 'Next.js',
    description: 'Full-stack React framework',
    icon: SiNextdotjs,
    color: 'text-white',
    category: 'Web',
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    icon: SiTailwindcss,
    color: 'text-cyan-400',
    category: 'Styling',
  },
  {
    name: 'Framer Motion',
    description: 'Production-ready motion library',
    icon: SiFramer,
    color: 'text-pink-400',
    category: 'Animation',
  },
]

const team = [
  {
    name: 'Tarun Jawla',
    role: 'Creator & Lead Developer',
    bio: 'Software Engineer passionate about security, privacy, and building tools that empower users.',
    avatar: 'https://placehold.co/150x150/4fe3c4/000000/png?text=TJ&font=roboto',
    social: {
      github: 'https://github.com/tarunjawla',
      linkedin: 'https://linkedin.com/in/tarunjawla',
      website: 'https://tarunjawla.dev',
    },
  },
]

const stats = [
  { label: 'Lines of Code', value: '10,000+' },
  { label: 'GitHub Stars', value: '500+' },
  { label: 'Contributors', value: '12+' },
  { label: 'Platforms Supported', value: '3' },
]

export default function About() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.3 })
  const [valuesRef, valuesInView] = useInView({ triggerOnce: true, threshold: 0.2 })
  const [techRef, techInView] = useInView({ triggerOnce: true, threshold: 0.2 })
  const [teamRef, teamInView] = useInView({ triggerOnce: true, threshold: 0.3 })

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-6">
              About{' '}
              <span className="text-primary">PassMan</span>
            </h1>
            <p className="text-muted text-lg md:text-xl leading-relaxed mb-8">
              PassMan was born from a simple belief: your passwords should be secure,
              private, and under your complete control. No cloud dependencies,
              no data mining, no compromises.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-surface p-4 rounded-xl"
                >
                  <div className="font-orbitron text-2xl md:text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={valuesRef}
            initial={{ opacity: 0, y: 50 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-6">
              Our{' '}
              <span className="text-primary">Mission</span>
            </h2>
            <p className="text-muted text-lg max-w-3xl mx-auto">
              To provide a secure, private, and user-friendly password management solution
              that puts users in complete control of their digital security.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.name}
                initial={{ opacity: 0, y: 50 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="feature-card"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl bg-surface/50 ${value.color}`}>
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-orbitron text-xl font-semibold ml-4">
                    {value.name}
                  </h3>
                </div>
                <p className="text-muted leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={techRef}
            initial={{ opacity: 0, y: 50 }}
            animate={techInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-6">
              Tech{' '}
              <span className="text-primary">Stack</span>
            </h2>
            <p className="text-muted text-lg max-w-3xl mx-auto">
              Built with modern, secure, and performant technologies to deliver
              the best possible user experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 50 }}
                animate={techInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-surface p-6 rounded-xl hover:border-primary/30 transition-all duration-300 group"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center mb-4">
                  <tech.icon className={`h-8 w-8 ${tech.color}`} />
                  <div className="ml-3">
                    <h3 className="font-orbitron text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                      {tech.name}
                    </h3>
                    <span className="text-xs text-muted bg-surface/50 px-2 py-1 rounded-full">
                      {tech.category}
                    </span>
                  </div>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={teamRef}
            initial={{ opacity: 0, y: 50 }}
            animate={teamInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-6">
              Meet the{' '}
              <span className="text-primary">Team</span>
            </h2>
            <p className="text-muted text-lg max-w-3xl mx-auto">
              Passionate individuals dedicated to building secure and private tools.
            </p>
          </motion.div>

          <div className="flex justify-center">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={teamInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="glass-surface p-8 rounded-2xl max-w-md"
              >
                <div className="text-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-primary/30"
                  />
                  <h3 className="font-orbitron text-xl font-bold mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-muted text-sm mb-6 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <motion.a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-primary transition-colors duration-300"
                      whileHover={{ scale: 1.2, y: -2 }}
                    >
                      <FaGithub className="h-5 w-5" />
                    </motion.a>
                    <motion.a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-primary transition-colors duration-300"
                      whileHover={{ scale: 1.2, y: -2 }}
                    >
                      <GlobeAltIcon className="h-5 w-5" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source & Community */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-surface rounded-2xl p-8 md:p-12"
          >
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-6">
              Open Source{' '}
              <span className="text-primary">Community</span>
            </h2>
            <p className="text-muted text-lg mb-8 max-w-3xl mx-auto">
              PassMan is completely open source and welcomes contributions from
              developers around the world. Together, we're building the future
              of secure password management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://github.com/tarunjawla/passman"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGithub className="h-5 w-5" />
                <span>View on GitHub</span>
              </motion.a>
              <motion.a
                href="https://github.com/tarunjawla/passman/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Contribute</span>
              </motion.a>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-muted text-sm">
                Licensed under MIT License • Free forever • No tracking • No ads
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

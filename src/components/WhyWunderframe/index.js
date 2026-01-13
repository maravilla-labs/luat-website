import React from 'react';
import { Zap, Target, Gamepad2, Flame, Rocket } from 'lucide-react';
import styles from './styles.module.css';

const reasons = [
  {
    icon: Zap,
    title: 'Lightning Fast Development',
    description: 'Write less boilerplate. Zero configuration means you can start building immediately without wrestling with build tools.',
    highlight: 'Get productive in minutes'
  },
  {
    icon: Target,
    title: 'Server-Side by Design',
    description: 'LUAT templates render on the server with optional client-side hydration. SEO-friendly and fast by default.',
    highlight: 'Perfect Lighthouse scores'
  },
  {
    icon: Gamepad2,
    title: 'Game-Proven Language',
    description: 'Lua powers some of the most complex interactive experiences ever created. Now it powers your web apps.',
    highlight: 'Battle-tested stability'
  },
  {
    icon: Flame,
    title: 'Modern Frontend Stack',
    description: 'TailwindCSS, Alpine.js, HTMX, and TypeScript work together seamlessly. No configuration required.',
    highlight: 'Best-in-class DX'
  }
];

export default function WhyWunderframe() {
  return (
    <section className={styles.whySection}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading}>Why Choose Luat?</h2>
          <p className={styles.subheading}>
            Stop configuring. Start creating. Luat gives you everything you need
            to build modern web applications without the complexity.
          </p>
        </div>

        <div className={styles.reasonsGrid}>
          {reasons.map((reason, index) => (
            <div key={index} className={styles.reasonCard}>
              <div className={styles.reasonIcon}>
                <reason.icon size={32} />
              </div>
              <h3 className={styles.reasonTitle}>{reason.title}</h3>
              <p className={styles.reasonDescription}>{reason.description}</p>
              <div className={styles.reasonHighlight}>{reason.highlight}</div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>Ready to level up your web development?</h3>
          <p className={styles.ctaDescription}>
            Join the growing community of developers who've discovered the joy of building with Luat.
          </p>
          <div className={styles.ctaButtons}>
            <a
              href="/docs/getting-started"
              className={styles.ctaPrimary}
            >
              <Rocket size={18} style={{ marginRight: '0.5rem' }} />
              Start Building
            </a>
            <a
              href="/coming-soon"
              className={styles.ctaSecondary}
            >
              <Target size={18} style={{ marginRight: '0.5rem' }} />
              Try Playground
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import CodeExample from '@site/src/components/CodeExample';
import GamePowered from '@site/src/components/GamePowered';
import WhyWunderframe from '@site/src/components/WhyWunderframe';
import HomepageShowcase from '@site/src/components/HomepageShowcase';
import { Rocket, BookOpen } from 'lucide-react';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <img
              src="/img/luat-logo.webp"
              alt="Luat"
              className={styles.heroLogo}
            />
            <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
              Build the web like<br/>
              <span className={styles.heroAccent}>you're making a game</span>
            </Heading>
            <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
              An <strong>open source</strong> templating engine that brings the power of <strong>Lua</strong> — the language that powers
              World of Warcraft, Roblox, and Angry Birds — to modern web development.
              <br/><br/>
              <strong>LUAT templating</strong> with Svelte-inspired syntax.
              <strong> SvelteKit-style routing.</strong> Maximum creativity.
            </p>
            <div className={styles.buttons}>
              <Link
                className={clsx('button button--primary button--lg', styles.primaryButton)}
                to="/docs/getting-started">
                <Rocket size={18} style={{ marginRight: '0.5rem' }} />
                <span>Get Started</span>
              </Link>
              <Link
                className={clsx('button button--secondary button--lg', styles.secondaryButton)}
                to="/docs/templating/intro">
                <BookOpen size={18} style={{ marginRight: '0.5rem' }} />
                <span>Learn LUAT</span>
              </Link>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>0</div>
                <div className={styles.statLabel}>Config Files</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Lua Powered</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>∞</div>
                <div className={styles.statLabel}>Possibilities</div>
              </div>
            </div>
          </div>
          <div className={styles.heroCode}>
            <CodeExample />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Svelte-inspired Lua Templating for Rust`}
      description="Build modern web applications with LUAT templating powered by Lua. SvelteKit-style routing, integrated toolchain, and game-level performance.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <GamePowered />
        <WhyWunderframe />
        <HomepageShowcase />
      </main>
    </Layout>
  );
}

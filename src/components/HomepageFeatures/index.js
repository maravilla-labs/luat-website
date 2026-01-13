import clsx from 'clsx';
import Heading from '@theme/Heading';
import { Gamepad2, Sparkles, Zap } from 'lucide-react';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Game-Level Performance',
    icon: Gamepad2,
    colorClass: 'iconPurple',
    description: (
      <>
        LUAT templates compile to blazing-fast Lua bytecode, just like the engines powering
        <strong> World of Warcraft</strong> and <strong>Roblox</strong>. Server-side rendering that's
        built for speed from day one.
      </>
    ),
  },
  {
    title: 'Svelte-Inspired Syntax',
    icon: Sparkles,
    colorClass: 'iconOrange',
    description: (
      <>
        Familiar <code>{'#if'}</code>, <code>{'#each'}</code>, and reactive patterns you love,
        powered by the proven stability of Lua. Write templates that feel natural and
        compile to efficient code.
      </>
    ),
  },
  {
    title: 'Zero Config Magic',
    icon: Zap,
    colorClass: 'iconYellow',
    description: (
      <>
        <strong>TailwindCSS</strong>, <strong>TypeScript</strong>, <strong>Alpine.js</strong>, and <strong>HTMX</strong> work
        seamlessly together. No webpack configs, no build tool nightmares. Just pure creativity.
      </>
    ),
  },
];

function Feature({icon: Icon, title, description, colorClass}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={clsx(styles.featureIcon, styles[colorClass])}>
          <Icon size={56} strokeWidth={1.5} />
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

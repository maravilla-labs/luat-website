import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {
  Rocket,
  Gamepad2,
  FolderTree,
  Smartphone,
  Sparkles,
  CheckCircle,
  RefreshCw,
  BookOpen,
  Users,
  Github
} from 'lucide-react';
import styles from './coming-soon.module.css';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const WEB3FORMS_ACCESS_KEY = "5ae8c696-2557-4f55-87b8-2f32a12f83ba";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);
      formData.append('email', email);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setEmail('');
        console.log('Web3Forms submission successful:', data);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
        console.error('Web3Forms submission error:', data);
      }
    } catch (err) {
      setError('Network error. Please check your internet connection.');
      console.error('Network error during Web3Forms submission:', err);
    }
  };

  return (
    <Layout
      title="Coming Soon"
      description="Something amazing is brewing at Luat. Be the first to know when we launch!"
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Main heading */}
          <div className={styles.header}>
            <div className={styles.badge}>
              <Rocket size={16} style={{ marginRight: '0.5rem' }} />
              Coming Soon
            </div>
            <h1 className={styles.title}>
              Something <span className={styles.titleAccent}>amazing</span> is brewing
            </h1>
            <p className={styles.subtitle}>
              We're putting the finishing touches on an incredible experience that will revolutionize
              how you build web applications with Luat. Get ready for something special.
            </p>
          </div>

          {/* Features preview */}
          <div className={styles.features}>
            <div className={clsx(styles.feature, styles.featureCompleted)}>
              <div className={styles.featureIcon}>
                <Gamepad2 size={28} />
              </div>
              <h3>Live Playground</h3>
              <p>Interactive LUAT editor with real-time preview</p>
              <span className={styles.featureStatus}>Done</span>
            </div>
            <div className={clsx(styles.feature, styles.featureInProgress)}>
              <div className={styles.featureIcon}>
                <FolderTree size={28} />
              </div>
              <h3>File-based Routing</h3>
              <p>Automatic routes from your file structure</p>
              <span className={styles.featureStatus}>In Progress</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Sparkles size={28} />
              </div>
              <h3>Smart Templates</h3>
              <p>AI-powered component generation</p>
              <span className={styles.featureStatus}>Planned</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Smartphone size={28} />
              </div>
              <h3>Universal Rendering</h3>
              <p>Web, mobile apps & native with shared templates</p>
              <span className={styles.featureStatus}>Planned</span>
            </div>
          </div>

          {/* GitHub Stars CTA */}
          <div className={styles.githubCta}>
            <div className={styles.githubCtaContent}>
              <Github size={48} className={styles.githubCtaIcon} />
              <h2 className={styles.githubCtaTitle}>Support Luat on GitHub</h2>
              <p className={styles.githubCtaText}>
                If you find Luat useful, give us a star! It helps others discover the project
                and motivates us to keep improving.
              </p>
              <a
                href="https://github.com/maravilla-labs/luat"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubStarButton}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                </svg>
                Star on GitHub
              </a>
            </div>
          </div>

          {/* Email signup */}
          <div className={styles.signup}>
            <h2 className={styles.signupTitle}>Stay in the loop</h2>
            <p className={styles.signupSubtitle}>
              Get notified about new features, releases, and updates.
              Be part of the Luat community from the start.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className={styles.signupForm}>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.emailInput}
                    required
                  />
                  <button type="submit" className={styles.signupButton}>
                    Notify Me
                  </button>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <p className={styles.disclaimer}>
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            ) : (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                  <CheckCircle size={32} />
                </div>
                <h3>You're on the list!</h3>
                <p>We'll send you an email as soon as we launch. Thanks for your interest!</p>
              </div>
            )}
          </div>

          {/* Social proof */}
          <div className={styles.socialProof}>
            <p className={styles.socialProofText}>
              Be among the first developers to experience the future of web development
            </p>
            <div className={styles.avatars}>
              <div className={styles.avatar}><Users size={20} /></div>
              <div className={styles.avatar}><Users size={20} /></div>
              <div className={styles.avatar}><Users size={20} /></div>
              <div className={styles.avatar}><Users size={20} /></div>
              <div className={styles.avatar}><Users size={20} /></div>
              <div className={styles.avatarMore}>+</div>
            </div>
          </div>

          {/* Call to action */}
          <div className={styles.cta}>
            <p className={styles.ctaText}>
              Can't wait? Start exploring our documentation now
            </p>
            <Link
              to="/docs/getting-started"
              className={styles.ctaButton}
            >
              <BookOpen size={18} style={{ marginRight: '0.5rem' }} />
              Explore Documentation
            </Link>
          </div>

          {/* Timeline */}
          <div className={styles.timeline}>
            <h3 className={styles.timelineTitle}>Roadmap</h3>
            <div className={styles.timelineItems}>
              <div className={clsx(styles.timelineItem, styles.completed)}>
                <div className={styles.timelineIcon}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <h4>Documentation & Playground</h4>
                  <p>Interactive docs with live code examples</p>
                </div>
              </div>
              <div className={clsx(styles.timelineItem, styles.inProgress)}>
                <div className={styles.timelineIcon}>
                  <RefreshCw size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <h4>File-based Routing</h4>
                  <p>Automatic routes from directory structure</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>
                  <Sparkles size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <h4>Smart Templates</h4>
                  <p>AI-assisted component generation</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>
                  <Smartphone size={20} />
                </div>
                <div className={styles.timelineContent}>
                  <h4>Universal Rendering</h4>
                  <p>Native mobile & cross-platform support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

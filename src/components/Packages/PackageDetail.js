import { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Readme from './Readme';
import { isPackageName, packageInfo } from './registry';
import styles from './styles.module.css';

/** One package: install command, README, versions, dependencies, files. */
export default function PackageDetail({ name, version }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let live = true;
    if (!isPackageName(name)) {
      setState({ error: `“${name}” is not a package name (@scope/name).` });
      return undefined;
    }
    setState({ loading: true });
    packageInfo(name, version)
      .then((data) => live && setState(data ? { data } : { missing: true }))
      .catch((error) => live && setState({ error: error.message }));
    return () => { live = false; };
  }, [name, version]);

  if (state.loading) return <p>Loading…</p>;
  if (state.error) return <p className={styles.error}>{state.error}</p>;
  if (state.missing) return <p>No package called <code>{name}</code>{version ? ` at ${version}` : ''}.</p>;

  const p = state.data;
  const shown = version || p.latest;
  const deps = Object.entries(p.dependencies || {});
  return (
    <div className={styles.detail}>
      <div className={styles.main}>
        <h1>{p.name} <span className={styles.version}>{shown}</span></h1>
        {p.description && <p className={styles.lead}>{p.description}</p>}
        <CodeBlock language="bash">{`luat add ${p.name}${version ? `@${version}` : ''}`}</CodeBlock>
        <Readme markdown={p.readme} />
      </div>
      <aside className={styles.side}>
        {p.license && <><h4>License</h4><p>{p.license}</p></>}
        {p.repository && /^https?:\/\//.test(p.repository) && (
          <><h4>Repository</h4><p><a href={p.repository} rel="nofollow noopener">{p.repository}</a></p></>
        )}
        {deps.length > 0 && (
          <>
            <h4>Dependencies</h4>
            <ul>
              {deps.map(([dep, req]) => (
                <li key={dep}><Link to={`/packages?name=${encodeURIComponent(dep)}`}>{dep}</Link> <code>{req}</code></li>
              ))}
            </ul>
          </>
        )}
        <h4>Versions</h4>
        <ul>
          {(p.versions || []).slice().reverse().map((v) => (
            <li key={v.vers}>
              <Link to={`/packages?name=${encodeURIComponent(p.name)}&version=${encodeURIComponent(v.vers)}`}>{v.vers}</Link>
              {v.yanked && <span className={styles.yanked}> yanked</span>}
              {v.published_at && <span className={styles.date}> {v.published_at.slice(0, 10)}</span>}
            </li>
          ))}
        </ul>
        {p.files && p.files.length > 0 && (
          <details>
            <summary>{p.files.length} files</summary>
            <ul className={styles.files}>{p.files.map((f) => <li key={f}><code>{f}</code></li>)}</ul>
          </details>
        )}
      </aside>
    </div>
  );
}

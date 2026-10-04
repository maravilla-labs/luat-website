import { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { search } from './registry';
import styles from './styles.module.css';

/** Search box and result list. */
export default function PackageList({ query, onQuery }) {
  const [text, setText] = useState(query);
  const [state, setState] = useState({ loading: true });

  useEffect(() => setText(query), [query]);
  useEffect(() => {
    let live = true;
    setState({ loading: true });
    search(query)
      .then((data) => live && setState({ data: data || { packages: [], total: 0 } }))
      .catch((error) => live && setState({ error: error.message }));
    return () => { live = false; };
  }, [query]);

  return (
    <>
      <form className={styles.search} onSubmit={(e) => { e.preventDefault(); onQuery(text.trim()); }}>
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search packages — components, layouts, helpers…"
          aria-label="Search packages"
        />
        <button className="button button--primary" type="submit">Search</button>
      </form>
      {state.loading && <p>Loading…</p>}
      {state.error && <p className={styles.error}>Could not reach the registry: {state.error}</p>}
      {state.data && (
        <>
          <p className={styles.count}>
            {state.data.total} package{state.data.total === 1 ? '' : 's'}{query ? ` matching “${query}”` : ''}
          </p>
          <ul className={styles.list}>
            {state.data.packages.map((p) => (
              <li key={p.name} className={styles.item}>
                <Link to={`/packages?name=${encodeURIComponent(p.name)}`} className={styles.name}>{p.name}</Link>
                <span className={styles.version}>{p.latest}</span>
                {p.description && <p>{p.description}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

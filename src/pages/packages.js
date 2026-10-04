import { useCallback } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import PackageList from '@site/src/components/Packages/PackageList';
import PackageDetail from '@site/src/components/Packages/PackageDetail';

/** Browse the public Luat package registry: /packages, /packages?q=…,
 *  /packages?name=@scope/name[&version=…]. */
export default function Packages() {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const name = params.get('name');
  const query = params.get('q') || '';
  const onQuery = useCallback(
    (q) => history.push(q ? `/packages?q=${encodeURIComponent(q)}` : '/packages'),
    [history],
  );

  return (
    <Layout title={name || 'Packages'} description="Components, layouts and helpers for Luat projects">
      <main className="container margin-vert--lg">
        {name ? (
          <>
            <Link to="/packages">← All packages</Link>
            <PackageDetail name={name} version={params.get('version')} />
          </>
        ) : (
          <>
            <h1>Packages</h1>
            <p>
              Components, layouts and helpers to share between Luat projects. Add one with{' '}
              <code>luat add @scope/name</code> — see <Link to="/docs/application/packages">Packages</Link>.
            </p>
            <PackageList query={query} onQuery={onQuery} />
          </>
        )}
      </main>
    </Layout>
  );
}

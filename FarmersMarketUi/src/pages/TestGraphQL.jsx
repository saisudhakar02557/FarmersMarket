import { useEffect, useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";

export default function TestGraphQL() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const query = `
      query {
        products {
          id
          name
          status
        }
      }
    `;

    gqlRequest(query)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">GraphQL Test</h2>
        <p className="page-subtitle">Validate the API connection and preview returned data.</p>
      </header>
      {err && <div className="info-banner info-banner--error">{err}</div>}
      {!err && !data && <div className="info-banner info-banner--neutral">Loading data...</div>}
      {data && (
        <div className="panel">
          <div className="panel-title">Response Preview</div>
          <pre className="code-block">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

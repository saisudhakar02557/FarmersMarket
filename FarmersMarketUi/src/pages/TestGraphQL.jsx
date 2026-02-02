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
    <div style={{ padding: 20 }}>
      <h2>GraphQL Test (No Apollo)</h2>
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}
      {!err && !data && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

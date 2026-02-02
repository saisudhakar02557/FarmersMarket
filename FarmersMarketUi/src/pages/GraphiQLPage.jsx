import "graphiql/graphiql.min.css";
import GraphiQL from "graphiql";

const fetcher = async (graphQLParams) => {
  const res = await fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(graphQLParams),
  });
  return res.json();
};

export default function GraphiQLPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">GraphiQL Explorer</h2>
        <p className="page-subtitle">Run queries and inspect responses in the GraphQL playground.</p>
      </header>
      <div className="graph-wrapper">
        <GraphiQL fetcher={fetcher} />
      </div>
    </div>
  );
}

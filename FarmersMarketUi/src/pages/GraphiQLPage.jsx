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
    <div style={{ height: "90vh" }}>
      <GraphiQL fetcher={fetcher} />
    </div>
  );
}

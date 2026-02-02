const GRAPHQL_URL = "http://localhost:8080/graphql";

export async function gqlRequest(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // If Spring Security blocks it, we’ll add Authorization later
      // "Authorization": "Basic base64(email:pass)"
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join("\n"));
  }

  return json.data;
}

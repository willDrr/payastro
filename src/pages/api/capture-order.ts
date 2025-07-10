import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, url }) => {
  const orderID = url.searchParams.get("id");
  if (!orderID) {
    return new Response(JSON.stringify({ error: "Missing order ID" }), { status: 400 });
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    return new Response(JSON.stringify({ error: errorData }), { status: 500 });
  }

  const data = await response.json();
  return new Response(JSON.stringify({ status: data.status, data }), { status: 200 });
};

async function getAccessToken() {
  const auth = Buffer.from(`${import.meta.env.PAYPAL_CLIENT_ID}:${import.meta.env.PAYPAL_SECRET}`).toString("base64");
  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

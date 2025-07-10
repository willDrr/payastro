import type { APIRoute } from "astro";
import { PRODUCTS } from "../../data/products.js";

export const POST: APIRoute = async ({ request }) => {
  const { cart } = await request.json();
  const total = cart.reduce((sum: number, item: any) => {
    return sum + PRODUCTS[item.id].price * item.quantity;
  }, 0);

  const accessToken = await getAccessToken();
  const order = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: total.toFixed(2) },
      }],
    }),
  });

  const data = await order.json();
  return new Response(JSON.stringify({ id: data.id }), { status: 200 });
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

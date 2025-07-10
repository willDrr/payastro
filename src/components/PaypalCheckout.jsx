import { useEffect } from "react";

export default function PaypalCheckout({ cart }) {
  useEffect(() => {
    if (!window.paypal || !cart || cart.length === 0) return;

    const paypalButtons = window.paypal.Buttons({
      createOrder: async () => {
        const res = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });
        const data = await res.json();
        return data.id;
      },
      onApprove: async (data) => {
        const res = await fetch(`/api/capture-order?id=${data.orderID}`, {
          method: "POST",
        });
        const captureData = await res.json();
        document.getElementById("result-message").textContent = `Payment ${captureData.status}`;
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        document.getElementById("result-message").textContent = "An error occurred during payment.";
      },
    });

    paypalButtons.render("#paypal-button-container");

    return () => {
      paypalButtons.close();
    };
  }, [cart]);

  return null;
}

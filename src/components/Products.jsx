import { useState, useEffect } from "react";

import { PRODUCTS  } from "../data/products";
  

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  const addToCart = (id, quantity = 1) => {
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      setCart(cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setCart([...cart, { id, quantity }]);
    }
  };

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCart([]);
      setMessage("");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + PRODUCTS[item.id].price * item.quantity,
    0
  );

  useEffect(() => {
    if (!window.paypal || cart.length === 0) return;

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
        setMessage(`Transaction ${captureData.status}`);
        setCart([]);
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        setMessage("An error occurred during payment.");
      },
    });

    paypalButtons.render("#paypal-button-container");

    return () => {
      paypalButtons.close();
    };
  }, [cart]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Astro Space Shop</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {Object.values(PRODUCTS).map((product) => (
          <div key={product.id} className="border p-4 rounded shadow flex flex-col justify-between">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-700 mb-2">${product.price}</p>
            <button
              className="bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
              onClick={() => addToCart(product.id)}
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-100 p-4 rounded shadow mb-6">
        <h3 className="text-xl font-bold mb-2">Your Cart</h3>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between border-b pb-1">
                  <span>
                    {PRODUCTS[item.id].name} — Qty: {item.quantity}
                  </span>
                  <span>${PRODUCTS[item.id].price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-4">
              <p className="font-bold text-lg">Total: ${total}</p>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
            <div id="paypal-button-container" className="mt-4"></div>
            <p className="mt-2 text-green-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

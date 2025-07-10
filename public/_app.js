const cart = [];
let total = 0;
const PRODUCTS = {
  galaxy: { name: 'Galaxy Shoes', price: 100 },
  earrings: { name: 'Spaceship Earrings', price: 40 },
  tote: { name: 'Martian Tote', price: 75 },
};

function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  total = 0;

  cart.forEach(item => {
    const product = PRODUCTS[item.id];
    const li = document.createElement("li");
    li.textContent = `${product.name} x ${item.quantity}`;
    cartItems.appendChild(li);
    total += product.price * item.quantity;
  });

  document.getElementById("cart-total").textContent = total.toFixed(2);
}

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const qty = parseInt(document.getElementById(`qty-${id}`).value);
    if (qty > 0) {
      cart.push({ id, quantity: qty });
      updateCartDisplay();
    }
  });
});

document.getElementById("clear-cart").addEventListener("click", () => {
  cart.length = 0;
  updateCartDisplay();
});

paypal.Buttons({
  createOrder: async () => {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
    });
    const data = await response.json();
    return data.id;
  },
  onApprove: async (data) => {
    const response = await fetch(`/api/capture-order?id=${data.orderID}`, { method: 'POST' });
    const result = await response.json();
    document.getElementById("result-message").textContent = `Transaction ${result.status}`;
  },
}).render('#paypal-button-container');

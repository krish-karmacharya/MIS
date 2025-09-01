import { Link } from "react-router-dom";
import { useCart } from "../contexts/useCart";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {cart.map((item) => {
              // Skip items that don't have required properties
              if (!item || !item._id || !item.name) {
                return null;
              }

              return (
                <div
                  key={item._id}
                  className="flex items-center p-6 border-b border-gray-200 last:border-b-0"
                >
                  <img
                    src={item.images?.[0] || "/placeholder-image.jpg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1 ml-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {item.category}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {item.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <FaMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-lg font-bold text-gray-900">
                      Rs. {(item.price * item.quantity)?.toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-600 hover:text-red-800 mt-2"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  Rs. {getCartTotal().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">Rs. 0</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center block mt-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/useCart";
import { useAuth } from "../contexts/useAuth.js";
import { useMutation } from "@tanstack/react-query";
import api from "../utils/api";
import {
  FaShoppingCart,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, removeFromCart, updateQuantity } =
    useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "khalti",
  });

  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onSuccess: (data) => {
      if (formData.paymentMethod === "khalti") {
        // Initialize Khalti payment
        initializeKhaltiPayment(data.data);
      } else if (formData.paymentMethod === "esewa") {
        // Initialize eSewa payment
        initializeEsewaPayment(data.data);
      } else if (formData.paymentMethod === "cod") {
        // COD order created successfully
        toast.success("Order placed successfully! You will pay on delivery.");
        clearCart();
        navigate("/orders");
        setLoading(false);
      }
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to create order");
    },
  });

  const initializeKhaltiPayment = async (order) => {
    try {
      // Get Khalti KPG-2 payment URL from backend
      const response = await api.post("/orders/initiate-khalti", {
        orderId: order._id,
      });

      const { payment_url, pidx } = response.data.data;

      // Store pidx in localStorage for verification
      localStorage.setItem("current_pidx", pidx);

      // Redirect to Khalti payment page
      window.location.href = payment_url;
    } catch (error) {
      setLoading(false);
      toast.error("Failed to initialize payment. Please try again.");
      console.error("Payment initialization error:", error);
    }
  };

  const initializeEsewaPayment = async (order) => {
    try {
      // Get eSewa payment URL from backend
      const response = await api.post("/orders/initiate-esewa", {
        orderId: order._id,
      });
      const { payment_url } = response.data.data;
      // Redirect to eSewa payment page
      window.location.href = payment_url;
    } catch (error) {
      setLoading(false);
      toast.error("Failed to initialize eSewa payment. Please try again.");
      console.error("eSewa payment initialization error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate cart items
    const invalidItems = cart.filter(
      (item) => !item.name || !item._id || !item.price
    );
    if (invalidItems.length > 0) {
      toast.error("Some cart items are invalid. Please refresh and try again.");
      return;
    }

    setLoading(true);

    // Debug: Log cart data
    console.log("Cart data:", cart);
    console.log("Form data:", formData);

    const orderData = {
      items: cart.map((item) => ({
        product: item._id,
        name: item.name || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        image: item.images?.[0] || "https://via.placeholder.com/150",
      })),
      shippingAddress: {
        street: formData.address,
        city: formData.city,
        state: "N/A",
        zipCode: formData.postalCode || "N/A",
        country: "Nepal",
      },
      paymentMethod: formData.paymentMethod,
      totalAmount: getCartTotal(),
    };

    console.log("Order data being sent:", orderData);
    createOrderMutation.mutate(orderData);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some products to your cart to continue
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="lg:order-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                // Skip items that don't have required properties
                if (!item || !item._id || !item.name) {
                  return null;
                }

                return (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img
                      src={item.images?.[0] || "/placeholder-image.jpg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Rs. {item.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>Rs. {getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>Rs. 0</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span>Rs. {getCartTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:order-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="w-5 h-5 mr-2" />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="khalti"
                    checked={formData.paymentMethod === "khalti"}
                    onChange={handleInputChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://web.khalti.com/static/img/logo.png"
                      alt="Khalti"
                      className="w-8 h-8"
                    />
                    <span className="font-medium">Khalti Digital Wallet</span>
                  </div>
                </label>

                {/* <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="esewa"
                    checked={formData.paymentMethod === "esewa"}
                    onChange={handleInputChange}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://esewa.com.np/common/images/esewa_logo.png"
                      alt="eSewa"
                      className="w-8 h-8"
                    />
                    <span className="font-medium">eSewa Digital Wallet</span>
                  </div>
                </label> */}

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleInputChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">
                        ₹
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-sm text-gray-500">
                        Pay when you receive your order
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaShoppingCart className="w-5 h-5 mr-2" />
                  Place Order - Rs. {getCartTotal().toLocaleString()}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

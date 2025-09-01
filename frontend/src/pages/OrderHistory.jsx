import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import { FaBox, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";

const OrderHistory = () => {
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/orders/myorders");
      return response.data;
    },
  });

  const orders = ordersData?.data || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="w-5 h-5 text-green-600" />;
      case "paid":
        return <FaCheckCircle className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <FaClock className="w-5 h-5 text-yellow-600" />;
      default:
        return <FaTimesCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (order) => {
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) {
      if (order.paymentMethod === "khalti") return "Paid via Khalti";
      if (order.paymentMethod === "esewa") return "Paid via eSewa";
      return "Paid";
    }
    if (order.paymentMethod === "cod") return "Pending Payment (COD)";
    return "Pending";
  };

  const getStatusColor = (order) => {
    if (order.isDelivered) return "text-green-600 bg-green-100";
    if (order.isPaid) {
      if (order.paymentMethod === "khalti")
        return "text-purple-600 bg-purple-100";
      if (order.paymentMethod === "esewa") return "text-green-600 bg-green-100";
      return "text-blue-600 bg-blue-100";
    }
    if (order.paymentMethod === "cod") return "text-orange-600 bg-orange-100";
    return "text-yellow-600 bg-yellow-100";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">Failed to load orders</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <FaBox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            No Orders Yet
          </h1>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order._id.slice(-6)}
                </h3>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getStatusText(order))}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order
                  )}`}
                >
                  {getStatusText(order)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Order Details
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>
                      Payment Method:{" "}
                      {order.paymentMethod === "khalti"
                        ? "Khalti"
                        : order.paymentMethod === "esewa"
                        ? "eSewa"
                        : "Cash on Delivery"}
                    </p>
                    <p>
                      Total Amount: Rs. {order.totalPrice?.toLocaleString()}
                    </p>
                    {order.isPaid && (
                      <p>
                        Paid on: {new Date(order.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product?.name || "Product"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × Rs.{" "}
                          {item.price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          Rs. {(item.quantity * item.price)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;

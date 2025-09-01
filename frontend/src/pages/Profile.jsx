import { useState } from "react";
import { useAuth } from "../contexts/useAuth.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaBox,
  FaHistory,
  FaShieldAlt,
  FaShoppingCart,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
  });

  // Fetch user orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["userOrders"],
    queryFn: async () => {
      const response = await api.get("/orders/myorders");
      return response.data;
    },
  });

  const orders = ordersData?.data || [];

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await api.put("/auth/profile", profileData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries(["userOrders"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address?.street || "",
      city: user?.address?.city || "",
    });
    setIsEditing(false);
  };

  const getStatusColor = (order) => {
    if (order.isDelivered) return "text-green-600 bg-green-100";
    if (order.isPaid) return "text-blue-600 bg-blue-100";
    if (order.paymentMethod === "cod") return "text-orange-600 bg-orange-100";
    return "text-yellow-600 bg-yellow-100";
  };

  const getStatusText = (order) => {
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Paid";
    if (order.paymentMethod === "cod") return "Pending Payment (COD)";
    return "Pending";
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FaUser className="inline w-4 h-4 mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FaBox className="inline w-4 h-4 mr-2" />
            Order History
          </button>
          {user.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "admin"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaShieldAlt className="inline w-4 h-4 mr-2" />
              Admin Panel
            </button>
          )}
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <FaTimes className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <FaUser className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaEnvelope className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaPhone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium text-gray-900">
                      {user.address?.city || "Not provided"}
                    </p>
                  </div>
                </div>

                {user.address?.street && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <FaMapMarkerAlt className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">
                        {user.address.street}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaHistory className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order History Tab */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Order History
          </h2>

          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <FaBox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't placed any orders yet.
              </p>
              <a
                href="/products"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order
                      )}`}
                    >
                      {getStatusText(order)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium text-gray-900">
                        Rs. {order.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {order.paymentMethod === "khalti"
                          ? "Paid via Khalti"
                          : order.paymentMethod === "esewa"
                          ? "Paid via eSewa"
                          : "Pending Payment (COD)"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm text-gray-500 mb-2">Order Items:</p>
                    <div className="space-y-1">
                      {order.orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.product?.name || "Product"} × {item.quantity}
                          </span>
                          <span>
                            Rs. {(item.quantity * item.price)?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Panel Tab */}
      {activeTab === "admin" && user.role === "admin" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Admin Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/admin"
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <FaShieldAlt className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Dashboard</h3>
              <p className="text-sm text-gray-600">
                View store statistics and overview
              </p>
            </a>

            <a
              href="/admin/products"
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <FaBox className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Manage Products
              </h3>
              <p className="text-sm text-gray-600">
                Add, edit, or remove products
              </p>
            </a>

            <a
              href="/admin/orders"
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <FaHistory className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Manage Orders</h3>
              <p className="text-sm text-gray-600">
                View and update order status
              </p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

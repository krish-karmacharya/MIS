import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";
import toast from "react-hot-toast";

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);

  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const pidx = searchParams.get("pidx");
  const payment = searchParams.get("payment");
  const oid = searchParams.get("oid");

  // Get order details if orderId is provided
  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });

  const order = orderData?.data;

  useEffect(() => {
    // Handle different payment statuses
    if (status === "Completed") {
      toast.success("Payment completed successfully!");
      // Clear cart and redirect after a delay
      setTimeout(() => {
        navigate("/orders");
      }, 3000);
    } else if (status === "User canceled") {
      toast.error("Payment was cancelled by user");
    } else if (status === "error") {
      toast.error("Payment processing error occurred");
    }

    // If we have pidx, verify the payment (Khalti)
    if (pidx && status === "Completed") {
      verifyPayment(pidx);
    }
    // If eSewa, verify payment if status is success and oid is present
    if (payment === "esewa" && status === "success" && oid) {
      verifyEsewaPayment(oid);
    }
  }, [status, pidx, payment, oid, navigate]);

  const verifyPayment = async (paymentPidx) => {
    setVerifying(true);
    try {
      const response = await api.post("/orders/verify-khalti", {
        pidx: paymentPidx,
      });

      if (response.data.success) {
        toast.success("Payment verified successfully!");
      } else {
        toast.error(response.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const verifyEsewaPayment = async (orderId) => {
    setVerifying(true);
    try {
      const response = await api.post("/orders/verify-esewa", {
        orderId,
      });
      if (response.data.success) {
        toast.success("eSewa payment verified successfully!");
      } else {
        toast.error(
          response.data.message || "eSewa payment verification failed"
        );
      }
    } catch (error) {
      console.error("eSewa payment verification error:", error);
      toast.error("eSewa payment verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Completed":
        return <FaCheckCircle className="w-16 h-16 text-green-500" />;
      case "User canceled":
        return <FaTimesCircle className="w-16 h-16 text-red-500" />;
      case "Pending":
        return <FaClock className="w-16 h-16 text-yellow-500" />;
      default:
        return <FaTimesCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "Completed":
        return "Payment Successful";
      case "User canceled":
        return "Payment Cancelled";
      case "Pending":
        return "Payment Pending";
      default:
        return "Payment Failed";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "Completed":
        return "Your payment has been processed successfully. Your order will be processed shortly.";
      case "User canceled":
        return "You cancelled the payment. You can try again or choose a different payment method.";
      case "Pending":
        return "Your payment is being processed. Please wait for confirmation.";
      default:
        return "There was an error processing your payment. Please try again.";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "User canceled":
        return "text-red-600 bg-red-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-red-600 bg-red-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-8 mx-auto"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </button>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">{getStatusIcon()}</div>

        {/* Status Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {getStatusText()}
        </h1>

        {/* Status Description */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {getStatusDescription()}
        </p>

        {/* Status Badge */}
        <div className="mb-8">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor()}`}
          >
            {status || "Unknown"}
          </span>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium text-gray-900">
                  #{order._id.slice(-6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium text-gray-900">
                  Rs. {order.totalPrice?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {status === "Completed" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Redirecting to orders page in 3 seconds...
              </p>
              <button
                onClick={() => navigate("/orders")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Orders
              </button>
            </div>
          ) : status === "User canceled" ? (
            <div className="space-y-4">
              <button
                onClick={() => navigate("/checkout")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/products")}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors ml-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => navigate("/orders")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate("/products")}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors ml-4"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Verification Status */}
        {verifying && (
          <div className="mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Verifying payment...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;

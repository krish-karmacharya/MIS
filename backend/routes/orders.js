import express from "express";
import Order from "../models/Order.js";
import { protect, admin } from "../middleware/auth.js";
import axios from "axios";

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    console.log("Order creation request:", {
      user: req.user._id,
      body: req.body,
    });

    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items" });
    }

    const order = new Order({
      orderItems: items.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: totalAmount,
      taxPrice: 0,
      shippingPrice: 0,
    });

    // For COD orders, mark as pending payment
    if (paymentMethod === "cod") {
      order.isPaid = false;
      order.paymentResult = {
        id: "COD",
        status: "pending",
        update_time: new Date().toISOString(),
        email_address: req.user.email,
        payment_method: "cod",
      };
    }

    console.log("Order object before save:", JSON.stringify(order, null, 2));
    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put("/:id/deliver", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id name");
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get all orders for admin dashboard
// @route   GET /api/orders/admin
// @access  Private/Admin
router.get("/admin", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("orderItems.product", "name images price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Verify Khalti payment
// @route   POST /api/orders/verify-payment
// @access  Private
router.post("/verify-payment", protect, async (req, res) => {
  try {
    const { orderId, paymentData } = req.body;

    if (!orderId || !paymentData) {
      return res.status(400).json({
        success: false,
        message: "Order ID and payment data are required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify that the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to verify this payment",
      });
    }

    // Verify payment with Khalti using lookup API
    try {
      const khaltiResponse = await axios.post(
        "https://dev.khalti.com/api/v2/epayment/lookup/",
        {
          pidx: paymentData.pidx,
        },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const khaltiData = khaltiResponse.data;

      if (khaltiData.status === "Completed") {
        // Payment verified successfully
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          pidx: khaltiData.pidx,
          status: khaltiData.status,
          transaction_id: khaltiData.transaction_id,
          total_amount: khaltiData.total_amount,
          fee: khaltiData.fee,
          refunded: khaltiData.refunded,
          payment_method: "khalti",
        };

        await order.save();

        res.json({
          success: true,
          message: "Payment verified successfully",
          data: order,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } catch (khaltiError) {
      console.error("Khalti verification error:", khaltiError);
      res.status(500).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Initiate Khalti payment
// @route   POST /api/orders/initiate-khalti
// @access  Private
router.post("/initiate-khalti", protect, async (req, res) => {
  try {
    console.log("Khalti initiation request:", req.body);
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("user");
    console.log("Found order:", order);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify that the order belongs to the user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    // Prepare Khalti e-Payment payload according to documentation
    const khaltiPayload = {
      return_url: `${
        process.env.FRONTEND_URL || "http://localhost:5174"
      }/payment/result`,
      website_url: process.env.FRONTEND_URL || "http://localhost:5174",
      amount: Math.round(order.itemsPrice * 100), // Convert to paisa and ensure integer
      purchase_order_id: order._id.toString(),
      purchase_order_name: `Order #${order._id.toString().slice(-6)}`,
      customer_info: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "9800000000",
      },
      product_details: order.orderItems.map((item, index) => ({
        identity: item.product || `item_${index}`,
        name: item.name,
        total_price: Math.round(item.price * item.quantity * 100),
        quantity: item.quantity,
        unit_price: Math.round(item.price * 100),
      })),
    };

    console.log("Khalti payload:", JSON.stringify(khaltiPayload, null, 2));
    console.log(
      "Khalti API URL:",
      "https://dev.khalti.com/api/v2/epayment/initiate/"
    );
    console.log(
      "Khalti Secret Key:",
      process.env.KHALTI_SECRET_KEY ? "Present" : "Missing"
    );

    // Make request to Khalti KPG-2 API
    let khaltiResponse;
    try {
      khaltiResponse = await axios.post(
        "https://dev.khalti.com/api/v2/epayment/initiate/",
        khaltiPayload,
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );
      console.log("Khalti API call successful, status:", khaltiResponse.status);
    } catch (error) {
      console.error("Khalti API call failed:");
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      return res.status(400).json({
        success: false,
        message: "Failed to connect to Khalti payment service",
        error: error.response?.data || error.message,
      });
    }

    const khaltiData = khaltiResponse.data;
    console.log("Khalti API response:", khaltiData);

    if (!khaltiResponse.data || !khaltiResponse.data.pidx) {
      console.error("Khalti API Error:", khaltiData);
      return res.status(400).json({
        success: false,
        message: "Failed to initiate payment with Khalti",
        error: khaltiData,
      });
    }

    // Store pidx in order for verification
    order.pidx = khaltiData.pidx;
    await order.save();

    res.json({
      success: true,
      data: {
        order,
        payment_url: khaltiData.payment_url,
        pidx: khaltiData.pidx,
        expires_at: khaltiData.expires_at,
        expires_in: khaltiData.expires_in,
      },
    });
  } catch (error) {
    console.error("Khalti initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
    });
  }
});

// @desc    Verify Khalti KPG-2 payment
// @route   POST /api/orders/verify-khalti
// @access  Private
router.post("/verify-khalti", protect, async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "Payment ID (pidx) is required",
      });
    }

    // Verify payment with Khalti KPG-2 API
    let khaltiResponse;
    try {
      khaltiResponse = await axios.post(
        "https://dev.khalti.com/api/v2/epayment/lookup/",
        { pidx },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          },
        }
      );
    } catch (error) {
      console.error(
        "Khalti verification API call failed:",
        error.response?.data || error.message
      );
      return res.status(400).json({
        success: false,
        message: "Failed to connect to Khalti payment service",
        error: error.response?.data || error.message,
      });
    }

    const khaltiData = khaltiResponse.data;

    if (!khaltiResponse.data || !khaltiResponse.data.status) {
      console.error("Khalti verification error:", khaltiData);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        error: khaltiData,
      });
    }

    // Find order by pidx
    const order = await Order.findOne({ pidx });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this payment",
      });
    }

    // Verify that the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to verify this payment",
      });
    }

    // Check payment status
    if (khaltiData.status === "Completed") {
      // Payment successful
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: khaltiData.transaction_id,
        status: "completed",
        update_time: new Date().toISOString(),
        email_address: req.user.email,
        transaction_id: khaltiData.transaction_id,
        payment_method: "khalti",
        pidx: khaltiData.pidx,
        total_amount: khaltiData.total_amount,
      };

      await order.save();

      res.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          order,
          payment_status: khaltiData.status,
          transaction_id: khaltiData.transaction_id,
        },
      });
    } else {
      // Payment not completed
      res.json({
        success: false,
        message: `Payment status: ${khaltiData.status}`,
        data: {
          order,
          payment_status: khaltiData.status,
        },
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
});

// @desc    Handle Khalti payment callback
// @route   GET /api/orders/payment-callback
// @access  Public
router.get("/payment-callback", async (req, res) => {
  try {
    const {
      pidx,
      status,
      transaction_id,
      tidx,
      amount,
      mobile,
      purchase_order_id,
      purchase_order_name,
      total_amount,
    } = req.query;

    console.log("Payment callback received:", req.query);

    // Find order by purchase_order_id
    const order = await Order.findById(purchase_order_id);
    if (!order) {
      console.error("Order not found for callback:", purchase_order_id);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order with callback data
    order.paymentResult = {
      id: transaction_id || "CALLBACK",
      status: status.toLowerCase(),
      update_time: new Date().toISOString(),
      email_address: order.shippingAddress?.email,
      transaction_id: transaction_id,
      payment_method: "khalti",
      pidx: pidx,
      total_amount: total_amount,
      mobile: mobile,
    };

    // Mark as paid if status is Completed
    if (status === "Completed") {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();

    // Redirect to frontend with status
    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/payment/result?status=${status}&orderId=${purchase_order_id}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Payment callback error:", error);
    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/payment/result?status=error`;
    res.redirect(redirectUrl);
  }
});

// @desc    Update order status (Admin only)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
router.patch("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: pending, confirmed, shipped, delivered, cancelled",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order status
    order.status = status;

    // Update additional fields based on status
    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === "cancelled") {
      order.isDelivered = false;
      order.deliveredAt = null;
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Order status update error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Initiate eSewa payment
// @route   POST /api/orders/initiate-esewa
// @access  Private
router.post("/initiate-esewa", protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }
    // eSewa payment params
    const amt = order.itemsPrice;
    const psc = 0; // service charge
    const pdc = 0; // delivery charge
    const txAmt = 0; // tax amount
    const tAmt = amt + psc + pdc + txAmt;
    const pid = order._id.toString();
    const scd = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST"; // Sandbox merchant code
    const su = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/payment/result?payment=esewa&status=success&oid=${pid}`;
    const fu = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/payment/result?payment=esewa&status=failure&oid=${pid}`;
    // eSewa payment URL
    const payment_url = `https://rc-epay.esewa.com.np/api/epay/main?amt=${amt}&pdc=${pdc}&psc=${psc}&txAmt=${txAmt}&tAmt=${tAmt}&pid=${pid}&scd=${scd}&su=${encodeURIComponent(
      su
    )}&fu=${encodeURIComponent(fu)}`;
    res.json({
      success: true,
      data: {
        order,
        payment_url,
      },
    });
  } catch (error) {
    console.error("eSewa initiation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate eSewa payment" });
  }
});

// @desc    Verify eSewa payment (demo: mark as paid if not already)
// @route   POST /api/orders/verify-esewa
// @access  Private
router.post("/verify-esewa", protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to verify this payment",
      });
    }
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: orderId,
        status: "completed",
        update_time: new Date().toISOString(),
        email_address: req.user.email,
        payment_method: "esewa",
      };
      await order.save();
    }
    res.json({
      success: true,
      message: "eSewa payment verified and order marked as paid",
    });
  } catch (error) {
    console.error("eSewa verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify eSewa payment" });
  }
});

export default router;

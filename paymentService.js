const axios = require("axios");
const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Initiates a Stripe Payment Intent.
 * @param {object} cart - The user's cart object.
 * @param {boolean} couponApplied - Whether a coupon is applied.
 * @returns {object} The payment intent client secret and payable amount.
 */
exports.initiateStripePayment = async (cart, couponApplied) => {
  let finalAmount = 0;
  if (couponApplied && cart.totalAfterDiscount) {
    finalAmount = Math.round(cart.totalAfterDiscount * 100);
  } else {
    finalAmount = Math.round(cart.cartTotal * 100);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "usd",
    metadata: {
      cartId: cart._id.toString(),
      userId: cart.orderedBy.toString(),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    payable: finalAmount / 100,
  };
};

/**
 * Initiates a Paymob payment and returns a redirect URL.
 * @param {object} cart - The user's cart object.
 * @param {object} user - The user object.
 * @param {boolean} couponApplied - Whether a coupon is applied.
 * @returns {string} The redirect URL for Paymob payment iframe.
 */
exports.initiatePaymobPayment = async (cart, user, couponApplied) => {
  // 1. Authentication Request
  const { data: auth } = await axios.post(
    "https://accept.paymob.com/api/auth/tokens",
    {
      api_key: process.env.PAYMOB_API_KEY,
    },
  );
  const token = auth.token;

  // 2. Order Registration Request
  let finalAmount =
    couponApplied && cart.totalAfterDiscount
      ? cart.totalAfterDiscount
      : cart.cartTotal;

  const orderItems = cart.products.map((item) => ({
    name: item.product.name,
    amount_cents: item.price * 100,
    description: "Product",
    quantity: item.count,
  }));

  const { data: order } = await axios.post(
    "https://accept.paymob.com/api/ecommerce/orders",
    {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: finalAmount * 100,
      currency: "EGP",
      merchant_order_id: cart._id.toString(),
      items: orderItems,
    },
  );

  // 3. Payment Key Request
  const { data: paymentKey } = await axios.post(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      auth_token: token,
      amount_cents: finalAmount * 100,
      expiration: 3600,
      order_id: order.id,
      billing_data: {
        email: user.email,
        first_name: user.name.split(" ")[0],
        last_name: user.name.split(" ").slice(1).join(" ") || "N/A",
        phone_number: "+201234567890", // Placeholder
        street: user.address || "N/A",
        city: "N/A",
        country: "EG",
      },
      currency: "EGP",
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    },
  );

  return `https://accept.paymob.com/api/acceptance/iframes/839169?payment_token=${paymentKey.token}`;
};

/**
 * Initiates a Fawry payment and returns a redirect URL.
 * @param {object} cart - The user's cart object.
 * @param {object} user - The user object.
 * @param {boolean} couponApplied - Whether a coupon is applied.
 * @returns {string} The redirect URL for Fawry payment page.
 */
exports.initiateFawryPayment = async (cart, user, couponApplied) => {
  const merchantCode = process.env.FAWRY_MERCHANT_CODE;
  const securityKey = process.env.FAWRY_SECURITY_KEY;
  const merchantRefNum = cart._id.toString();

  const cartItems = cart.products.map((item) => ({
    itemId: item.product._id.toString(),
    description: item.product.name,
    price: item.price,
    quantity: item.count,
  }));

  let finalAmount =
    couponApplied && cart.totalAfterDiscount
      ? cart.totalAfterDiscount
      : cart.cartTotal;

  // Set payment to expire in 1 hour
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);

  const signatureBody = `${merchantCode}${merchantRefNum}${user._id.toString()}${JSON.stringify(cartItems)}${finalAmount.toFixed(2)}${securityKey}`;
  const signature = crypto
    .createHash("sha256")
    .update(signatureBody)
    .digest("hex");

  const chargeRequest = {
    merchantCode,
    merchantRefNum,
    customerMobile: "01234567890", // Placeholder
    customerEmail: user.email,
    customerName: user.name,
    customerProfileId: user._id.toString(),
    paymentExpiry: expiry.getTime(),
    chargeItems: cartItems,
    returnUrl: "http://localhost:3000/profile", // Your frontend return URL
    authCaptureModePayment: false,
    paymentMethod: "CARD",
    signature,
  };

  const { data } = await axios.post(
    `${process.env.FAWRY_HOST}/ECommerceWeb/Fawry/payments/charge`,
    chargeRequest,
  );

  return data.redirectionUrl;
};

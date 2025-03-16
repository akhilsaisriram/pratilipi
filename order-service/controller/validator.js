const mongoose = require('mongoose');

exports.validator = (orderData) => {
  const { userId, products, totalPrice, address, contactNumber, estimatedDelivery, paymentMethod, orderStatus } = orderData;

  let errors = [];

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    errors.push({ field: "userId", message: "Invalid or missing userId" });
  }

  if (!Array.isArray(products) || products.length === 0) {
    errors.push({ field: "products", message: "At least one product is required" });
  } else {
    products.forEach((product, index) => {
      if (!product.productId || !mongoose.Types.ObjectId.isValid(product.productId)) {
        errors.push({ field: `products[${index}].productId`, message: "Invalid or missing productId" });
      }
      if (!product.name || typeof product.name !== "string") {
        errors.push({ field: `products[${index}].name`, message: "Product name is required and must be a string" });
      }
      if (!product.company || typeof product.company !== "string") {
        errors.push({ field: `products[${index}].company`, message: "company name is required and must be a string" });
      }
      if (!product.category || typeof product.category !== "string") {
        errors.push({ field: `products[${index}].category`, message: "category name is required and must be a string" });
      }
      if (!product.subcategory || typeof product.subcategory !== "string") {
        errors.push({ field: `products[${index}].subcategory`, message: "subcategory name is required and must be a string" });
      }
      if (!product.quantity || typeof product.quantity !== "number" || product.quantity < 1) {
        errors.push({ field: `products[${index}].quantity`, message: "Quantity must be at least 1" });
      }
      if (!product.price || typeof product.price !== "number" || product.price < 0.01) {
        errors.push({ field: `products[${index}].price`, message: "Price must be a positive number" });
      }
    });
  }

  if (typeof totalPrice !== "number" || totalPrice < 0) {
    errors.push({ field: "totalPrice", message: "Total price must be a positive number" });
  }

  if (!address || typeof address !== "string") {
    errors.push({ field: "address", message: "Address is required and must be a string" });
  }

  if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
    errors.push({ field: "contactNumber", message: "Invalid contact number, must be 10 digits" });
  }

  if (!estimatedDelivery || isNaN(new Date(estimatedDelivery).getTime())) {
    errors.push({ field: "estimatedDelivery", message: "Invalid estimated delivery date" });
  }

  const validPaymentMethods = ['credit_card', 'debit_card', 'upi', 'cod', 'netbanking', 'wallet'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    errors.push({ field: "paymentMethod", message: "Invalid payment method" });
  }

  const validOrderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!orderStatus || !validOrderStatuses.includes(orderStatus)) {
    errors.push({ field: "orderStatus", message: "Invalid order status" });
  }

  return errors;
};


exports.validateorderupdate = (updates) => {
  const errors = [];

  const allowedFields = [
    "products",
    "totalPrice",
    "address",
    "contactNumber",
    "estimatedDelivery",
    "isDelivered",
    "deliveryDate",
    "paymentMethod",
    "isPaid",
    "paymentTime",
    "transactionId",
    "orderStatus"
  ];

  Object.keys(updates).forEach((key) => {
    if (!allowedFields.includes(key)) {
      errors.push({ field: key, message: "Invalid field in request body" });
    }
  });

  if (updates.products) {
    if (!Array.isArray(updates.products) || updates.products.length === 0) {
      errors.push({ field: "products", message: "Products must be a non-empty array" });
    } else {
      updates.products.forEach((product, index) => {
        if (!product.productId || !mongoose.Types.ObjectId.isValid(product.productId)) {
          errors.push({ field: `products[${index}].productId`, message: "Invalid or missing productId" });
        }
        if (!product.name || typeof product.name !== "string") {
          errors.push({ field: `products[${index}].name`, message: "Product name is required and must be a string" });
        }
        if (!product.company || typeof product.company !== "string") {
          errors.push({ field: `products[${index}].company`, message: "company name is required and must be a string" });
        }
        if (!product.category || typeof product.category !== "string") {
          errors.push({ field: `products[${index}].category`, message: "category name is required and must be a string" });
        }
        if (!product.subcategory || typeof product.subcategory !== "string") {
          errors.push({ field: `products[${index}].subcategory`, message: "subcategory name is required and must be a string" });
        }
        if (!product.quantity || typeof product.quantity !== "number" || product.quantity < 1) {
          errors.push({ field: `products[${index}].quantity`, message: "Quantity must be at least 1" });
        }
        if (!product.price || typeof product.price !== "number" || product.price < 0.01) {
          errors.push({ field: `products[${index}].price`, message: "Price must be a positive number" });
        }
      });
    }
  }

  if (updates.totalPrice !== undefined && (typeof updates.totalPrice !== "number" || updates.totalPrice < 0)) {
    errors.push({ field: "totalPrice", message: "Total price must be a positive number" });
  }

  if (updates.address !== undefined && typeof updates.address !== "string") {
    errors.push({ field: "address", message: "Address must be a string" });
  }

  if (updates.contactNumber !== undefined && !/^\d{10}$/.test(updates.contactNumber)) {
    errors.push({ field: "contactNumber", message: "Invalid contact number, must be 10 digits" });
  }

  if (updates.estimatedDelivery !== undefined && isNaN(new Date(updates.estimatedDelivery).getTime())) {
    errors.push({ field: "estimatedDelivery", message: "Invalid estimated delivery date" });
  }

  if (updates.isDelivered !== undefined && typeof updates.isDelivered !== "boolean") {
    errors.push({ field: "isDelivered", message: "isDelivered must be a boolean" });
  }

  if (updates.deliveryDate !== undefined && isNaN(new Date(updates.deliveryDate).getTime())) {
    errors.push({ field: "deliveryDate", message: "Invalid delivery date" });
  }

  const validPaymentMethods = ['credit_card', 'debit_card', 'upi', 'cod', 'netbanking', 'wallet'];
  if (updates.paymentMethod !== undefined && !validPaymentMethods.includes(updates.paymentMethod)) {
    errors.push({ field: "paymentMethod", message: "Invalid payment method" });
  }

  if (updates.isPaid !== undefined && typeof updates.isPaid !== "boolean") {
    errors.push({ field: "isPaid", message: "isPaid must be a boolean" });
  }

  if (updates.paymentTime !== undefined && isNaN(new Date(updates.paymentTime).getTime())) {
    errors.push({ field: "paymentTime", message: "Invalid payment time" });
  }

  if (updates.transactionId !== undefined && typeof updates.transactionId !== "string") {
    errors.push({ field: "transactionId", message: "Transaction ID must be a string" });
  }

  const validOrderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (updates.orderStatus !== undefined && !validOrderStatuses.includes(updates.orderStatus)) {
    errors.push({ field: "orderStatus", message: "Invalid order status" });
  }

  return errors;
};



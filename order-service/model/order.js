const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required:true
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required:true
    },
    company: {
      type: String,
      required:true
    },
    quantity: {
      type: Number,
      required:true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
   },
    subcategory: {
      type: String,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required:true
  },
  address: {
    type: String,
    required:true
  },
  contactNumber: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Adds 3 days
    }  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveryDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'upi', 'cod', 'netbanking', 'wallet']
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  sendnotification: {
    type: Boolean,
    default: true
  },
  paymentTime: {
    type: Date
  },
  transactionId: {
    type: String
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

OrderSchema.methods.calculateTotalPrice = function() {
  return this.products.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

module.exports = mongoose.model('Order', OrderSchema);

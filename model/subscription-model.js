import mongoose, { Schema } from "mongoose";

const PaymentMethodSchema = new Schema({
  type: { type: String, required: true }, // Always 'card' in your case
  brand: { type: String, required: true }, // e.g., 'visa', 'mastercard'
  last4: { type: String, required: true }, // e.g., '4242'
}, { _id: false }); // Disable _id for embedded subdocs

const SubscriptionSchema = new Schema({
  user_id: { type: String, required: true, index: true },
  email: { type: String, required: true },
  customerId: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  priceId: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'canceled', 'past_due', 'trialing'],
    default: 'inactive'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  amount: {type: Number},
  current_period_start: { type: Date },
  current_period_end: { type: Date },
  cancel_at_period_end: { type: Boolean, default: false },
  paymentMethod: { type: PaymentMethodSchema, required: false }, // Optional field
}, { timestamps: true });

export const Subscription =
  mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);

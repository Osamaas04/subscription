import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema({
  user_id: { type: String, required: true, index: true },
  email: { type: String, required: true },
  customerId: { type: String, required: true },       
  subscriptionId: { type: String, required: true },   
  priceId: { type: String, required: true },          
  status: { type: String, enum: ['active', 'inactive', 'canceled', 'past_due', 'trialing'], default: 'inactive' },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  current_period_start: { type: Date },
  current_period_end: { type: Date },
  cancel_at_period_end: { type: Boolean, default: false },
}, { timestamps: true });

export const Subscription =
  mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);

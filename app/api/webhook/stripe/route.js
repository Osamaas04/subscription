import Stripe from "stripe";
import { dbConnect } from "@/lib/mongo";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Subscription } from "@/model/subscription-model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const plans = [
  {
    title: "Starter AI",
    price: "$29",
    priceId: "price_1RFvvlFkqathCLJmjPaoRSCb",
    billing: "mo",
  },
  {
    title: "Pro AI",
    price: "$59",
    priceId: "price_1RFvwRFkqathCLJmal7eJ6z5",
    billing: "mo",
  },
  {
    title: "Enterprise AI",
    price: "$99",
    priceId: "price_1RFvwzFkqathCLJmGNdYcGO9",
    billing: "mo",
  },
  {
    title: "Starter AI",
    price: "$290",
    priceId: "price_1RFvyAFkqathCLJm7au2D00K",
    billing: "ann",
  },
  {
    title: "Pro AI",
    price: "$590",
    priceId: "price_1RFvyjFkqathCLJmERiWYgVA",
    billing: "ann",
  },
  {
    title: "Enterprise AI",
    price: "$990",
    priceId: "price_1RFvyxFkqathCLJmZMjK5Wsx",
    billing: "ann",
  },
];

export const POST = async (request) => {
  await dbConnect();

  const body = await request.text();

  const signature = headers().get("stripe-signature");

  let data;
  let eventType;
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.log(`Webhook signature verification failed ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  data = event.data;
  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const session = await stripe.checkout.sessions.retrieve(data.object.id, {
          expand: ["line_items", "customer"],
        });

        const { metadata, customer, subscription } = session;
        const user_id = metadata?.user_id;
        const customer_details = session.customer_details;

        if (!user_id) {
          console.error("Missing user_id in metadata");
          throw new Error("Missing user_id in metadata");
        }

        const email = customer_details?.email;
        const priceId = session.line_items.data[0].price.id;
        const plan = plans.find((p) => p.priceId === priceId);
        const subscriptionId = session.subscription;

        if (!plan || !email || !subscriptionId) {
          console.error("Invalid session data");
          throw new Error("Invalid session data");
        }

        const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);

        console.log(subscriptionDetails)
        console.log(subscriptionDetails.current_period_start * 1000)
        console.log(subscriptionDetails.current_period_end * 1000)

        await Subscription.findOneAndUpdate(
          { user_id },
          {
            user_id,
            email,
            customerId: customer.id,
            subscriptionId,
            priceId,
            status: "active",
            billingCycle: plan.billing === "mo" ? "monthly" : "annual",
            current_period_start: new Date(subscriptionDetails.current_period_start * 1000),
            current_period_end: new Date(subscriptionDetails.current_period_end * 1000),
            cancel_at_period_end: subscriptionDetails.cancel_at_period_end,
          },
          { upsert: true, new: true }
        );

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;

        const newPriceId = subscription.items.data[0].price.id;
        const plan = plans.find((p) => p.priceId === newPriceId);

        await Subscription.updateOne(
          { subscriptionId: subscription.id },
          {
            status: subscription.status,
            priceId: newPriceId,
            billingCycle: plan?.billing === "mo" ? "monthly" : "annual",
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }
        );

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const userSub = await Subscription.findOne({ subscriptionId: subscription.id });

        if (!userSub) {
          console.warn("No matching subscription record found.");
          break;
        }

        await Subscription.updateOne(
          { subscriptionId: subscription.id },
          {
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000),
            current_period_start: new Date(subscription.current_period_start * 1000),
          }
        );

        break;
      }


    }
  } catch (error) {
    console.error(
      "stripe error: " + error.message + " | EVENT TYPE: " + eventType
    );
  }

  return NextResponse.json({});
};

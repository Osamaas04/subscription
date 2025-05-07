import Stripe from "stripe";
import { getUserFromToken } from "@/utils/getUserFromToken";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Subscription } from "@/model/subscription-model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
    try {
      const { id: user_id } = getUserFromToken(request);
  
      if (!user_id) {
        return NextResponse.json(
          { error: "Unauthorized: User token not found" },
          { status: 401 }
        );
      }
  
      await dbConnect();
  
      const plan = await Subscription.findOne({ user_id });
  
      if (!plan || !plan.customerId) {
        return NextResponse.json(
          { error: "Subscription or customer ID not found" },
          { status: 404 }
        );
      }
  
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: plan.customerId,
        return_url: "https://replix.space/dashboard?menu=Account",
      });
  
      return NextResponse.redirect(portalSession.url);
    } catch (error) {
      console.error("Stripe portal error:", error);
      return NextResponse.json(
        { error: "Failed to create billing portal session" },
        { status: 500 }
      );
    }
  }

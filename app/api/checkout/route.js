import { getUserIdFromToken } from "@/utils/getUserIdFromToken";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    const { priceId } = await request.json();
    const user_id = getUserIdFromToken(request);
  
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        user_id 
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    });
  
    return NextResponse.json({ url: session.url });
  }
  
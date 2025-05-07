import { getUserFromToken } from "@/utils/getUserFromToken";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Subscription } from "@/model/subscription-model";

export async function GET(request) {
  try {
    const { id: user_id } = getUserFromToken(request);

    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized: User token not found" }, { status: 401 });
    }

    await dbConnect();

    const plan = await Subscription.findOne({ user_id });

    if (!plan) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const { billingCycle, current_period_end, paymentMethod, priceId } = plan;

    return NextResponse.json({ billingCycle, current_period_end, paymentMethod, priceId }, { status: 200 });

  } catch (error) {
    console.error("Error retrieving subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

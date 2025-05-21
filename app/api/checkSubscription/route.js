import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Subscription } from "@/model/subscription-model";

export const GET = async (request) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 400 });
    }

    await dbConnect();

    const subscription = await Subscription.findOne({ email });

    if (!subscription) {
      return NextResponse.json({ status: "no_subscription" }, { status: 200 });
    }

    if (subscription.status === "inactive") {
      return NextResponse.json({ status: "inactive" }, { status: 200 });
    }

    return NextResponse.json({ status: "active" }, { status: 200 });
  } catch (error) {
    console.error("CheckToken error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

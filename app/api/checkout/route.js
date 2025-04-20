import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });
  
    return NextResponse.json({ url: session.url });
  }
  
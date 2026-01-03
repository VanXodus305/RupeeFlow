import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";

export async function GET(req) {
  try {
    const session = await auth();

    await connectDB();

    let operators;

    if (session?.user?.isDemo) {
      operators = await Operator.find({ stationName: "Demo Charging Station" })
        .select(
          "_id stationName stationAddress ratePerKwh chargerPower totalEnergyDelivered totalRevenue walletAddress"
        )
        .lean();
    } else {
      operators = await Operator.find({})
        .select(
          "_id stationName stationAddress ratePerKwh chargerPower totalEnergyDelivered totalRevenue walletAddress"
        )
        .lean();
    }

    return Response.json(operators);
  } catch (error) {
    console.error("Error fetching operators:", error);
    return Response.json(
      { error: "Failed to fetch operators" },
      { status: 500 }
    );
  }
}

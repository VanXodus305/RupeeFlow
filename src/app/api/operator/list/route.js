import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";
import Station from "@/models/Station";

export async function GET(req) {
  try {
    const session = await auth();

    await connectDB();

    let operators;

    if (session?.user?.isDemo) {
      operators = await Operator.find({})
        .select("_id walletAddress stations totalEnergyDelivered totalRevenue")
        .populate({
          path: "stations",
          select: "_id stationName stationAddress chargerPower ratePerKwh",
        })
        .lean();
    } else {
      operators = await Operator.find({})
        .select("_id walletAddress stations totalEnergyDelivered totalRevenue")
        .populate({
          path: "stations",
          select: "_id stationName stationAddress chargerPower ratePerKwh",
        })
        .lean();
    }

    // Flatten the response: return each station as a separate item with operator info
    const flattenedOperators = operators.flatMap((operator) => {
      if (operator.stations && operator.stations.length > 0) {
        return operator.stations.map((station) => ({
          _id: station._id,
          operatorId: operator._id,
          stationName: station.stationName,
          stationAddress: station.stationAddress,
          chargerPower: station.chargerPower,
          ratePerKwh: station.ratePerKwh,
        }));
      }
      return [];
    });

    return Response.json(flattenedOperators);
  } catch (error) {
    console.error("Error fetching operators:", error);
    return Response.json(
      { error: "Failed to fetch operators" },
      { status: 500 }
    );
  }
}

import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../[...nextauth]/route";
import Operator from "@/models/Operator";
import Station from "@/models/Station";
import { ObjectId } from "mongodb";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "operator") {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { stationName, stationAddress, chargerPower, ratePerKwh } =
      await request.json();
    const { id: stationId } = params;

    if (!stationName || !stationAddress || !chargerPower || !ratePerKwh) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    const operator = await Operator.findOne({
      userId: session.user.id,
    });

    if (!operator) {
      return new Response(
        JSON.stringify({ message: "Operator not found" }),
        { status: 404 }
      );
    }

    const station = await Station.findById(stationId);

    if (!station || station.operatorId.toString() !== operator._id.toString()) {
      return new Response(
        JSON.stringify({ message: "Station not found" }),
        { status: 404 }
      );
    }

    station.stationName = stationName;
    station.stationAddress = stationAddress;
    station.chargerPower = parseFloat(chargerPower);
    station.ratePerKwh = parseFloat(ratePerKwh);

    await station.save();

    const populatedOperator = await Operator.findById(operator._id).populate({
      path: "stations",
      select:
        "stationName stationAddress chargerPower ratePerKwh totalEnergyDelivered totalRevenue chargingSessions",
    });

    return new Response(
      JSON.stringify({
        message: "Station updated successfully",
        operator: populatedOperator,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating station:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

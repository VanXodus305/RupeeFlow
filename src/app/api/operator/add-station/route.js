import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";
import Operator from "@/models/Operator";
import Station from "@/models/Station";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "operator") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectDB();

    const { stationName, stationAddress, chargerPower, ratePerKwh } =
      await request.json();

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
      return new Response(JSON.stringify({ message: "Operator not found" }), {
        status: 404,
      });
    }

    const newStation = new Station({
      operatorId: operator._id,
      stationName,
      stationAddress,
      chargerPower: parseFloat(chargerPower),
      ratePerKwh: parseFloat(ratePerKwh),
      totalEnergyDelivered: 0,
      totalRevenue: 0,
      chargingSessions: [],
    });

    await newStation.save();

    operator.stations.push(newStation._id);
    await operator.save();

    const populatedOperator = await Operator.findById(operator._id).populate({
      path: "stations",
      select:
        "stationName stationAddress chargerPower ratePerKwh totalEnergyDelivered totalRevenue chargingSessions",
    });

    return new Response(
      JSON.stringify({
        message: "Station created successfully",
        operator: populatedOperator,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding station:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

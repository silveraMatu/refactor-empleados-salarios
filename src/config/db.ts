import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/employees_db";
    await mongoose.connect(MONGO_URI);
    console.log("Se conectó exitosamente con MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

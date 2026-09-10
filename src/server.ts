import { app } from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`App escuchando corriendo localhost:${PORT}`);
});

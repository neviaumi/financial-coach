import { factory } from "./app-factory.ts";
import statementsHandlers from "./statements/handlers.ts";

const app = factory.createApp();
app.route("/api/statements/", statementsHandlers);

export default app;

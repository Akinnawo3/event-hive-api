import App from "./app";
import AuthRoutes from "./routes/auth";
import "dotenv/config";
require("express-async-errors");

const app = new App([new AuthRoutes()]).listen();

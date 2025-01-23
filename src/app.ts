import express from "express";
import ConnectDb from "./db/connect";
import IRoutes from "./interfaces/routes.interface";
import errorHandlerMiddleware from "./middlewares/error-handler";

class App {
  public app: express.Application;
  public port: string | number;
  public env: boolean;

  // constructor(routes: Routes[]) {
  constructor(routes: IRoutes[]) {
    this.app = express();
    this.port = process.env.PORT || 3003;
    this.env = process.env.NODE_ENV === "production" ? true : false;
    //   this.connectToDatabase();
    this.initializeMiddlewares();
    //   this.initSwaggerDocs();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // if (this.env) {
    //   this.app.use(hpp());
    //   this.app.use(helmet());
    //   this.app.use(logger("combined"));
    //   this.app.use(cors({ origin: "your.domain.com", credentials: true }));
    // } else {
    //   this.app.use(logger("dev"));
    //   this.app.use(cors({ origin: true, credentials: true }));
    // }
    this.app.use(express.json());
    // this.app.use(express.urlencoded({ extended: true }));
  }
  private initializeErrorHandling() {
    this.app.use(errorHandlerMiddleware);
  }

  public async listen() {
    // console.log(process.env.MONGO_URI);
    try {
      await new ConnectDb().connectDb(process.env.MONGO_URI);
      this.app.listen(this.port, () => console.log(`Server is listening on port ${this.port}...`));
    } catch (error) {
      console.log(error);
    }
  }

  private initializeRoutes(routes: IRoutes[]) {
    routes.forEach((route) => {
      this.app.use(route.path, route.router);
    });
  }
}

export default App;

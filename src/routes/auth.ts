import { Router } from "express";
import Route from "../interfaces/routes.interface";
import AuthController from "../controllers/auth";

class AuthRoutes implements Route {
  public path = "/auth";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/signup`, new AuthController().signup);
    this.router.get(`/login`, new AuthController().login);
  }
}

export default AuthRoutes;

import mongoose from "mongoose";


class ConnectDb {
  public connectDb(url?: string) {
    if (url) return mongoose.connect(url);
  }
}

export default ConnectDb;

class CustomApiError extends Error {
  public statusCode: number;
  constructor(meesage: string, statusCode: number) {
    super(meesage);
    this.statusCode = statusCode;
  }
}

export default CustomApiError;

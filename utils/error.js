export const createError = (message = "serverError",status = 500) => {
    const err = new Error(message);
    err.statusCode = status;
    return err;
}
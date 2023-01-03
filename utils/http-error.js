class HttpError extends Error {
    constructor(message, success,  errorCode){
        super(message);
        this.success = success;
        this.code = errorCode;
    }
}

module.exports = HttpError;
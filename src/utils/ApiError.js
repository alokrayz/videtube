// api eroor bhi baar baar aa rhi h toh iska constructor bnake baart baar use kr lengecatch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
// express hm custom error create krne k liye class ka use kr skte h jo error class ko extend krta h

class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors= [],
        stack= ""  
        
    ){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        
        if(stack){
            this.stack = stack;
        } else{
            Error.captureStackTrace(this, this.constructor);
        }
}
}

export {ApiError};
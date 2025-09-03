class ApiResponse {

    statusCode:number
    data?:string|object
    message:string
    success: boolean
    
    constructor(statusCode:number, data:string|object, message: string = "Success") {
        // Initializes a new instance of ApiResponse with the provided statusCode, data, and message.
        this.statusCode = statusCode;
        // Sets the status code (e.g., 200 for success, 404 for not found).
        
        this.data = data;
        // Sets the data, which is the actual response payload (e.g., user information, list of items).
        
        this.message = message;
        // Sets a message to describe the response, defaulting to "Success" if none is provided.
        
        this.success = statusCode < 400;
        // Sets the success property to true if the status code is less than 400 (indicating a successful response),
        // and false otherwise. This means that any status code of 400 or higher is considered an error.
    }
}

export { ApiResponse }
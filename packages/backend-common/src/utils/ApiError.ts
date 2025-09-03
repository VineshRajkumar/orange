class ApiError extends Error {
    statusCode:number
    data?:string|null
    success:boolean
    errors:string[]|Record<string, string>[]

    // This line defines a new class called ApiError that inherits from the built-in Error class.
    constructor(statusCode:number, message:string = "Something went wrong", errors: string[]|Record<string, string>[] = [], stack ?: string) { 
        // This line defines the constructor for the ApiError class.
        // The constructor takes four parameters:
        // - statusCode: the HTTP status code (required), eg - 404, 500 gives the error code
        // - message: an optional error message with a default value.
        // - errors: an optional array of error details with a default value.
        // - stack: an optional stack trace with a default value,  which fucntions it called and led to that error
        super(message);
        // This line calls the parent class (Error) constructor with the message parameter.

        this.statusCode = statusCode;
        // This line sets the statusCode property to the provided statusCode value.

        this.data = null;
        // This line initializes the data property to null.

        this.message = message;
        // This line sets the message property to the provided message value.

        this.success = false;
        // This line sets the success property to false.

        this.errors = errors;
        // This line sets the errors property to the provided errors array.

        if (stack) {
            this.stack = stack;
            // If a stack trace is provided, set the stack property to the provided stack trace.
        } else {
            Error.captureStackTrace(this, this.constructor);
            // If no stack trace is provided, capture the current stack trace and set it to the stack property.
        }

        /* Why use Object.setPrototypeOf :- 

        Short ans :- To properly link it to built in Error class

        Long Ans :- 
        i) What is prototype ? 
            Every object in JavaScript has a prototype, which 
            is another object that it inherits from. When you 
            access a property or method on an object, JavaScript 
            first looks for it on the object itself. If it's not 
            found there, it searches the object's prototype and 
            then the prototype's prototype, and so on, up the 
            prototype chain until it's found or the end of the 
            chain is reached.
            You can see this prototype chain in Array, String 
            since .length() and some other extra prototype link 
            with Array and String. 

        ii) To set prototype for a Object :- 
            
            Syntax - Object.setPrototypeof(object_that_wants_to_use, object_that_will_give ) 
        
        iii) Why use Object.setPrototypeOf(this, ApiError.prototype)?
            
            When extending built-in classes like Error, 
            JavaScript sometimes doesn't set up the 
            inheritance chain properly. This line 
            manually fixes it so that:

                a) instanceof ApiError works correctly (means it is is properly linked)

                b) The object is recognized as an ApiError

                c) Stack traces and debugging behave as expected

            It's not separating from the parent — it's making 
            sure the child class is properly linked to the parent.
        
        */
    
            //This tells JavaScript:
            // "Hey, this this object you're constructing 
            // — make sure it's treated like an ApiError."
            
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    
}

export  { ApiError };
// This line exports the ApiError class so it can be used in other files.

import {z,ZodError} from 'zod'

export const zodErrorFormat = (error:ZodError) => {

    const formatted: Record<string,string> = {}

    error.issues.forEach(element => {
        const field = element.path.join('.') //join is done to convert to redable format like user.email 
        formatted[field] = element.message
    });

    return formatted
}
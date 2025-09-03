import { z } from "zod";

const reservedUsernames = ['admin', 'support', 'root', 'help', 'contact', 'about', 'orange', 'orangeboard'];
const commonPasswords = ['123456' , 'password','admin','qwerty']

const usernameField =  z
        .string()
        .toLowerCase()
        .min(4, { message: 'Username  must be at least 4 characters' })
        .max(15, { message: 'Username must be at most 15 characters' })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: "Username can only contain letters, numbers, and underscores",
        })
        .refine((val) => !reservedUsernames.includes(val.toLowerCase()), {
            message: 'This username is reserved. Please choose another one.',
        })

const emailField = z
        .string()
        .min(1, { message: 'Please enter an email address' })
        .email({ message: 'Please enter a valid email address' })
        .refine( (email) => {
            const domain = email.split('@')[1];
            return domain === 'gmail.com' || domain === 'googlemail.com' || domain === 'yahoo.com';
        },{ message: "Email must be from Gmail or Yahoo"})

const  passwordField = z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(64, { message: 'Password must be at most 64 characters'})
        .regex(/^(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*])[a-zA-Z0-9@#$%^&*]+$/, {
            message: 'Password must contain at least one lowercase letter, one number, and one special character (@#$%^&*)',
        })
        .refine( (val) => !commonPasswords.includes(val),{
             message: 'Common Passwords are not allowed',
        })


export const registerUserZodSchema = z.object({
    username: usernameField,
    email: emailField,
    password: passwordField
})

export const loginUserZodSchema = z
    .object({
        username: usernameField.optional(),
        email: emailField.optional(),
        password: passwordField,
    })
    .refine((data) => data.username || data.email, {
        message: "Either username or email is required",
        path: ["email"], // If the .refine() fails (i.e., both username and email are missing), attach the error to the email field in the error object.
    });

export const changeCurrentPasswordZodSchema = z
    .object({
        oldpassword: passwordField,
        newpassword: passwordField
    })

export const updateAccountDetailsZodSchema = z
    .object({
        username: usernameField,
        email: emailField
    })
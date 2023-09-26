//CONTROLLER
//import config from 'config';
import express from 'express'   //import from fw
import asyncHandler from 'express-async-handler'
import Joi from 'joi'
import valid from '../middleware/valid.mjs';
import { validate } from '../middleware/validation.mjs';
import UsersService from '../service/UsersService.mjs';
import authVerification from '../middleware/authVerification.mjs';
export const users = express.Router();  //create router
//const usersService = new UsersService(process.env.ATLAS_URI_COMPANY_TEST, config.get('mongodb.db'));
const usersService = new UsersService();
//const usersService = new UsersService("mongodb+srv://root:12345.com@cluster0.d19qlu2.mongodb.net/users?retryWrites=true&w=majority", config.get('mongodb.db'));
const schema = Joi.object({
    username: Joi.string().email().required(),
    password: Joi.string().min(5).max(10).required(),
    roles: Joi.array().items(Joi.string().valid('ADMIN', 'USER')).required()
})
users.use(validate(schema))

users.post('/signup', valid, asyncHandler (async (req, res) => {    //regiser routing '/signup' (add users)
   
    
    const accountRes = await usersService.addAccount(req.body);
    if (accountRes == null) {
        res.status(400);
        throw `account ${req.body.username} already exists`
    }
    res.status(201).send(accountRes);

}));

users.get("/:username", authVerification("ADMIN", "USER"), asyncHandler(
    async (req, res) => {
        const username = req.params.username;
        const account = await usersService.getAccount(username);
        if (!account) {
            res.status(404);
            throw `account ${username} not found`
        }
        res.send(account);
    }
));
users.post("/signin", asyncHandler(
    async (req, res) => {
        const loginData = req.body;
        const accessToken = await usersService.login(loginData);
        if (!accessToken) { //undefined
            res.status(400);
            throw `wrong credentials`
        }
        res.send({accessToken})   //Js object
    }
))
import { mockUsers } from "../utils/constants.mjs";
import { validationResult,matchedData } from "express-validator";
import { hashPassword } from "../utils/helpers.mjs";
import { User } from "../mongoose/schemas/user.mjs";


export const getUserByIdHandler = (request, response) => {
    console.log(`inside getUsers by ID with middleware route`);
    const { findUserIndex } = request;
    const findUser = mockUsers[findUserIndex];
    if (!findUser) return response.sendStatus(404);
    return response.send(findUser);
}


export const createUserHandler = async (request, response) => //modified code to save data to DB
{
    // console.log(`inside post-users route`);
    const result = validationResult(request);
    if (!result.isEmpty())
        return response.status(400).send(result.array());
    const data = matchedData(request);
    // console.log(data);      //before hashing
    data.password = hashPassword(data.password); //Appling hashing in the user inputs for password
    // console.log(data);  //after hashing

    const newUser = new User(data);
    try {
        const SavedUser = await newUser.save();
        return response.status(201).send(SavedUser);
    }
    catch (error) {
        // console.log(error);
        return response.sendStatus(400);

        // return response.status(400).send('DB operation not successfull');
    }
   
};
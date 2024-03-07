import * as validator from "express-validator";
import * as helpers from "../utils/helpers.mjs"
import { getUserByIdHandler, createUserHandler } from "../handlers/users.mjs"
import { mockUsers } from "../utils/constants.mjs"
import { User } from "../mongoose/schemas/user.mjs";

//mock function for express-validator to handle inbuilt modules 'validationResult','matchedData'
jest.mock("express-validator", () =>
({
    validationResult: jest.fn(() =>
    ({
        isEmpty: jest.fn(() => false),
        array: jest.fn(() => [{ msg: "Invalid_Field" }]),
    })),
    matchedData: jest.fn(() => ({
        username: "testName",
        password: "testPassword",
        Displayname: "testDisplay"
    })),
})
);

//mock function for hashPassword
jest.mock("../utils/helpers.mjs",()=>({
    hashPassword: jest.fn((password) => `hashed_${password}`),
}));

//mock function for userDB schema
jest.mock("../mongoose/schemas/user.mjs");




//creating fake parameters with the required property, that will be passed in arguments while the testing .
const mockRequest = {         //fake request object
    findUserIndex: 1
}

//jest.fn() is a fake function used in jest in place of real function call
const mockResponse = {
    sendStatus: jest.fn(),
    send: jest.fn(),
    status: jest.fn(() => mockResponse),
}


//TEST
describe('get users', () => {
    it('should get user by id', () => {
        getUserByIdHandler(mockRequest, mockResponse);
        expect(mockResponse.send).toHaveBeenCalled();
        expect(mockResponse.send).toHaveBeenCalledWith(mockUsers[1]);   //can also pass directly the expected output
        expect(mockResponse.send).toHaveBeenCalledTimes(1);
        expect(mockResponse.sendStatus).not.toHaveBeenCalled();
    });
    //  Before starting 2nd test...ensure that Set clearMocks is set true in jest.config file. It then will not pass the result of previous test. In order to pass result of previous test to next test turn it 'false'. 
    
    it('should call sendStatuss with 404 when user is not found', () => {
        const copyMockRequest = { ...mockRequest, findUserIndex: 100 }    //modifying mockRequest to tht will invoke the other condition too. 
        getUserByIdHandler(copyMockRequest, mockResponse);
        expect(mockResponse.sendStatus).toHaveBeenCalled();
        expect(mockResponse.sendStatus).toHaveBeenCalledWith(404);
        expect(mockResponse.send).not.toHaveBeenCalled();
    });
});


//TEST
describe('createUser', () => {
    const mockRequest = {};
    it('should send status of 400 whn there is error', async () => {
        await createUserHandler(mockRequest, mockResponse);
        expect(validator.validationResult).toHaveBeenCalled();
        expect(validator.validationResult).toHaveBeenCalledTimes(1);
        expect(validator.validationResult).toHaveBeenCalledWith(mockRequest);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith([{ msg: "Invalid_Field" }]);

    });

    it('should return status 201 and user created ', async () => {
        jest.spyOn(validator, "validationResult").mockImplementationOnce(() => ({
            isEmpty: jest.fn(() => true),
        }));

        const saveMethod = jest
        .spyOn(User.prototype, 'save')
        .mockResolvedValueOnce({
            id: 1,
            username: "testName",
            password: "hashed_testPassword",
            Displayname: "testDisplay"        
        });

        await (createUserHandler(mockRequest, mockResponse));
        expect(validator.matchedData).toHaveBeenLastCalledWith(mockRequest);
        expect(helpers.hashPassword).toHaveBeenCalledWith("testPassword");
        expect(helpers.hashPassword).toHaveReturnedWith("hashed_testPassword");
        expect(User).toHaveBeenCalledWith({
            username: "testName",
            password: "hashed_testPassword",
            Displayname: "testDisplay"
        });
        // expect(User.mock.instances[0].save).toHaveBeenCalled();  [optional method nxt line]
        expect(saveMethod).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.send).toHaveBeenLastCalledWith({
            id: 1,
            username: "testName",
            password: "hashed_testPassword",
            Displayname: "testDisplay"        
        });
    });

   it('send status 400 when database fails to save user',async()=>{
        jest.spyOn(validator, "validationResult").mockImplementationOnce(() => ({
            isEmpty: jest.fn(() => true),
        }));
        const saveMethod = jest
            .spyOn(User.prototype, 'save')
            .mockResolvedValueOnce(()=> Promise
            .reject('Failed to save user'));
        await (createUserHandler(mockRequest, mockResponse));
        expect(saveMethod).toHaveBeenCalled();
        expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
   });
});
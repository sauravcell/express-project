import {Router} from "express";
const router = Router();
import { validationResult,matchedData,checkSchema,query } from "express-validator";
import { createUserValidationSchema, createQueryValidationSchema } from "../utils/validationSchema.mjs";
import {mockUsers} from "../utils/constants.mjs";
import { loggingmiddleWare, resolveIndexById } from "../utils/middleware.mjs";
router.use(loggingmiddleWare);//only the routes declared after this line will be affected by the global middleware 'loggingmiddleWare'.

//now route setup GET method...It sets the response to be send  for a specific path in the URL request

//And Query parameters...It is passed in the URL which contains some values tht can be send by the client to filter output. It always starts with  '?' in URL. Eg- http://localhost:4000/app/users?filter=username&value=an
{        //GET schema  
    router.get('/api/users',checkSchema(
    createQueryValidationSchema),(request,response)=>{  
    const result = validationResult(request);
    console.log(result);
        
    //when the client has defined both values for value and filter, only thn filter will be applied.
    if(result.isEmpty()){    
        const {query: {filter,value}} = request;  
    const data=mockUsers.filter((user)=>user[filter].includes(value))//storing filtered values in 'data'.

    //if nothing is present in data
    if(Object.keys(data).length === 0){
            let msg="filter not found in username";         
            return response.send({msg,mockUsers});//sending complete array due to incorrect filter request.
    }
    return response.send(mockUsers.filter((user)=>user[filter].includes(value)));//sending filterd response
    }
    return response.send(mockUsers); //when the client hasn't defined any values for value or filter complete object will be sent.
    });
};

{//USING MIDDLEWARE IN GET:
    
    router.get('/api/users/:id',resolveIndexById,(request,response)=>{
    const {findUserIndex} = request;
    const findUser=mockUsers[findUserIndex];
    if(!findUser) return response.sendStatus(404);
    return response.send(findUser).status(201);
})
}

//Now POST http request method....it is used to accept a data sent from client. Eg- Form submission. The data is send via request body or payload. Then necessary operation on it is done. The .json() method is used to parse the request body which is imported earlier.
{       //POST schema
    router.post('/api/users',checkSchema(createUserValidationSchema),(request,response)=>
   {
    const result=validationResult(request);
    console.log(result);
    console.log("POST "+result.isEmpty());
    if(!result.isEmpty() ){   
        return response.status(400).send({errors: [result.array()]});
        //    return response.status(400).send({errors: [result.array()[1].msg,result.array()[0].msg]});    <---To send specific error message!
    } //returning the error array to the client-side
    const data = matchedData(request);

    const newUser= { id: mockUsers[mockUsers.length-1].id+1, ...data};//This line creates a new user object (newUser) by assigning a unique id to it.The ...data syntax is used to spread the properties of the data object into the newUser object.
    mockUsers.push(newUser);//This line adds newUser array. 
    return response.status(201).send(newUser);//201 means new record created.
   });
}

//Now PUT http request method....used to update data in DB entire record/row is updated.
{
    router.put('/api/users/:id',resolveIndexById,(request,response)=>
    {
        const {body,findUserIndex}= request;
        mockUsers[findUserIndex]={id:mockUsers[findUserIndex].id,...body};
        return response.sendStatus(200);
    });
}

//Now PATCH http request method...used to update data in DB partially i.e only one column in a sql DB.
{
    router.patch('/api/users/:id',resolveIndexById,(request,response)=>{
        const {body,findUserIndex}=request;
        mockUsers[findUserIndex]={...mockUsers[findUserIndex],...body};
        return response.sendStatus(200);
    });
}

{//Now delete http request method...used to delete resource
    router.delete('/api/users/:id',resolveIndexById,(request,response)=>{
        const {findUserIndex}=request;
        mockUsers.splice(findUserIndex,1);
        return response.sendStatus(200);
    
    });
}


export default router;

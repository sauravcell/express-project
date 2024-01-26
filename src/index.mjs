import express from "express";
import {query, validationResult, body, matchedData,checkSchema} from "express-validator";
import { createUserValidationSchema,createQueryValidationSchema } from "./utils/validationSchema.mjs";

const app=express();
app.use(express.json())//.use() will globally allow to parse the json objects send by POST method from the client side to any route. 

const PORT=process.env.PORT || 4000;
const products=[
    {id:1, name: "Bottle", price:20},
    {id:2, name: "keyboard", price:550},
    {id:3, name: "table", price: 890}
];
const mockUsers=[
    {id:1, username: "anson", displayName:"Anson"},
    {id:2, username: "jack", displayName:"Jack"},
    {id:3, username: "adam", displayName:"Adam"},
    {id:4, username: "tina", displayName:"Tina"},
    {id:5, username: "jason", displayName:"Jason"},
    {id:6, username: "henry", displayName:"Henry"},
    {id:7, username: "marilyn", displayName:"Marilyn"},
];

//initial server setup!
app.listen(PORT,()=>{
    console.log(`Running on port ${PORT}`);
});
{
{//Middleware concepts:
    //In Express.js, MIDDLEWARE functions are functions that have access to the request (req) object, the response (res) object, and the next function in the application’s request-response cycle.These functions can modify the request and response objects, end the request-response cycle, or call the next middleware function in the stack. Middleware functions can be used to perform various tasks such as logging, authentication, error handling, and more. They are executed in the order they are added to the application. 
}
{//Middleware concepts:
    //app.use(myMiddleware) line applies this middleware to all routes. When you make a request to any route, the middleware function will be executed before the route handler.
}
{//Middleware concepts:
    //You can also apply middleware to specific routes or groups of routes: "app.use('/api', myMiddleware);". This would apply myMiddleware only to routes that start with "/api".
}
}
//Defining global middleware func
const loggingmiddleWare=(request,response,next)=>{
    console.log(`${request.method} - ${request.url}`);
    next();
}
app.use(loggingmiddleWare);//only the routes declared after this line will be affected by the global middleware 'loggingmiddleWare'.

//Defining another NON-GLOBAL Middleware function
const resolveIndexById=(request,response,next)=>{
    const {params:{id}}=request;
        const parseId=parseInt(id);
        if(isNaN(parseId))  return response.sendStatus(400);
        const findUserIndex=mockUsers.findIndex((user)=> user.id===parseId);
        console.log(findUserIndex);
        if(findUserIndex===-1)    return response.sendStatus(404);
        request.findUserIndex=findUserIndex;//a new property to request object is assingned here in middleware function. it defines the index in the mockUser array in our case.
        next();//this then calls the final requestHandler which is also a middleware which performs the task assigned in that route(or sends the response). 
}

//now route setup GET method...It sets the response to be send  for a specific path in the URL request
{
app.get("/",(request,response)=>{  // 3 different ways sending json response
    // response.send("Hello World!");
    // response.send({ msg:"Hello" })
    response.status(201).send("Welcome To Das Solutions");
});

app.get('/api/products',(request,response)=>{
    response.send([
        {id:1, name: "Bottle", price:20},
        {id:2, name: "keyboard", price:550},
        {id: 3, name: "table", price: 890}
    ]);
});

//here id will work as key it will only give the details of that particular id enterd by client
//this method is benefial to validate request.
app.get('/api/products/:id',(request ,response)=> {
    console.log("URL ID: "+request.params.id);
    const parseId=parseInt(request.params.id);
    console.log(parseId);
    if(isNaN(parseId)) //if valid type of id is passed by client
        return response.status(400).send({msg:" Bad Request. Invalid Id."});
    const findProd=products.find((prod)=>prod.id===parseId);//if id is present in the DB.
    if(!findProd) // if id isn't present
        return response.sendStatus(404);
    return response.send(findProd); //if id is found
});

//USING MIDDLEWARE IN GET:
app.get('/api/users/:id',resolveIndexById,(request,response)=>{
    const {findUserIndex} = request;
//THE BELOW LINES ARE COMMENTED DUE TO THE USE OF MIDDLEWARE    
    // const parseId=parseInt(request.params.id);
    // if(isNaN(parseId)) return response.sendStatus(400);
    const findUser=mockUsers[findUserIndex];
    if(!findUser) return response.sendStatus(404);
    return response.send(findUser).status(201);
})
}

//Now Query parameters...It is passed in the URL which contains some values tht can be send by the client to filter output. It always starts with  '?' in URL. Eg- http://localhost:4000/app/users?filter=username&value=an

/*
    below QUERY validation part is shiftetd to schema in utils files nd imported here then-
    query('filter')
    .isString().withMessage('mustbe string')
    .notEmpty().withMessage('mustbe contain something')
    .isLength({min:3,max:10}).withMessage('mustbe 3-10'),
    query('value')
    .isNumeric().withMessage('not a number')
    .isEmpty().withMessage("Value not assigned")

*/

{           //   GET   schema
    app.get('/api/users',checkSchema(
    createQueryValidationSchema),(request,response)=>{//query() is used for validation.it can perform more than one validation by chaining.
        
    const result = validationResult(request);
    console.log(result);

/* 
        //destructuring assignment to extract property query within the request object 
        
            // request object has a property called query, which is an another object containing properties filter and value.
        if(!result.filter.isEmpty()&&!result.value.isEmpty())
            console.log("SOME VALUES FOUND.");

        const {
            query: {filter,value},
        }=request;

        if(filter && value)    //when the client has defined both values for value and filter, only thn filter will be applied.
            return response.send(
                mockUsers.filter((user)=>user[filter].includes(value))
            );
*/
        
    //when the client has defined both values for value and filter, only thn filter will be applied.
    if(result.isEmpty()){    
        const {query: {filter,value}} = request;        //destructuring assignment to extract property query within the request object 
        
            // request object has a property called query, which is an another object containing properties filter and value
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
}

//Now POST http request method....it is used to accept a data sent from client. Eg- Form submission. The data is send via request body or payload. Then necessary operation on it is done. The .json() method is used to parse the request body which is called earlier in line no. 3. 
/*below body validation part is shiftetd to schema in utils files nd imported here then
[
    body('username')       //username validation
    .notEmpty().withMessage('UN empty')
    .isLength({min:3,max:7}).withMessage('UN length 5 to 32')
    .isString().withMessage('username not string'),
    body('displayName')         //displayName validation
    .notEmpty()
    .withMessage('no displayName')      
]
*/
{           //POST schema
    app.post('/api/users',checkSchema(createUserValidationSchema),(request,response)=>
   {
    const result=validationResult(request);
    console.log(result);
    console.log("POST "+result.isEmpty());
    //|| !result.displayName.isEmpty()
    if(!result.isEmpty() ){   
        return response.status(400).send({errors: [result.array()]});
        //    return response.status(400).send({errors: [result.array()[1].msg,result.array()[0].msg]});    <---To send specific error message!
    } //returning the error array to the client-side
    const data = matchedData(request);
    
//REPLACING next line by 'data'
    // const {body}=request;//It is a destructuring assignment to extract the body property from the request object
    // console.log(request.body);

    const newUser= { id: mockUsers[mockUsers.length-1].id+1, ...data};//This line creates a new user object (newUser) by assigning a unique id to it. The id is calculated based on the last user's id in the mockUsers array, incremented by 1. The ...data syntax is used to spread the properties of the data object into the newUser object.
    mockUsers.push(newUser);//This line adds the newly created user (newUser) to the mockUsers array. 
    // console.log(mockUsers);
    return response.status(201).send(newUser);//201 means new record created.
   });
}

//Now PUT http request method....used to update data in DB entire record/row is updated.
{
    app.put('/api/users/:id',resolveIndexById,(request,response)=>
    {
        const {body,findUserIndex}= request;
//THE BELOW LINES ARE COMMENTED DUE TO THE USE OF MIDDLEWARE IN IT.
        // console.log("entered");
        // const parseId=parseInt(id);
        // if(isNaN(parseId)) return response.sendStatus(400);
        // const findUserIndex= mockUsers.findIndex((user)=>user.id===parseId);
        // console.log("FUI "+findUserIndex);
        // if(findUserIndex===-1) return response.sendStatus(404);
// mockUsers[findUserIndex]={id: parseId,...body};
//line 126 is updated below aftr using middleware
        mockUsers[findUserIndex]={id:mockUsers[findUserIndex].id,...body};
        return response.sendStatus(200);
    });
}

//Now PATCH http request method...used to update data in DB partially i.e only one column in a sql DB.
{
    app.patch('/api/users/:id',resolveIndexById,(request,response)=>{
        const {body,findUserIndex}=request;
        // const parseId=parseInt(id);
        // if(isNaN(parseId))  return response.sendStatus(400);
        // const findIndex=mockUsers.findIndex((user)=> user.id===parseId);
        // if(!findIndex)    return response.sendStatus(404);
//code logic till here is same as PUT method. so middleware is used here 

//line 147 is updated below
        // mockUsers[findIndex]={...mockUsers[findIndex],...body};//here { ...mockUsers[findIndex], ...body } This uses the spread syntax (...) to create a new object by combining the properties of the existing object at mockUsers[findIndex] with the properties in the body object. If there are overlapping properties, the values from body will overwrite the values from mockUsers[findIndex].
        mockUsers[findUserIndex]={...mockUsers[findUserIndex],...body};
        return response.sendStatus(200);
    });
}

//Now delete http request method...used to delete resource
{
app.delete('/api/users/:id',resolveIndexById,(request,response)=>{
    const {findUserIndex}=request;
    // const parseId=parseInt(id);
    // if(isNaN(parseId))  return response.sendStatus(400);
    // const findUserIndex=mockUsers.findIndex((user)=> user.id===parseId);
    // if(!findUserIndex)    return response.sendStatus(404);
//code logic till here is same as PUT,PATCH method so MIDDLEWWARE is used.
    mockUsers.splice(findUserIndex,1);
    return response.sendStatus(200);

});
}


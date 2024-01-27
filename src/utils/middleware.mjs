import {mockUsers} from "./constants.mjs";

//Defining global middleware func
const loggingmiddleWare=(request,response,next)=>{
    console.log(`${request.method} - ${request.url}`);
    next();
};

//Defining another NON-GLOBAL Middleware function
const resolveIndexById=(request,response,next)=>{    //works only on users object
    const {params:{id}}=request;
        const parseId=parseInt(id);
        if(isNaN(parseId))  return response.sendStatus(400);
        const findUserIndex=mockUsers.findIndex((user)=> user.id===parseId);
        console.log(findUserIndex);
        if(findUserIndex===-1)    return response.sendStatus(404);
        request.findUserIndex=findUserIndex;//a new property to request object is assingned here in middleware function. it defines the index in the mockUser array in our case.
        next();//this then calls the final requestHandler which is also a middleware which performs the task assigned in that route(or sends the response). 
};

export{loggingmiddleWare,resolveIndexById};


{//MIDDLEWARE
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


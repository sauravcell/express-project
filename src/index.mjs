import express, { request, response } from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { mockUsers } from "./utils/constants.mjs";
const PORT=process.env.PORT || 4000;
const app=express();

//.use() is used for global declaration
app.use(express.json())  //allow to parse the json objects
app.use(cookieParser('helloworld'));//must be done bfr app.use(routes), 'helloworld is optional nd is used for signed cookies'
app.use(session({   //allows to handle client session
    secret:"blacknike",
    saveUninitialized:false,
    reSave: false,
    cookie:{
        maxAge: 10000       //default cookie time set inside session
    },
})); 


app.use(routes);    //route is always declared atlast after all other global declation

app.listen(PORT,()=>{    //initial server setup!
    console.log(`Running on port ${PORT}`);
});

app.get("/",(request,response)=>{  // 3 different ways sending json response
    // response.send("Hello World!");
    // response.send({ msg:"Hello" })
    response.status(201).send("Welcome To Das Solutions");
});

//adding cookie and session with response:
app.get("/api/",(request,response)=>{
    
    console.log(request.session);
    console.log(request.session.id);
    request.session.visited=true;      // .visited property added dynamically to session to not generate different session id for the same client till the cookie age expires
    response.cookie("hello","world",{maxAge: 3000, signed:'true'});  //cookie age is some seconds defined in maxAge in milliseconds & signed value is defined in cookieParser globally above. This age can  be overwritten by session cookie time created above.
    response.status(200).send('You can route to product and user');
});

//adding session for authentication

app.post("/api/auth/",(request,response)=>{

    const{body:{
        username,password   //client sennds uName & psWord which is destructurd for authentication.
    }}=request;
    const findUser=mockUsers.find((user)=>user.username===username);
    if(!findUser || findUser.password !== password)     
        return response.status(401).send({msg: "Bad credentials"});//failed authentication
    request.session.user = findUser;    //this value or the authentication is valid untill cookie didnt expire
    return response.status(200).send(findUser);
}); 

app.get('/api/auth/status',(request,response)=>{
    request.sessionStore.get(request.sessionID,(error,session) => //session id is stored in sessionStore
        {
            console.log(session);
            console.log(request.session.id);
        });
    return request.session.user ? response.status(200).send(request.session.user) : response.status(401).send({msg:'Not authenticated'});   //have to visit first /api/auth for authentication
});

//usecase of authentication in online shoping
app.post('/api/cart',(request,response)=>{
    if(!request.session.user)   //nedd to authenticate first
        return response.sendStatus(401);
    const {body:item} = request;    //destructuring items send by client
    const {cart} = request.session; //destructuring cart array created in previous sessions
    if(cart)
        cart.push(item); //if cart array found, item is inserted
    else
        request.session.cart = [item]; //else new cart is created nd thn inserted
    return response.status(201).send(item);
});

//getting cart details
app.get('/api/cart',(request,response)=>{
    if(!request.session.user) return response.sendStatus(401);
    return response.send(request.session.cart ?? []);//____  '?? []' This is the nullish coalescing operator. It returns the left-hand operand (request.session.cart) if it is not null or undefined; otherwise, it returns the right-hand operand (an empty array []). 
});


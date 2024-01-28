import express, { request, response } from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { mockUsers } from "./utils/constants.mjs";
import passport from "passport";
import "./strategies/local-Strategy.mjs";
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
        maxAge: 60000*60       //default cookie time set inside session
    },
})); 
app.use(passport.initialize()); //passport needs declaration between session and route declartion
app.use(passport.session());


app.use(routes);    //route is always declared atlast after all other global declation

app.listen(PORT,()=>{    //initial server setup!
    console.log(`Running on port ${PORT}`);
});

app.get("/",(request,response)=>{  // 3 different ways sending json response
    // response.send("Hello World!");
    // response.send({ msg:"Hello" })
    response.status(201).send("Welcome To Das Solutions");
});

app.post('/api/auth',
passport.authenticate("local"),
(request,response)=>{
    response.sendStatus(200);
});

app.get('/api/auth/status',(request,response)=>{
    console.log(`inside /api/auth/status:`);
    console.log(request.user);
    console.log(request.session);
    return request.user? response.send(request.user) :response.sendStatus(401);    
});

//to terminate an existing login session
app.post('/api/auth/logout',(request,response)=>{
    if(!request.user)
        return response.sendStatus(401);    //notauthenticated
    request.logout((err)=>{
      if(err) return response.sendStatus(400);
    response.sendStatus(200);
    })    
})





import express, { request, response } from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./strategies/local-strategy.mjs" //comented due to the use of discord passport strategy in place of local local passport strategy.
// import "./strategies/discord-strategy.mjs"   //commented due to the use of local
import mongoose from "mongoose";
import MongoStore from "connect-mongo";

const PORT=process.env.PORT || 4000;
const app=express();

mongoose
.connect('mongodb://localhost/express-tutorial')    //connected to DB
.then(()=>console.log('connected to database'))
.catch((err)=>console.log(`Error in DB: ${err}`));

//.use() is used for global declaration
app.use(express.json())  //allow to parse the json objects
app.use(cookieParser('helloworld'));//must be done bfr app.use(routes), 'helloworld is optional nd is used for signed cookies'
app.use(session({   //allows to handle client session
    secret:"blacknike",
    saveUninitialized:false,
    reSave:false,
    cookie:{
        maxAge: 60000*60       //default cookie time set inside session
    },
    store: MongoStore.create({      //this enebles to store the session data in DB instead of inmemory earlier. so evn if server goes down session data can be retrived from DB. 
        client: mongoose.connection.getClient(),
    }),
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

//authentication logic is applied here.....1st vist this file to login passing username and password
app.post('/api/auth',
passport.authenticate("local"),
(request,response)=>{
    console.log(`inside auth route:`);
    response.sendStatus(200);
});

//next this to check authentication status
app.get('/api/auth/status',(request,response)=>{
    console.log(`inside status route:`);
    console.log({"req_user":request.user});
    console.log({"req_session":request.session});
    console.log({"req_session-id":request.sessionID});
    return request.user ? response.send(request.user):response.sendStatus(401);    
});

//to terminate an existing login session
app.post('/api/auth/logout',(request,response)=>{
    console.log(`inside logout route:`);
    if(!request.user)
        return response.sendStatus(401);    //notauthenticated
    request.logout((err)=>{
      if(err) return response.sendStatus(400);
    response.sendStatus(200);
    })    
})



//applying dicord logic
app.get('/api/auth/discord',passport.authenticate('discord'));//calls discord via discord-strategy file

app.get('/api/auth/discord/redirect',passport.authenticate('discord'),
(request,response)=>{
    console.log("Inside redirect:");
    console.log(request.session);
    console.log(request.user);
    response.status(200).send('Discord authentication successful.');
}
)

/*
After authorization from discord, the discord a query parameter namele 'code' which the 'accessToken' & 'refreshToken' created by discord API after authorization. We use the redirect URL: 
.get('/api/auth/discord/redirect') to grab that information from the code paremeter.  
so the flow works as:
    1: .get('/api/auth/discord'),then
    2: passport.authenticate('discord'); it will redirect us to the 3rd party platform. 
    3. Once we click on authorize, it generates the tokens and stores in 'code' query parameter. It will thn redirect us to callback URL:
    .get('/api/auth/discord/redirect') .
    4. In the redirect URL when the passport.authenticate('discord') is called again, then, the access Token & refresh Token are exchanged from the 'code' query parameter.
    5. Then the verified function in discord strategy logic is called at end ,which uses those tokens.
*/
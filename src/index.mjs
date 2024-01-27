import express, { request, response } from "express";
import routes from "./routes/index.mjs"

const PORT=process.env.PORT || 4000;
const app=express();

//.use() is used for global declaration
app.use(express.json())  //allow to parse the json objects
app.use(routes); 
app.listen(PORT,()=>{    //initial server setup!
    console.log(`Running on port ${PORT}`);
});

app.get("/",(request,response)=>{  // 3 different ways sending json response
    // response.send("Hello World!");
    // response.send({ msg:"Hello" })
    response.status(201).send("Welcome To Das Solutions");
});

app.get("/api/",(request,response)=>{
    response.status(200).send('You can route to product and user');
});


import{Router} from "express";
const router = Router();
import {loggingmiddleWare} from "../utils/middleware.mjs";
router.use(loggingmiddleWare);
import { products } from "../utils/constants.mjs";

router.get('/api/products',(request,response)=>{

    // console.log(request.headers.cookie);   //cookies replaced by signedcookies
    // console.log(request.cookies);
    console.log("product console: printing_START");
    console.log(request.session);
    console.log(request.session.id);
    console.log(request.signedCookies);
    console.log(request.signedCookies.hello);
    console.log("product console:END");
    if(request.signedCookies.hello && request.signedCookies.hello === 'world') //now client first must visit to /api route to get cookie permission and cookie age expire after every 10 seconds .
        return  response.send([
                {id:1, name: "Bottle", price:20},
                {id:2, name: "keyboard", price:550},
                {id: 3, name: "table", price: 890}
            ]);
    return response.status(403).send({msg:"You need to send correct cookie."});
});
    
//here id will work as key it will only give the details of that particular id enterd by client
//this method is benefial to validate request.
router.get('/api/products/:id',(request ,response)=> {
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


export default router;
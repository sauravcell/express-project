import{Router} from "express";
const router = Router();
import {loggingmiddleWare} from "../utils/middleware.mjs";
router.use(loggingmiddleWare);
import { products } from "../utils/constants.mjs";

router.get('/api/products',(request,response)=>{
    response.send([
        {id:1, name: "Bottle", price:20},
        {id:2, name: "keyboard", price:550},
        {id: 3, name: "table", price: 890}
    ]);
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
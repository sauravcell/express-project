import { Router } from "express";

import usersRouter  from "./users.mjs";
import productsRouter from "./products.mjs"
const router=Router();

router.use(usersRouter);//global declaration of usersRouter
router.use(productsRouter);//global declaration of productsRouter
export default router;
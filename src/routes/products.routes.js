import { Router } from "express";
import { passportCall } from "../utils/jwt.js";
import authToken from "../middleware/usersessiontoken.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import ProductsController from "../controllers/products.controller.js";
import validateSchema from "../middleware/validate-dto.middleware.js";
import { PRODUCT_DTO } from "../dto/dtoManager.js";


const router = Router();
const productsController = new ProductsController();


//---------------------GET---------------------
//filtro de productos por id
//http://localhost:8080/api/products/:pid
    router.get("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","USER","PROFILE"]), authToken], productsController.getIdProducts);


//filtro de productos convinado
//http://localhost:8080/api/products/?page=2&limit=5&sort=&category=&id= 
    router.get("/", [passportCall("jwt"), handlePolicies(["ADMIN","USER","PROFILE"]), authToken], productsController.getCombProducts);

//---------------------POST---------------------
//Crear un nuevo producto
//http://localhost:8080/api/products/
    router.post("/", [passportCall("jwt"), handlePolicies(["ADMIN"]), authToken,  validateSchema(PRODUCT_DTO)], productsController.addToProduct);

//---------------------PUT---------------------
//update objeto completo
//http://localhost:8080/api/products/:pid 
    router.put("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN"]), authToken, validateSchema(PRODUCT_DTO)], productsController.updateProductsComplet);

//---------------------PATCH---------------------
//PACHT para actualizar valores en particular
//http://localhost:8080/api/products/:pid
    router.patch("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN"])], authToken, productsController.updateProductsPatch);

//---------------------DELETE---------------------
//http://localhost:8080/api/products/:pid
    router.delete("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN"])], authToken, productsController.deleteProduct);

export default router
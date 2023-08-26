import UserModel from "../dao/models/users.model.js"
import SessionService from "../services/session.service.js";
import cartsModel from "../dao/models/carts.model.js";
import { appConfig } from "../config/config.js";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"
import EmailService from "../services/email.service.js";

const { JWT_COOKIE_NAME } = appConfig;


class SessionController {
    constructor(){
        this.userModel = UserModel;
        this.cartsModel = cartsModel;
        this.sessionService = new SessionService();
        this.httpResponse = new HttpResponse();
        this.emailService = new EmailService();
    }

    allToRegister = async (req, res) => {
      try {
          const addUser = await this.sessionService.allToRegister(req);
          if (addUser.error && addUser.error === "El correo electrónico ya está registrado") {
              const errorMessage = `${EnumErrors.INVALID_PARAMS} - El correo electrónico ya está registrado`;
              req.logger.warning(errorMessage);
              return res.render("user/registererror", {
                  error: `${EnumErrors.INVALID_PARAMS} - El correo electrónico ya está registrado`,
              });
          }          
          await this.emailService.sendWelcomeEmail(req.body.email);
          return res.redirect("/login");
      } catch (error) {
        const errorCode = EnumErrors.DATABASE_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Error en el registro de usuario: ${error}`, {
          errorCode,
          errorStack: error.stack,
        });        
          return res.render("user/registererror", { error: `${EnumErrors.DATABASE_ERROR} - Ocurrió un error en el registro de usuario` });
      }
    }

    recoverUser = async (req, res) => {
      try {
          const { email } = req.body;
          const recoverResult = await this.sessionService.recoverUser(req);
          if (recoverResult.error) {
              const errorMessage = `${EnumErrors.INVALID_PARAMS} - El usuario con el mail: ${email} no existe`;
              req.logger.warning(errorMessage);
              return res.render("user/recovererror", {
                error: `${EnumErrors.INVALID_PARAMS} - El usaurio con el mail: ${email} no existe`,
              });
          }
          console.log(`sessionController: Password cambiado correctamente ${recoverResult}`);
          await this.emailService.sendPasswordChangedEmail(req.body.email);
          return res.redirect("/login");
      } catch (error) {
          const errorCode = EnumErrors.DATABASE_ERROR;
          req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Ocurrió un error en cambio de Password`, {
            errorCode,
            errorStack: error.stack,
          });        
          return res.render("user/recovererror", { error: `${EnumErrors.DATABASE_ERROR} - Ocurrió un error en cambio de Password` });
      }
    }

    loginUser = async (req, res) => {
      try {       
        const token = await this.sessionService.loginUser(req);
        return res.cookie(JWT_COOKIE_NAME, token).redirect("/products");
      } catch (error) {
        const errorCode = EnumErrors.UNAUTHORIZED_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Credenciales inválidas`, {
          errorCode,
          errorStack: error.stack,
        }); 
        return this.httpResponse.Unauthorized(
            res,
            `${EnumErrors.UNAUTHORIZED_ERROR} - Credenciales inválidas`,
            req.params
        );
    }
    }

    loginGitHub = async (req, res) => {
      try {
        const token = await this.sessionService.loginGitHub(req, res); 
        console.log(`🚀 ~ file: session.controller.js:66 ~ sessionController ~ loginGitHub= ~ token: ${token}`)
        res
        .cookie(JWT_COOKIE_NAME, token, { httpOnly: true })
        .redirect("/products");
      } catch (error) {
        const errorCode = EnumErrors.CONTROLLER_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Error en el enrutamiento de GitHub callback: ${error}`, {
          errorCode,
          errorStack: error.stack,
        }); 
        res.redirect("/login");
      }
    };

    githubCallback = async (req, res) => {
      try {
        const token = await this.sessionService.githubCallback(req, res);
        res
        .cookie(JWT_COOKIE_NAME, token, { httpOnly: true })
        .redirect("/products");
      } catch (error) {
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - Error en el enrutamiento de GitHub callback: ${error}`, {
          errorCode,
          errorStack: error.stack,
        });
        res.redirect("/login");
      }
    }


    logoutUser = async (req, res) => {
      try {
        console.error(`SessionController: sessión cerrada exitosamente`);
        res.clearCookie(JWT_COOKIE_NAME).redirect("/login");
      } catch (error) {
        console.error();
        const errorCode = EnumErrors.DATABASE_ERROR;    
        req.logger[ErrorLevels[errorCode] || "error"](`${EnumErrors.CONTROLLER_ERROR} - Error al cerrar sesión: ${error}`, {
          errorCode,
          errorStack: error.stack,
        });
        return this.httpResponse.Error(
          res,
          `${EnumErrors.CONTROLLER_ERROR} - Ocurrió un error al cerrar sesión`,
          { error }
      );
      }
    }
      
    getCurrentUserInfo = async (req, res) => {
      try {
        const userInfo = await this.sessionService.getCurrentUserInfo(req.user);
        console.log(`SessionController: Solicitud consulta datos current procesada con exito`);     
        res.render("user/current", { user: userInfo });
      } catch (error){
        const errorCode = EnumErrors.CONTROLLER_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - No se puede obtener la información del usuario actual`, {
          errorCode,
          errorStack: error.stack,
        });
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  No se puede obtener la información del usuario actual  `, 
            { error: `${error}` }
            );  
        }
    };

    getTicketsByUser = async (req, res) =>{
      const userEmail = req.user.user.email;   
      try {
        const tickets = await this.sessionService.getTicketsByUser(userEmail);
        return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {tickets});    
      } catch (error){
        const errorCode = EnumErrors.CONTROLLER_ERROR;
        req.logger[ErrorLevels[errorCode] || "error"](`${errorCode} - No se puede obtener la información de los tickets`, {
          errorCode,
          errorStack: error.stack,
        });     
        return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  No se puede obtener la información de los tickets  `, 
            { error: `${error}` }
            );  
        }
    }
    
}


export default SessionController


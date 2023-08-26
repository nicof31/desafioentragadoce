import { createHashValue } from "../../../utils/encrypt.js";
import CartsManagerFS from "./cartsManager.fs.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import passport from "passport";
import { generateJWT } from "../../../utils/jwt.js";

export default class UserManagerFS {
  constructor() {
    this.cartsManagerFS = new CartsManagerFS();
    this.path = "src/files/users.json";
    this.ticketsPath = "src/files/tickets.json";
  }

  allToRegister = async (req) => {
    try {
      const { first_name, last_name, email, password, age, role } = req.body;
      const pswHashed = await createHashValue(password);
      let users = [];
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        users = JSON.parse(data);
      }
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        throw new Error("El correo electrónico ya está registrado");
      }
      const newUser = {
        _id: uuidv4(),
        email,
        password: pswHashed,
        first_name,
        last_name,
        age,
        role,
        cart: null,
      };
      users.push(newUser);
      const newUserWithCart = await this.cartsManagerFS.addCartsRegister(
        newUser._id
      );
      newUser.cart = newUserWithCart._id;
      await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2));
      console.log("userManagerFs: Usuario registrado exitosamente:", newUser);
      return newUser;
    } catch (error) {
      console.log(`userManagerFs: no se pudo registrar usuario: '${error}'`);
      throw error;
    }
  };

  recoverUser = async (req) => {
    try {
      const { email, new_password } = req.body;
      let users = [];
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        users = JSON.parse(data);
      }
      const existingUser = users.find((user) => user.email === email);
      if (!existingUser) {
        return {
          error: true,
          message: `userManagerFs: El usuario con el correo electrónico ${email} no existe`,
        };
      }
      existingUser.password = await createHashValue(new_password);
      await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2));
      console.log(`userManagerFs: Password cambiado correctamente`);
      return { success: true };
    } catch (error) {
      console.log(`userManagerFs: no se pudo cambiar Password: ${error}`);
      throw {
        error: true,
        message: "userManagerFs: Ocurrió un error al cambiar la contraseña",
      };
    }
  };

  loginUser = async (req, res) => {
    return new Promise(async (resolve, reject) => {
      passport.authenticate("loginFs", async (err, user, info) => {
        if (err) {
          console.error(`userManagerFs: Error en la autenticación: ${err}`);
          reject({
            error: "(401): userManagerFs: Ocurrió un error en la autenticación",
          });
        }
        if (!user) {
          reject({ error: "(401): userManagerFs: Credenciales inválidas" });
        }
        try {
          const verifUser = user;
          console.log(
            "🚀 ~ file: userManager.fs.js:108 ~ UserManagerFS ~ passport.authenticate ~ verifUser:",
            verifUser
          );
          const signUser = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            id: user._id,
          };
          console.log(
            "🚀 ~ file: userManager.fs.js:114 ~ UserManagerFS ~ passport.authenticate ~ signUser:",
            signUser
          );
          const token = await generateJWT({ ...signUser });
          console.log("🚀 ~ userManagerFs ~ token:", token);
          resolve(token);
        } catch (error) {
          console.error(`userManagerFs: Error al generar el token: ${error}`);
          reject({ error: "userManagerFs: Error en el servidor" });
        }
      })(req);
    });
  };
  
  loginGitHub = async (req, res) => {
    try {
      return new Promise((resolve, reject) => {
        passport.authenticate("githubfs", { session: false }, (err, token) => {
          if (err) {
            console.error(`userManager: Error en la autenticación: ${err}`);
            return reject(err);
          }
          resolve(token);
        })(req, res);
      });
    } catch (error) {
      console.error(`userManager: Error al generar el token: ${error}`);
      throw error;
    }
  };

  githubCallback = async (req, res) => {
    try {
      return new Promise((resolve, reject) => {
        passport.authenticate("githubfs", { session: false }, (err, token) => {
          if (err) {
            console.error(`userManager: Error en la autenticación: ${err}`);
            return reject(err);
          }
          resolve(token);
        })(req, res);
      });
    } catch (error) {
      console.error(`userManager: Error al generar el token: ${error}`);
      throw error;
    }
  };

  getCurrentUserInfo = async (req) => {
    try {
      console.log("estoy saliendo ok");
      const { iat, exp } = req;
      console.log(
        "🚀 ~ file: UserManager.mongodb.js:166 ~ UserManagerMongo ~ getCurrentUserInfo= ~ req:",
        req
      );
      console.log(
        "🚀 ~ file: UserManager.mongodb.js:166 ~ UserManagerMongo ~ getCurrentUserInfo= ~ req.user:",
        req.user
      );
      const { first_name, last_name, email, role, cart, id } = req.user;
      const user = {
        first_name,
        last_name,
        email,
        role,
        cart,
        id,
        iat,
        exp,
      };
      return user;
    } catch (error) {
      console.error(
        `SessionManager: No se puede obtener la información del usuario actual: ${error}`
      );
      throw error;
    }
  };

  getTicketsByUser = async (userEmail) => {
    try {
      const ticketsData = await fs.promises.readFile(this.ticketsPath, "utf-8");
      const tickets = JSON.parse(ticketsData);

      const userTickets = tickets.filter(
        (ticket) => ticket.purchaser === userEmail
      );
      console.log("Tickets para el usuario:", userTickets);
      return userTickets;
    } catch (error) {
      console.error(`Error al obtener los tickets del usuario: ${error}`);
      throw error;
    }
  };
  
}

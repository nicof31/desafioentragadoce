
export default class SessionRepository {
    constructor(dao) {
      this.dao = dao;
    }

    allToRegister = async (req) => {
        try {
        const newUser =  await this.dao.allToRegister(req);
        return newUser
        } catch (error) {
        console.log(`SessionRepository: Error en allToRegister: ${error}`);
        throw error;
        }
    }

    recoverUser = async (req) => {
        try {
        const newPswHashed =  await this.dao.recoverUser(req);
        return newPswHashed
        } catch (error) {
        console.log(`SessionRepository: Error en recoverUser: ${error}`);
        throw error;
        }
    }

    loginUser = async (req) => {
        try {
        const newPswHashed =  await this.dao.loginUser(req);
        console.log("🚀 ~ file: session.repository.js:33 ~ SessionRepository ~ loginUser= ~ newPswHashed:", newPswHashed)
        return newPswHashed
        } catch (error) {
        console.log(`SessionRepository: Error en loginUser: ${error}`);
        throw error;
        }
    }

    loginGitHub = async (req, res) => {
        try {
        const token =  await this.dao.loginGitHub(req, res);
        return token
        } catch (error) {
        console.log(`SessionRepository: Error en loginGitHu: ${error}`);
        throw error;
        }
    }

     githubCallback = async (req, res) => {
        try {       
        const token =  await this.dao.githubCallback(req, res);
        return token;
        } catch (error) {
        console.error(`sessionService: Error al generar el token: ${error}`);
        throw error;
        }
    }

    getCurrentUserInfo  = async (req) => {
        try {
        const userInfo = await this.dao.getCurrentUserInfo(req);
        return userInfo;        
        } catch (error) {
        console.error(`SessionRepository: Error al procesar la solicitud: ${error}`);
        throw error;
        }
    }

    getTicketsByUser = async (userEmail) => {
        try {
        const tickets = await this.dao.getTicketsByUser(userEmail);
        return tickets;
        } catch (error) {
        throw error;
        }
    }

}
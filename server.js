import { createServer } from "http"
import path from "path"
import { fileURLToPath } from "url"
import { readFileSync } from "fs"
import { Server } from "socket.io"
import db, { init as initDB, getMessages, addMessage, isUserExist, addUser} from "./db.js"

initDB()
const __dirname = path.dirname(fileURLToPath(import.meta.url))



const server = createServer(async (req, res) => {
    switch (req.url) {
        case "/":
            let indexHtmlFile = getStaticFile("index.html")
            res.writeHead(200, { "content-type": "text/html" })
            res.end(indexHtmlFile)
            break;
        case "/register":
            if (req.method === "GET") {
                let registerHtmlFile = getStaticFile("register.html")
                res.writeHead(200, { "content-type": "text/html" })
                res.end(registerHtmlFile)
            }
            else if (req.method === "POST") {
                let data = ""
                req.on("data", chunk => data += chunk)
                req.on("end", () => {
                registerUser(req, res, data)
                })
            }
            break;
                case "/login":
            if (req.method === "GET") {
                let loginHtmlFile = getStaticFile("login.html")
                res.writeHead(200, { "content-type": "text/html" })
                res.end(loginHtmlFile)
            }
            else if (req.method === "POST") {
                let data = ""
                req.on("data", chunk => data += chunk)
                req.on("end", () => {
                loginUser(req, res, data)
                })
            }
            break;
        case "/css.css":
            let styleCssFile = getStaticFile("css.css")
            res.writeHead(200, { "content-type": "text/css" })
            res.end(styleCssFile)
            break;
        case "/cssc.css":
            let styleSCssFile = getStaticFile("cssc.css")
            res.writeHead(200, { "content-type": "text/css" })
            res.end(styleSCssFile)
            break;
        case "/script.js":
            let scriptJsFile = getStaticFile("script.js")
            res.writeHead(200, { "content-type": "applicaction/javascript" })
            res.end(scriptJsFile)
            break;
        case "/messages":
            let messages = await getMessages()
            res.writeHead(200, { "content-type": "application/json" })
            res.end(JSON.stringify(messages))
            break;
        default:
            res.statusCode = 404
            res.end("error: not found")
    }
})

const io = new Server(server);

io.on("connection", (socket) => {
    console.log(`User connected with id: ${socket.id}`)
    let nickname = "anonim"

    socket.on("new_nickname", (data) => {
        nickname = data
    })

    socket.on("new_message", async (data) => {
        console.log(data)
        io.emit("message", {
            user: nickname,
            message: data
        })
        await addMessage(1, data)
    })



})

server.listen(3000, () => console.log("Server on!"))

function getStaticFile(name) {
    let pathToFile = path.join(__dirname, "static", name)
    let bufferFile = readFileSync(pathToFile)
    let data = Buffer.from(bufferFile)
    return data
}


async function registerUser(req, res, data) {
    let reg = JSON.parse(data)
    let login = reg.login
    let password = reg.password
    if(!login || !password){
        res.statusCode = 400
        res.end(JSON.stringify({error: "login and Password are required"}))
        return
    }
    if(await isUserExist(login)){
        res.statusCode = 400
        res.end(JSON.stringify({error: "User already exists"}))
        return
    }
    let result = addUser(login, password)
    if(result){
        res.statusCode = 201
        res.end(JSON.stringify({message: "User created"}))
    } else {
        res.statusCode = 500
        res.end(JSON.stringify({error: "Server error"}))
    }
}

async function loginUser(req, res, data) {
    let info = JSON.parse(data)
    let login = info.login
    let password = info.password
    if(!login || !password){
        res.statusCode = 400
        res.end(JSON.stringify({error: "login and Password are required"}))
        return
    }
}
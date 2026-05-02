import { createConnection } from "mysql2";
import { genSalt} from "bcrypt";
import { compare, hash } from "bcrypt";
import { configDotenv }  from "dotenv"

configDotenv()


let db = createConnection({
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "root",
    database: process.env.DATABASE || "db11_big_chat",
    port: process.env.PORT || 3306
}).promise();

export async function init() {
try {
    await db.query(`
    CREATE TABLE IF NOT EXISTS user(
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR (100) NOT NULL)
    `)

    await db.query(`
    CREATE TABLE IF NOT EXISTS message(
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT,
    content TEXT NOT NULL,
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES user(id)
)
`);


        // await db.query(`INSERT INTO user (login, password) VALUES ('admin', 'admin')
        // `)
        // await db.query(`INSERT INTO message(author_id, content) VALUES (1, 'Hello, world!')
        // `)
    } catch (error) {
    console.log(`Db error: ${error.message}`)
    }
}
export async function getMessages(){
    let [result, fields] = await db.query(`SELECT m.id, m.content, u.login as author FROM message m JOIN user u ON m.author_id = u.id`)
    console.log(result)
    return result
}


export async function addMessage(user_id, content){
    try {
        db.query(`INSERT INTO message (author_id, content) VALUES (?, ?)`, [user_id, content])
    } catch (error) {
        console.log(`Db error: ${error.message}`)
    }
}

export async function isUserExist(login){
    const [result, fields] = await db.query(`SELECT * FROM user WHERE login = ?`, [login])
    console.log(result.length > 0)
    return result.length > 0;
    
}

export async function addUser(login, password){
    try {

    let salt = await genSalt(10)
    let hashedPassword = await hash(password, salt)

    await db.query("insert into user (login, password) values (?, ?)", [login, hashedPassword])
    return true;
    } catch (error) {
        console.log(`Db error: ${error.message}`)
        return false
    }
}

export async function getUser(login, password){
    let result = await db.query(`SELECT * FROM user WHERE login = ?`, [login])
    if (result[0].length === 0) {
        return null;
    }
    if (!await compare(password, result[0][0].password)) {
        return false;
    }
    return result[0][0];
}

export default db;
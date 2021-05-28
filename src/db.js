const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const SQL = require("sql-template-strings");
const app = require("./app");

const createtables = async () => {
    const db = await sqlite.open({
        filename: 'db.sqlite',
        driver: sqlite3.Database
    })

    /**
   * Create the table
   **/
    await db.run(`CREATE TABLE admin (id INTEGER PRIMARY KEY
    AUTOINCREMENT, email VARCHAR(55) NOT NULL UNIQUE, password VARCHAR(25) NOT NULL,token VARCHAR(25));`);

    await db.run(`CREATE TABLE contact (id INTEGER PRIMARY KEY
    AUTOINCREMENT, name VARCHAR(55) NOT NULL, email VARCHAR(55) NOT NULL,
    title VARCHAR(55) NOT NULL, message text NOT NULL,dateC DATETIME NOT NULL);`);

    await db.run(`CREATE TABLE subscriber (id INTEGER PRIMARY KEY
    AUTOINCREMENT, email VARCHAR(55) NOT NULL);`);

    await db.run(`CREATE TABLE blog (id INTEGER PRIMARY KEY
    AUTOINCREMENT, title VARCHAR(55) NOT NULL, description text NOT NULL,
    content TEXT NOT NULL, image TEXT NOT NULL,
    views INTEGER, isFeatured BOOLEAN, dateB DATETIME NOT NULL);`);

    await db.run(`CREATE TABLE comments (id INTEGER PRIMARY KEY
    AUTOINCREMENT, desc TEXT NOT NULL, date DATETIME NOT NULL,
    idblog INTEGER NOT NULL,FOREIGN KEY (idblog) REFERENCES blog(id));`);

    await db.run(`CREATE TABLE IP (id INTEGER PRIMARY KEY
    AUTOINCREMENT, IP VARCHAR(55) NOT NULL, idblog text NOT NULL,
    FOREIGN KEY (idblog) REFERENCES blog(id));`);
    console.log('tables created!')
}

//delete the tables
const deleteTable = async () => {
    const db = await sqlite.open({
        filename: 'db.sqlite',
        driver: sqlite3.Database
    })
    const tableName = [`admin`, `contact`, `subscriber`, `blog`, `comments`, `IP`];
    let statement = `DROP TABLE `
    tableName.forEach(async (t) => {
        let sta = statement + t;
        await db.run(sta);

    })
    console.log('tables deleted!');

}

const initializeDatabase = async () => {

    const db = await sqlite.open({
        filename: 'db.sqlite',
        driver: sqlite3.Database
    })
    // retrieves the blogs from the database
    const getBlogsList = async () => {
        let statement = `SELECT id, title, image, description,content, views, dateB, isFeatured FROM blog ORDER BY dateB DESC`
        try {
            const rows = await db.all(statement);
            if (!rows.length) throw new Error(`no rows found`);
            return rows;
        } catch (e) {
            throw new Error(`couldn't retrieve blogs: ` + e.message);
        }
    }
    //select blog by title
    const getBlog = async (title) => {
        let statement = `SELECT id,title, description, image, views, dateB FROM blog WHERE title LIKE'%${title}%'`
        const blog = await db.all(statement);
        if (!blog) throw new Error(`title: ${title} not found`);
        return blog;
    }
    //select blog by id
    const getBlogById = async (id) => {
        let statement = `SELECT id, title, image, description,content, views, dateB, isFeatured FROM blog WHERE id = ${id}`
        const blog = await db.get(statement);
        if (!blog) throw new Error(`blog not found`);
        return blog;
    }

    //add new blog
    const createBlog = async (props) => {
        if (!props || !props.title || !props.description || !props.content || !props.image) {
            throw new Error(`you must provide a title and an description,content,image`);
        }
        const { title, description, content, image, isFeatured, dateB } = props;
        try {
            const result = await db.run(`INSERT INTO blog (title,description,content,image,isFeatured, dateB) VALUES (?, ?, ?, ?, ?, ?)`, [title, description, content, image, isFeatured, dateB]);
            const id = result.lastID;
            return id;
        } catch (e) {
            throw new Error(`couldn't insert this combination: ` + e.message);
        }
    }
    //edit blog
    const updateBlog = async (id, props) => {

        const { title, image, description, content, isFeatured, dateB } = props;
        let stmt, params = [];
        if (title && image && description && content && dateB) {
            stmt = `UPDATE blog SET title = ?, image = ?, description= ?, content= ?, isFeatured=?, dateB=?  WHERE id = ?`;
            params = [title, image, description, content, isFeatured, dateB, id];
        }
        else if (title && !image && description && content) {
            stmt = `UPDATE blog SET title = ?, description= ?, content= ?, isFeatured=?, dateB=?  WHERE id = ?`;
            params = [title, description, content, isFeatured, dateB, id];
        }

        try {
            const result = await db.run(stmt, params);
            if (result.changes === 0) throw new Error(`no changes were made`);
            return true;
        } catch (e) {
            throw new Error(`couldn't update the contact ${id}: ` + e.message);
        }
    }
    //delete blog
    const deleteBlog = async (id) => {
        try {
            const result = await db.run(`DELETE FROM blog WHERE id = ?`, id);
            if (result.changes === 0) throw new Error(`blog "${id}" does not exist`);
            return true;
        } catch (e) {
            throw new Error(`couldn't delete the blog "${id}": ` + e.message);
        }
    }
    //select top 4 blog (nb views)
    const getTopViewsBlog = async () => {
        let statement = `SELECT id, title, image, description, views, dateB FROM blog ORDER BY views DESC LIMIT 4`
        try {
            const rows = await db.all(statement);
            if (!rows.length) throw new Error(`no rows found`);
            return rows;
        } catch (e) {
            throw new Error(`couldn't retrieve blogs: ` + e.message);
        }
    }

    //select blog by feature
    const getBlogFeature = async () => {
        let statement = `SELECT id,title, description, image , views, dateB FROM blog WHERE isFeatured=1 LIMIT 6`
        try {
            const rows = await db.all(statement);
            if (!rows.length) throw new Error(`not found`);
            return rows;
        } catch (e) {
            throw new Error(`couldn't retrieve blogs: ` + e.message);
        }
    }


    //retrives the Admins 
    const getAdminList = async () => {
        let statement = `SELECT id,email, password from admin ORDER BY email ASC`
        try {
            const rows = await db.all(statement)
            if (!rows.length) throw new Error(`no rows found`);
            return rows
        } catch (e) {
            throw new Error(`couldn't retrive Admins` + e.message)
        }
    }

    //select admin by id
    const getAdminById = async (id) => {
        let statement = `SELECT email, password FROM admin WHERE id = ${id}`
        const admin = await db.get(statement);
        // if (!admin) throw new Error(`admin not found`);
        return admin;
    }

    //add new Admin
    const createAdmin = async (props) => {
        if (!props || !props.email || !props.password) {
            throw new Error(`you must provide a email and a password`)
        }
        const { email, password } = props;
        try {
            const result = await db.run(`INSERT INTO admin (email,password) VALUES (?, ?)`, [email, password])
            const id = result.lastID;
            return id;

        } catch (e) {
            throw new Error(`couldn't insert this combination` + e.message)
        }
    }

    //update Admin
    const updateAdmin = async (id, props) => {
        const { email, password } = props
        let stmt, params = [];
        if (!props && !(props.email && props.password)) {
            throw new Error(`you must provide a email or an password`)
        }

        if (email && password) {
            stmt = `UPDATE admin SET email=?, password=? WHERE id=?`
            params = [email, password, id]
        }
        else if (!email && password) {
            stmt = `UPDATE admin SET  password=? WHERE id=?`
            params = [password, id]
        }
        else if (email && !password) {
            stmt = `UPDATE admin SET email=? WHERE id=?`
            params = [email, id]
        }
        try {
            const result = await db.run(stmt, params)
            if (result.changes === 0) throw new Error(`no changes were made`)
            return true;
        } catch (e) {
            throw new Error(`could'nt update the Admin ${id}` + e.message)
        }
    }

    //Delete Admin
    const deleteAdmin = async (id) => {
        try {
            const result = await db.run(`DELETE FROM admin WHERE id=?`, id)
            if (result.changes === 0) throw new Error(`Admin does not exists`)
            return true;

        } catch (e) {
            throw new Error(`couldn't delete the Admin` + e.message)
        }
    }

   // CRUD for contact
    // retrieves the contacts from the database
    const getContactsList = async () => {
        let statement = `SELECT id, name, email, title, message,dateC FROM contact ORDER BY dateC DESC`
        try {
            const rows = await db.all(statement);
            if (!rows.length) throw new Error(`no rows found`);
            return rows;
        } catch (e) {
            throw new Error(`couldn't retrieve contacts:  + e.message`);
        }
    }

    //Delete Contact
    const deleteContact = async (id) => {
        try {
            const result = await db.run(`DELETE FROM contact WHRERE id=?`, id)
            if (result.changes === 0) throw new Error(`Contact does not exists`)
            return true;

        } catch (e) {
            throw new Error(`couldn't delete the Contact` + e.message)
        }
    }

    //add new Contact
    const createContact = async (props) => {
        if (!props || !props.name || !props.email || !props.title || !props.message || !props.dateC) {
            throw new Error(`you must provide a name, an email, title and message`);
        }
        const { name, email, title, message,dateC} = props;
        try {
            const result = await db.run(`INSERT INTO contact (name,email,title,message,dateC) VALUES (?, ?, ?, ?,?)`, [name, email, title, message,dateC]);
            const id = result.lastID;
            return id;
        } catch (e) {
            throw new Error(`couldn't insert this combination: ` + e.message);
        }
    }

    // Select Contact by ID
    const getContactById = async (id) => {
        let statement = `SELECT id, name, email, title, message, dateC FROM contact WHERE id = ${id}`
        const contact = await db.get(statement);
        if (!contact) throw new Error(`contact not found`);
        return contact;
    }


    // CRUD for subscribers

    //add new subscribers
    const createsubscriber = async (props) => {
        if (!props || !props.email) {
            throw new Error(`you must provide a email`);
        }
        const { email } = props;
        try {
            const result = await db.run(`INSERT INTO subscriber (email) VALUES (?)`, [email]);
            const id = result.lastID;
            return id;
        } catch (e) {
            throw new Error(`couldn't insert this combination: ` + e.message);
        }
    }
    // Retrieves subscribers from database

    const getSubscribersList = async () => {
        let statement = `SELECT id,email FROM subscriber ORDER BY email DESC`
        try {
            const rows = await db.all(statement);
            if (!rows.length) throw new Error(`no rows found`);
            return rows;
        } catch (e) {
            throw new Error(`couldn't retrieve subscribers: ` + e.message);
        }
    }

    // Delete subscriber

    const deleteSubscriber = async (id) => {
        try {
            const result = await db.run(`DELETE FROM subscriber WHRERE id=?`, id)
            if (result.changes === 0) throw new Error(`Subscriber does not exists`)
            return true;

        } catch (e) {
            throw new Error(`couldn't delete the Subscriber` + e.message)
        }
    }

    // CRUD for IP
    // retrieves the IP
    // same name of table and same attributs
    const getIPList = async () => {
        let statement = `SELECT IP FROM IP ORDER BY date DESC`
        try {
            const rows = await db.all(statement);
            if (!rows.length) throw new Error(`no rows found`);
            return rows;
        } catch (e) {
            throw new Error(`couldn't retrieve IP: ` + e.message);
        }
    }

    //add ip
    const addIp =async(props)=>{
        if(!props.ip){
            throw new Error(`ip not found`);
        }
        const {ip}=props
        try {
            let statement =`INSERT INTO IP (IP) VALUES(?)`
            const result = await db.run(statement,[ip]);
            const id = result.lastID;
            return id;
        } catch (e) {
            throw new Error(`couldn't insert this combination: ` + e.message);
        }
    }

    // CRUD for comments
    // retrieve comments

    const getCommentsList = async () => {
        let statement = `SELECT desc, date FROM comments ORDER BY date DESC`
        try {
            const rows = await db.all(statement);
            if (!rows.length) throw new Error(`no rows found`);
            return rows;
        } catch (e) {
            throw new Error(`couldn't retrieve any comment: ` + e.message);
        }
    }

    // create comment
    const createComment = async (props) => {
        if (!props || !props.desc || !props.date) {
            throw new Error(`you must provide a description and an email`)
        }
        const { desc, date } = props;
        try {
            const result = await db.run(`INSERT INTO comments (desc,date) VALUES (?, ?)`, [desc, date])
            const id = result.lastID;
            return id;

        } catch (e) {
            throw new Error(`couldn't insert this combination` + e.message)
        }
    }






    const blogsController = {
        getBlogsList,
        getBlog,
        getBlogById,
        createBlog,
        updateBlog,
        deleteBlog,
        getTopViewsBlog,
        getBlogFeature

    }

    const adminsController = {
        getAdminList,
        getAdminById,
        createAdmin,
        updateAdmin,
        deleteAdmin
    }

    const contactsController = {
        getContactsList,
        deleteContact,
        createContact,
        getContactById
    }

    const subscribersController = {
        createsubscriber,
        getSubscribersList,
        deleteSubscriber
    }

    const IPController = {
        getIPList
    }

    const commentsController = {
        getCommentsList,
        createComment
    }

    const authController={
        ...require('./auth/controller')(db)
    }

    const controller = {
        blogsController,
        adminsController,
        contactsController,
        subscribersController,
        IPController,
        commentsController,
        authController
    }

    return controller;


}

//  module.exports={createtables,deleteTable}
const db = { initializeDatabase }
module.exports = db;
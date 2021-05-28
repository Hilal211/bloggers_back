const db = require('./db');
const app = require('./app')
const path = require("path");
const multer = require('multer');



//db.createtables();
//db.deleteTable()

const start = async () => {

    const initializeDatabase = await db.initializeDatabase();
    const controllerBlog = initializeDatabase.blogsController;
    const controllerAdmin = initializeDatabase.adminsController;
    const controllerContact = initializeDatabase.contactsController;
    const controllerSubscriber = initializeDatabase.subscribersController;
    const controllerIP = initializeDatabase.IPController;
    const controllerComment = initializeDatabase.commentsController;

    if (!await controllerAdmin.getAdminById(1)) {
        await controllerAdmin.createAdmin({ email: "agha@gmail.com", password: "123" })
    }

    app.get('/', (req, res) => res.send("ok"));


    /** uploader */
    const multerStorage = multer.diskStorage({
        destination: path.join(__dirname, '../public/images'),
        filename: (req, file, cb) => {
            const { fieldname, originalname } = file;
            const date = Date.now();
            // filename will be: image-1345923023436343-filename.png
            const filename = `${fieldname}-${date}-${originalname}`;
            cb(null, filename);
        }
    })
    const upload = multer({ storage: multerStorage })
    require('./auth/routes')(app, initializeDatabase.authController);

    // CREATE blogs
    app.post('/blogs/create', async (req, res, next) => {
        const { title, description, content, isFeatured, dateB, image } = req.body;

        try {
            const result = await controllerBlog.createBlog({ title, description, content, image, isFeatured, dateB });
            res.json({ success: true, result });
        } catch (e) {
            next(e);
        }
        console.log(image)
    })

    // LIST blogs
    app.get('/blogs', async (req, res, next) => {
        try {
            const blogs = await controllerBlog.getBlogsList()
            res.json({ success: true, result: blogs })
        } catch (e) {
            next(e);
        }
    })

    // LIST BY TITLE blogs
    app.get('/blogsByTitle/:title', async (req, res, next) => {
        const { title } = req.params
        try {
            const blogs = await controllerBlog.getBlog(title)
            res.json({ success: true, result: blogs })
        } catch (e) {
            next(e);
        }
    })

    // LIST BY id blogs
    app.get('/blogs/:id', async (req, res, next) => {
        const { id } = req.params
        try {
            const blogs = await controllerBlog.getBlogById(id)
            res.json({ success: true, result: blogs })
        } catch (e) {
            next(e);
        }
    })

    // LIST BY top 4 views blogs
    app.get('/blogsByViews', async (req, res, next) => {
        try {
            const blogs = await controllerBlog.getTopViewsBlog()
            res.json({ success: true, result: blogs })
        } catch (e) {
            next(e);
        }
    })



    // LIST BY top feature blogs
    app.get('/blogsFeatured', async (req, res, next) => {
        try {
            const blogs = await controllerBlog.getBlogFeature()
            res.json({ success: true, result: blogs })
        } catch (e) {
            next(e);
        }
    })

    //update blogs
    app.put('/blogs/update/:id', async (req, res, next) => {
        const { id } = req.params
        const { title, image, description, content, isFeatured, dateB } = req.body
        try {
            const result = await controllerBlog.updateBlog(id, { title, image, description, content, isFeatured, dateB })
            res.json({ success: true, result })
        } catch (e) {
            next(e);
        }
    })

    //delete blogs
    app.delete('/blogs/delete/:id', async (req, res, next) => {
        const { id } = req.params
        try {
            const result = await controllerBlog.deleteBlog(id)
            res.json({ success: true, result })
        } catch (e) {
            next(e);
        }

    })

    //List Admin
    app.get('/Admims', async (req, res, next) => {
        try {
            const admins = await controllerAdmin.getAdminList();
            res.json({ success: true, result: admins })
        } catch (e) {
            next(e);
        }
    })

    // LIST BY id Admins
    app.get('/admins/:id', async (req, res, next) => {
        const { id } = req.params
        try {
            const admin = await controllerAdmin.getAdminById(id)
            res.json({ success: true, result: admin })
        } catch (e) {
            next(e);
        }
    })


    //Create Admin
    app.post('/Admins/create', async (req, res, next) => {
        const { email, password } = req.body
        console.log(req.body)
        try {
            const admin = await controllerAdmin.createAdmin({ email, password });
            res.json({ success: true, result: admin })
        } catch (e) {
            next(e);
        }
    })

    //Update Admin
    app.put('/Admins/update/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const { email, password } = req.body;
            const result = await controllerAdmin.updateAdmin(id, { email, password });
            res.json({ success: true, result })
        } catch (e) {
            next(e);
        }
    })

    //delete Admin
    app.delete('/Admin/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await controllerAdmin.deleteAdmin(id)
            res.json({ success: true, result })
        } catch (e) {
            next(e);
        }
    })

  // List Contact
  app.get('/Contacts',async (req,res,next)=>{
    try{
        const contacts=await controllerContact.getContactsList();
        res.json({success:true, result:contacts})
    }catch(e){
        next(e);
    }
})

// Contact list by id
app.get('/contactsDetails/:id', async (req, res, next) => {
    const {id}=req.params
    try{
    const contact = await controllerContact.getContactById(id)
    res.json({ success: true, result: contact })
    }catch(e){
        next(e);
    }
})

    // delete contact
    app.delete('/Contacts/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await controllerContact.deleteContact(id)
            res.json({ success: true, result })
        } catch (e) {
            next(e);
        }
    })

    // create contact


    app.post('/Contacts/create', async (req, res, next) => {
        const { name, email, title, message, dateC } = req.body
        try {
            const contact = await controllerContact.createContact({ name, email, title, message, dateC });
            res.json({ success: true, result: contact })
        } catch (e) {
            next(e);
        }
    })

    // CREATE subscribers
    app.post('/subscribers/create', async (req, res, next) => {
        const { email } = req.body;

        try {
            const result = await controllerSubscriber.createsubscriber({ email });
            res.json({ success: true, result });
        } catch (e) {
            next(e);
        }

    })

    // List subscribers
    app.get('/Subscribers', async (req, res, next) => {
        try {
            const subscribers = await controllerSubscriber.getSubscribersList();
            res.json({ success: true, result: subscribers })
        } catch (e) {
            next(e);
        }
    })

    // delete subscriber
    app.delete('/Subscribers/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await controllerSubscriber.deleteSubscriber(id)
            res.json({ success: true, result })
        } catch (e) {
            next(e);
        }
    })

    // List IP
    app.get('/IP', async (req, res, next) => {
        try {
            const IPs = await controllerIP.getIPList();
            res.json({ success: true, result: IPs })
        } catch (e) {
            next(e);
        }
    })


    // create comment
    app.post('/Comments/create', async (req, res, next) => {
        const { asc, date } = req.body;
        try {
            const result = await controllerComment.createComment({ asc, date });
            res.json({ success: true, result });
        } catch (e) {
            next(e);
        }
    })

    //list comment
    app.get('/Comment', async (req, res, next) => {
        try {
            const comments = await controllerComment.getCommentsList();
            res.json({ success: true, result: comments })
        } catch (e) {
            next(e);
        }
    })

}
start()

app.listen(8000, () => console.log('server listening on port 8000'))

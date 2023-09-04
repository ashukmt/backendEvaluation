const express = require("express");
const {connection} = require("./config/db");
const {UserModel} = require("./models/User.model");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {authentication} = require("./middelwares/authentication.middlewares")
const {BlogModel} = require("./models/Blog.model")
require("dotenv").config();



const app = express();
app.use(express.json());

const PORT = process.env.PORT

app.get("/",(req,res)=>{
    res.send("base api end point")
})


app.post("/signup",(req,res)=>{
    const {email,password,name} = req.body;

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt,async function(err, hash) {
            // Store hash in your password DB.
            const new_user = new UserModel({
                email,
                password : hash,
                name
            })
            await new_user.save();
            res.send({msg : "signup successfull"}) 
        });
    });
})

app.post("/login",async(req,res)=>{
    const {email,password} = req.body; 
    const is_user = await UserModel.findOne({email})
    if(is_user){
        const hashed_password = is_user.password;
        const result = bcrypt.compareSync(password, hashed_password);
        if(!result){
            res.send({msg : "Login Failed"})
        }
        else{
            var token = jwt.sign({userId : is_user._id },process.env.SECRET_KEY);
            res.send({msg : "Login Successful",token : token})
            }
    }
    else{
        res.send({msg : "Plz Signup First"})
    }
})

app.get("/blogs/get",authentication,async(req,res)=>{
    try{
        const blogs = await BlogModel.find({user_id : req.userId});
        res.send(blogs)    
    }
    catch(err){
        res.send({msg:"error getting"})
    }
 
})

app.get("/blogs",authentication,async(req,res)=>{
    try{
     const all_blogs = await BlogModel.find();
     res.send(all_blogs)
    }
    catch(err){
        res.send({msg : "error getting"})
    }
})


app.post("/blogs/add",authentication,async(req,res)=>{
    const{title,category,author,content} = req.body;
    const userId = req.userId;
    const new_blog = new BlogModel({
        title,
        category,
        author,
        content,
        user_id : userId
    })
    try{
       await new_blog.save();
        return res.send({msg:"Blog Added Successfully"})
    }
    catch(err){
        console.log(err)
        res.send({msg:"Error Occured while adding blog"})
    }   
})

app.patch("/blogs/edit/:blogID",authentication,async(req,res)=>{
    const {blogID} = req.params;
    try{
      const blogs = await BlogModel.findOneAndUpdate({_id : blogID, user_id : req.userId},{...req.body});
      if(blogs){ 
        res.send({msg : "Blog Updated Successfully"})   
    }
    else{
        res.send({msg : "blog not found"})   
    }
    }
    catch(err){
        console.log(err)
       res.send({msg:"error getting"})
    }
})



app.delete("/blogs/delete/:blogID",authentication,async(req,res)=>{
    const {blogID} = req.params;
   try{
       const blogs = await BlogModel.findOneAndDelete({_id : blogID, user_id : req.userId}); 
       if(blogs){ 
           res.send({msg : "blog deleted successfully"})   
       }
       else{
           res.send({msg : "blog not found"})   
       }
   }
   catch(err){
       console.log(err)
       res.send({msg:"error getting"})
   }

}) 







app.listen(PORT,async()=>{ 
    try{
      await connection;
      console.log("connected to db successfully");
    }
    catch(err){
        console.log(err);
        console.log("error in connecting to db")
    }
    console.log("listening on port")
})
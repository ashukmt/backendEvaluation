const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = (req,res,next) =>{
    const token = req.headers.authorization?.split(" ")[1]; 
    if(!token){
        res.send({msg : "Plz Login First"})
    }
    else{
        jwt.verify(token,process.env.SECRET_KEY, function(err, decoded) {
            if(err){
                res.send({msg : "Plz Login First"})
            }
            else{
                const {userId} = decoded;
                req.userId = userId;
                next();
            }
          });
    }
}

module.exports = {
    authentication
}
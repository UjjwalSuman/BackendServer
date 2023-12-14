const jwt = require("jsonwebtoken");
require("dotenv").config();

//Auth
exports.auth = (req, res, next) => {
    try{
        //extract JWT token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", "");

        //if token missing
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'Token Missing',
            });
        }

        //verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch(error) {
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    } 
    catch(error) {
        return res.status(401).json({
            success:false,
            message:'Something went wrong, while verifying the token',
        });
    }
   
}

//isStudent
exports.isStudent = (req, res, next) => {
    try{
            if(req.user.accountType !== "Student") {
                return res.status(401).json({
                    success:false,
                    message:'THis is a protected route for students only',
                });
            }
            next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User Role is not matching',
        })
    }
}
//isInstructor
exports.isInstructor = (req, res, next) => {
    try{
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success:false,
                message:'THis is a protected route for Instructor Only',
            });
        }
        next();
}
catch(error) {
    return res.status(500).json({
        success:false,
        message:'User Role is not matching',
    })
}
}
//isAdmin
exports.isAdmin = (req, res, next) => {
    try{
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success:false,
                message:'THis is a protected route for Admin Only',
            });
        }
        next();
}
catch(error) {
    return res.status(500).json({
        success:false,
        message:'User Role is not matching',
    })
}
}
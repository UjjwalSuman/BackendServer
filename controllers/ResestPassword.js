const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) =>{
    try{
        //get email from req ki body
        const {email} = req.body.email;

        //check user for this email, email validation
        const user = await User.findOne({email:email});
        //if not a registered user
        if(!user) {
            return res.status(401).json({
                success:false,
                message:'User is not registered',
            });
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {
                eamil:email
            },
            {
                token:token,
                resetPasswordExpires:Date.now() + 5*60*1000,
            },
            {new:true}//return updated document in response
        )

        //create url
        const url = `https://localhost:3000/update-password/${token}`;

        //send mail containing the url
        await mailSender(email,
            "Password Reset Link",
            `Password Reset lInk : ${url}`
            );

        //return response
        return res.json({
            success:true,
            message:"Email sent successfully, please check email and change password"
        })
    }catch(error){
        console.log("Error while resetPasswordToken ",error);
        return res.status(500).json({
            success:false,
            message:"Somthing went wrong while sending mail"
        });
    }
}


//resetPassword
exports.resetpassword = async (res, req) =>{
    try{
        //data fetch
        const {password, confirmPassword, token} = req.body;

        //validation 
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:'Password not matching',
            });
        }

        //get user details from db using token
        const userDetails = await User.findOne({token: token});

        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:'Token is Invalid',
            });
        }

        //token time check
        if( userDetails.resetPasswordExpires < Date.now() ){
            return res.json({
                success:false,
                message:'Token is Expired, please regenarate your token',
            });
        } 

        //hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )

        //return response
        return res.json({
            success:true,
            message:"Password changed successfully"
        })

    }catch(error){
        console.log("Error while resetPasswordToken ",error);
        return res.status(500).json({
            success:false,
            message:"Somthing went wrong while reseting password"
        });
    }
}

const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
require("dotenv").config();



//send otp
exports.sendOTP = async (res, req) => {

    try{
        //ferch email from request ki body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user already exist, then return response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already exist please with new Email Id"
            })
        }

        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        //check unique otp or not
        let result = await OTP.findOne({otp: otp});

        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        //created an entry in DB for OTP 
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfull
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })
    }catch(error){
        console.log("Error while generating OTP",error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//signin
exports.singup = async (req, res) => {
    try{
        //data fetch from request ki body
        const {
            firstName,
            lastName,
            email, 
            password, 
            confirmPassword,
            accountType,
            contactNumber,
            otp
            } = req.body;

        //validate karlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp ){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }

        //2 password match kar lo
        if(password !== confirmPassword) {
            return res.status(400).json ({
                success:false,
                message: 'password and confirmPassword is not same, please try again later'
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exist",
            });
        }

        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        //validate the OTP
        if(recentOtp.length == 0) {
            return res.status(400).json({
                success:false,
                message:"OTP field is empty please fill the OTP and try again",
            })
        }else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success:false,
                message:"OTP Invalid please try again",
            })
        }

        //HASH password
        const hashedPassword = await bcrypt.hash(password, 10);

        //entry created in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about: null,
            contactNumber:null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email, 
            password:hashedPassword,
            confirmPassword,
            accountType,
            contactNumber,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //return res
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            user,
        });

    }catch(error) {
        console.log("Error while Creating user : ",error);
        return res.status(500).json({
            success:false,
            message:"User Cannot be register Please try again",
        })
    }
}

//login
exports.login = async (req,res) =>{
    try{
        //data fetch
        const {email, password} = req.body;

        //validation on email and password
        if(!email || !password) {
            return res.status(400).json({
                success:false,
                message:'PLease fill all the details carefully',
            });
        }

        //check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");

        //if not a registered user
        if(!user) {
            return res.status(401).json({
                success:false,
                message:'User is not registered',
            });
        }

        // generate JWt, after password matching
        if(await bcrypt.compare(password,user.password) ) {
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            } 
            //password match
            const token =  jwt.sign(payload, 
                                process.env.JWT_SECRET,
                                {
                                    expiresIn:"2h",
                                });

                                
            user = user.toObject();
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true,
            }

            res.cookie("ujjwalCookie", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'User Logged in successfully',
            });
        }
        else{
            //return res
            res.status(401).json({
                success:false,
                message:'Password is Inccorect',
            });
        }
    }catch(error){
        console.log("Error while login user : ",error);
        return res.status(500).json({
            success:false,
            message:"login Failed Please try again",
        });
    }
};


//ChangePassword
exports.changePassword = async (req, res) =>{

    try{
        //get data from req ki body

        //get oldPassword, newPassword, confirmPassword

        //validation oldPassword is correct or not 

        //update pwd in DB

        //send email -password updated

        //return response
         
    }catch(error){
        console.log("Error while login user : ",error);
        return res.status(500).json({
            success:false,
            message:"login Failed Please try again",
        });
    }
    
}
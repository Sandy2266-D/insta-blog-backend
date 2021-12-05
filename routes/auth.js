const router= require ('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const requireLogin = require('../middleware/requireLogin')


//Test
// router.get('/protected',requireLogin,(req,res)=>{
//     res.send("hello user")
// })

// router.post('/register',(req,res)=>{
//     const{name,email}=req.body
//     console.log(req.body)
//     return res.json({message: "Successfully Registered"})
// })

//Sign Up
router.post('/signup',(req,res)=>{
    const {name,email,password,pic} = req.body 
    // console.log(req.body)
    if(!email || !password || !name){
       return res.status(422).json({error:"please add all the fields"})
    }

    User.findOne({email:email}) //find one of email
    .then((savedUser)=>{
       
        if(savedUser){ //user with already exists
          return res.status(422).json({error:"user already exists with that email"})
        }
     //Hash passord default:10
        bcrypt.hash(password,12)
        .then(hashedPassword =>{
            const user=new User({
                email,
                password: hashedPassword,
                name,
                pic: pic
            })
            user.save() //save to db
            .then(user=>{
               return res.json({message:"Saved successfully"})

            })
            .catch(err=>
            {
                console.log(err);
            })
        })   
    })
    .catch(err=>{
        console.log(err)
    })
   return res.json({message: "Successfully Registered"})
  })

//Signin
  router.post('/signin',(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
       return res.status(422).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
           return res.status(422).json({error:"Invalid Email or password"})
        }
        bcrypt.compare(password,savedUser.password) //compare register with login
        .then(doMatch=>{
            if(doMatch){
                // res.json({message:"successfully signed in"})
                const token = jwt.sign({_id:savedUser._id},process.env.JWT_SECRET)
               const {_id,name,email,followers,following,pic} = savedUser
               res.json({token,user:{_id,name,email,followers,following,pic}})
            // const {_id,name,email}= savedUser
            
            
            }
            else{
                return res.status(422).json({error:"Invalid Email or password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})

module.exports = router
    import passport from "passport"; 
    import { Strategy } from "passport-local";
    import { mockUsers } from "../utils/constants.mjs";
    import { User } from "../mongoose/schemas/user.mjs";
    import { comparePassword } from "../utils/helpers.mjs";
    passport.serializeUser((user,done)=>{
        console.log(`in serializeUser:`);
        console.log(user);
        done(null,user.id); //pass uniquie field like id or username in 2nd field
    }); //it takes the validated user details and store it in the session
    
    passport.deserializeUser(async(id, done)=>{        // username or id is used in argument bcz it is used in done() in serializeUser parameter above.  
        console.log(`Inside deserializeUser`)
        // console.log(`deserializing userid: ${id}`);
        try {
            const findUser=await User.findById(id);
            if(!findUser)
                throw new Error('User not found');
            done(null,findUser);
            
        } catch (err) {
            done(err,null);
        }
    }); //taking that unique id stored in session

//logic for authentication using passport
export default passport.use(        //updated: authentication logic using Database
    new Strategy({usernameField:'username'},async(username,password,done)=>{    //type of username used can also be provided ,e.g: email
    console.log("inside local strategy:")
    try{
        const findUser=await User.findOne({username});  //checking usernme in DB
        if(!findUser) throw new Error("user not found");
        if(!comparePassword(password, findUser.password))   //comparing client-side plain password with DB hashed password
            throw new Error("Bad credentials.");    //new way to validate hashed password}
        done(null,findUser);
        }
    catch(err){
        done(err,null);
    }

    })
   );
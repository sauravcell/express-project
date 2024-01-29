    import passport from "passport"; 
    import { Strategy } from "passport-local";
    import { mockUsers } from "../utils/constants.mjs";
    import { User } from "../mongoose/schemas/user.mjs";
    passport.serializeUser((user,done)=>{
        console.log(`in serialize user:`);
        console.log(user);
        done(null,user.id); //pass uniquie field like id or username in 2nd field
    }); //it takes the validated user details and store it in the session
    
    passport.deserializeUser(async(id, done)=>{        // username or id is used in argument bcz it is used in done() in serializeUser parameter above.  
        console.log(`Inside deserializingUser`)
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

    try{
        const findUser=await User.findOne({username});  //checking usernme in DB
        if(!findUser) throw new Error("user not found");
        if(findUser.password !== password) throw new Error("Bad credentials1.");    //validating password
        done(null,findUser);
        }
    catch(err){
        done(err,null);
    }

    })
   );
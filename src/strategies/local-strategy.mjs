   import passport from "passport"; 
   import { Strategy } from "passport-local";
   import { mockUsers } from "../utils/constants.mjs";

    passport.serializeUser((user,done)=>{
        console.log(`in serialize user:`);
        console.log(user);
        done(null,user.id); //pass uniquie field like id or username in 2nd field
    }); //it takes the validated user details and store it in the session
    
    passport.deserializeUser((id, done)=>{        // username or id is used in argument bcz it is used in done() in serializeUser parameter above.  
        console.log(`Inside deserializingUser`)
        // console.log(`deserializing userid: ${id}`);
        try {
            const findUser=mockUsers.find((user)=>user.id===id);
            if(!findUser)
                throw new Error('User not found');
            done(null,findUser);
            
        } catch (error) {
            done(err,null);
        }
    }); //taking that unique id stored in session

//logic for authentication using passport
export default passport.use(
    new Strategy({usernameField:'username'},(username,password,done)=>{    //type of username used can also be provided ,e.g: email
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
    try{
        const findUser=mockUsers.find((user)=>(user.username===username));
        if(!findUser)
            throw new Error('user not found');
        if(findUser.password!==password)
            throw new Error("Invalid Credentials");
        done(null,findUser);
        }
    catch(err){
        done(err,null);
    }

    })
   );
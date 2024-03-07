import passport from "passport";
import { Strategy } from "passport-discord";
import { DiscordUser } from "../mongoose/schemas/discord-user.mjs";
 
//serializer is called only for the first visit by a client. It takes the validated user details and store it in the session object in the form of string. Atlast it send the session id to client in a cookie for subsequent access to the site till the cookie is valid.
passport.serializeUser((user,done)=>{
    console.log(`in discord_serialize user:`);
    console.log(user);
    done(null,user.id); //pass uniquie field like id or username in 2nd field.
}); 

//deserializeUser takes back the session string from DB nd converts it back to json format, then attaches it to bck to request object. This enables us to identify who the user is nd get back his session data. It takes the help of the cookie sent by a visited client. 
passport.deserializeUser(async(id, done)=>{        // username or id is used in argument bcz it is used in done() in serializeUser parameter above.  
    console.log(`Inside discord_deserializeUser`)
    console.log(`deserializing userid: ${id}`);
    try {
        const findUser=await DiscordUser.findById(id);
        return findUser ? done(null,findUser): done(null,null);
    } catch (err) {
        done(err,null);
    }
}); //taking that unique id stored in session


export default passport.use(
    new Strategy({
        clientID: '1201586746635333683',
        clientSecret: 'WXPeRVCT1v7UxoSQAUBkrlsClSSuCAfW',
        callbackURL: 'http://localhost:4000/api/auth/discord/redirect',
        scope: ['identify'],
        // scope: ['identify','guilds','email'], //can apply this in place of above scope to get morer details from discord abt the user, which also be stored in DB.
        },
        async (accessToken,refreshToken,profile,done)=>{  //() it is a verify callback function, tokens have a fixed validity expire time. There values are obtained from code query pamameter only after a succesfull authentication as explained in index.mjs file.
        //console.log(profile);
        console.log(`inside discord logic`);
        let findUser ;
        try {
            findUser= await DiscordUser.findOne({discordId: profile.id});
        } catch (err) {
            return done(err,null);
        }
        try {
            if(!findUser) { // if user doesnt exist then new record for the usser is created
                const newUser=new DiscordUser({
                    username: profile.username,
                    discordId: profile.id,
                });            
            const newSavedUser = await newUser.save();
            return done(null,newSavedUser);
            }
            return done(null,findUser); //else if the findUser is defined then
        } 
        catch(err) {
            console.log(err);
            return done(err,null);
        }

    })  
)
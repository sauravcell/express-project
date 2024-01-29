import bcrypt from "bcrypt";
const saltRounds = 10;  // defining number of rounds. The higher the number, the more secure (and slower) the hashing process becomes.

//to create hashed password while saving new entry
export const hashPassword = (password)=>{
    const salt = bcrypt.genSaltSync(saltRounds); //can also use async/await. The synchronous version blocks the execution of the program until the salt is generated, while the asynchronous version (bcrypt.genSalt) doesn't block the event loop.
    console.log(salt);
    return bcrypt.hashSync(password,salt) //optional async method (bcrypt.hash()) 
    
};

//to compare with hashed password while logging
export const comparePassword=(plain,hashed)=>{
    return bcrypt.compareSync(plain,hashed);   //bcrypt.compare() <- async version
}
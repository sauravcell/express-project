const createUserValidationSchema={
    username:{
        isLength:{
            options:{
                min:5,
                max:32
            },
            errorMessage:"username must have atleast 5 to 32 characters."
        },
        notEmpty: {
            errorMessage:"Username Empty"
        },
        isString: { 
            errorMessage:"UserName not a string"
        }
    },
    displayName:{
        notEmpty: {
            errorMessage:"displayname not provided"
        },
        isLength:{
            options:{
                min:4,
                max:8
            },
            errorMessage:"Displayname size should be between 4 to 8 characters."
        }
    }
};

const createQueryValidationSchema={
    filter:{
        isString:{
            errorMessage:"filter not a string"
        },
        notEmpty:{
            errorMessage:"filter not assigned"
        }
    },
    value:{
        isString:{
            errorMessage:"value not a string"
        },
        notEmpty:{
            errorMessage:"value not found"
        }
    }

};

export {createUserValidationSchema,
createQueryValidationSchema};
 




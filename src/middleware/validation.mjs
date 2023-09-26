//middleware validation  for requests which contain body
//check data in the body of request in aplliance with Joi schema

export function validate(schema) {
    return (req, res, next) => 
    { 
     if (!schema) {
     schema = req.schema;
 }
  if (schema && req.body) {
         const {error} = schema.validate(req.body);  // req.body validated; validation errors store in const error
         req.validated = true;   //check has been done
         if (error) {
         req.joiError = error.details[0].message;  //if validation is error -> first message store to req.joiError
         }
      
    }
   next();
 }
 }
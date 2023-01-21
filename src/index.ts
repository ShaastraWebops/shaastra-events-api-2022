import "reflect-metadata";
import * as dotenv from "dotenv";
import express from "express";
import resolvers from "./resolvers";
import entities from "./entities";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import { createConnection } from "typeorm";
import jwt from "jsonwebtoken";
import { User } from "./entities/User";
import {authChecker} from "./utils/auth";


dotenv.config();
const PORT = process.env.PORT || 8000 ;

const main = async () =>{

    await createConnection({
        type : "postgres",
        url : "postgresql://doadmin:AVNS_5jud4g1Rwrrfl6Hg0vZ@shaastra-do-user-7555493-0.b.db.ondigitalocean.com:25060/defaultdb",
        entities,
        synchronize : true,
        logging: true,
        ssl: true,
        extra: {
          ssl: {
            ca: process.env.cert,
            rejectUnauthorized: false,
          }
        }
     })
      .then(() => {
        console.log('Database Connected');
      })
      .catch((e) => console.log(e))
 
  const schema = await buildSchema({ resolvers , authChecker});

  const server = new ApolloServer({
    schema,
    context :  async ( { req, res } : { req: express.Request, res: express.Response } ) => {
        let user;
        if(req.headers.cookie) {
          let token = req.headers.cookie.split("; ")[0].split("token=")[1];
          console.log(req.headers.cookie.split('; '));
          // console.log(req.headers.cookie)
;          console.log(token)
          if(token){
            const decoded = jwt.verify(token,"secret") as any;
            console.log("decoded",decoded)
            user = await User.findByIds(decoded.id);
            user = user[0];
          }
         
        }
        return { req, res, user };
      },
  });

  await server.start();

  const app =express();

  app.use( 
    cors({
      credentials: true,
      origin:["https://studio.apollographql.com", "http://localhost:4000", "http://localhost:3000", "https://api.events.shaastra.org/", "https://shaastra.org"]
    })
  );


  server.applyMiddleware({ app, cors: false });
  
  app.listen(PORT , () => {
    console.log(`Server started on port ${PORT}`);
});

}

main()

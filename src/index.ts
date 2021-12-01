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

dotenv.config();
const PORT = process.env.PORT || 8000 ;

const main = async () =>{

    await createConnection({
        type : "postgres",
        url : process.env.DATABASE_URL,
        entities,
        synchronize : true,
        logging : true
     })
      .then(() => {
        console.log('Database Connected');
      })
      .catch((e) => console.log(e))
 
  const schema = await buildSchema({ resolvers});

  const server = new ApolloServer({
    schema,
    context :  async ( { req, res } : { req: express.Request, res: express.Response } ) => {
        let user;
        if(req.headers.cookie) {
          const token = req.headers.cookie.split("token=")[1];
          if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET ||  "secret" ) as any;
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
      origin:["https://studio.apollographql.com", "http://localhost:8000", "http://localhost:3000"]
    })
  );


  server.applyMiddleware({ app, cors: false });
  
  app.listen(PORT , () => {
    console.log(`Server started on port ${PORT}`);
});

}

main()
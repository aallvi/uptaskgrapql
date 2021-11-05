const {ApolloServer} = require('apollo-server')

const typeDefs = require('./db/schema')
require('dotenv').config('variables.env')
const resolvers = require('./db/resolvers')
const jwt = require('jsonwebtoken')
const conectarDB = require('./config/db')

// Conectar db
conectarDB()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
      // console.log(req.headers['authorization'])
      const token = req.headers['authorization'] || '' 
    //   console.log(token)
      if(token){

        try {
          const usuario = jwt.verify(token.replace('Bearer ',''), process.env.SECRETA)
          console.log(usuario)
          return {
              usuario
          }
            
        } catch (error) {
            console.log(error)
        }


      }
    }



});


server.listen({port: process.env.PORT || 4000}).then(( {url}) =>  console.log(`servidor listo en url ${url}`))
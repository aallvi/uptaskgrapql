const Usuario = require('../models/Usuario')
const Proyecto = require('../models/Proyecto')
const Tarea = require('../models/Tarea')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({path: 'variables.env'})
// crea y firma jwt

const crearToken = (usuario, secreta, expiresIn) => {
    const {id, email,nombre} = usuario

    return jwt.sign({id,email,nombre}, secreta, {expiresIn} )

}

const resolvers = {

    Query: {

        obtenerProyectos: async (_,{},ctx) => {
            const proyectos = await Proyecto.find({creador: ctx.usuario.id})

            return proyectos;


        },

        obtenerTareas: async (_,{input},ctx) =>{
            const tareas = await Tarea.find({creador: ctx.usuario.id}).where('proyecto').equals(input.proyecto)

            return tareas
        }
     

    },

    Mutation: {
        crearUsuario: async (_, {input} , ctx ) => {
           const {email,password} = input;
            
           const existeUsuario = await Usuario.findOne({email})

           if(existeUsuario){
               throw new Error('el usuario ya esta registrado')
           }

           try {

            //hashear password

              const salt = await bcryptjs.genSalt(10)
              input.password = await bcryptjs.hash(password, salt)
           
            console.log(input)
               const nuevoUsuario = new Usuario(input)
               console.log(nuevoUsuario)

               nuevoUsuario.save()

               return "usuario Creado Corretamente"
               
           } catch (error) {
               console.log(error)
           }


        },

     autenticarUsuario: async (_, {input} ) => {
        const {email,password} = input;

        const existeUsuario = await Usuario.findOne({email})

        if(!existeUsuario){
            throw new Error('Usuario no existe')
        }

        const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password )


        if(!passwordCorrecto){
            throw new Error('Password Incorrecto')
        }

        return {
            token: crearToken(existeUsuario, process.env.SECRETA, '2hr')
        }
        
         

     },
      nuevoProyecto: async (_, {input} , ctx ) => {

        // console.log('desde resolver',ctx)

        try {
             const proyecto = new Proyecto(input);

             //almacenarlo base de dato

             proyecto.creador = ctx.usuario.id

             const resultado = await proyecto.save()

             

             return resultado;
            
        } catch (error) {
            console.log(error)
        }

      },

      actualizarProyecto: async (_, {id,input} , ctx ) => {
       // revisar si proyecto existe

       let proyecto = await Proyecto.findById(id);
       

       if(!proyecto){
           throw new Error('Proyecto no encontrado')
       }


          if(proyecto.creador.toString() !== ctx.usuario.id  ){
              throw new Error('No tienes las credenciales para hacer eso')
          }
       // revisar qe qen lo edita es el ccreador



       // guardar proyecto

       proyecto= await Proyecto.findOneAndUpdate({_id: id}, input, {new: true})

       return proyecto

      },

      eliminarProyecto: async (_, {id} , ctx ) => {

               // revisar si proyecto existe

       let proyecto = await Proyecto.findById(id);
       

       if(!proyecto){
           throw new Error('Proyecto no encontrado')
       }


          if(proyecto.creador.toString() !== ctx.usuario.id  ){
              throw new Error('No tienes las credenciales para hacer eso')
          }
       // revisar qe qen lo edita es el ccreador

       // eliminar

       await Proyecto.findOneAndDelete({_id: id});
       return "proyecto eliminado"


      },

      nuevaTarea: async (_, {input} , ctx ) => {

          try {
              const tarea = new Tarea(input)

              tarea.creador = ctx.usuario.id
              const resultado = await tarea.save()

              return resultado;
              
          } catch (error) {
              console.log(error)
          }

      },

      actualizarTarea: async (_, {id,estado,input} , ctx ) =>{

        //si tarea exsite o no

        let tarea = await Tarea.findById(id)

        if(!tarea){
            throw new Error('Tarea no encontrada')
        }
        // si el propietarioe s qen lo edita
       
        if(tarea.creador.toString() !== ctx.usuario.id  ){
            throw new Error('No tienes las credenciales para hacer eso')
        }

        // asignar estado

        input.estado = estado;

        //guardar yretornar tarea
         tarea = await Tarea.findOneAndUpdate({_id: id}, input, {new:true} )

         return tarea;
          
      },
      eliminarTarea: async (_, {id} , ctx ) =>{

        let tarea = await Tarea.findById(id)

        if(!tarea){
            throw new Error('Tarea no encontrada')
        }
        // si el propietarioe s qen lo edita
       
        if(tarea.creador.toString() !== ctx.usuario.id  ){
            throw new Error('No tienes las credenciales para hacer eso')
        }

        // eliminar

        await Tarea.findOneAndDelete({_id:id});

        return "Tarea Eliminada"


 
      }

    }
}

module.exports = resolvers;
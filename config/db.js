const mongoose = require('mongoose')

require('dotenv').config({path: 'variables.env'});

const conectarDB = async() => {

    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
           
        })

        console.log('db conectada')
        
    } catch (error) {
        console.log('Hubo un error')
        console.log(error);
        process.exit(1)
    }

}

module.exports = conectarDB
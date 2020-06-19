const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');


const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        

        if( !data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesartio'
            });
        }

        client.join(data.sala);

        usuarios.agregarPersona( client.id, data.nombre , data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));

        callback(usuarios.getPersonasPorSala(data.sala));

    });

    client.on('crearMensaje', (data) => {

        let perosna = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(perosna.nombre, data.mesnaje);
        client.broadcast.to(perosna.sala).emit('crearMensaje', mensaje);
    });




    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salio`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));
    });
   

    // Mensaje privados

    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
       //"jHCm1z6rTp72qO2SAAAM"

        

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje) );

    });
    

});
const express = require('express');
const bodyParser = require('body-parser');

// Constants
const hostname = '0.0.0.0';
const port = 8080;

// // Connect to mongodb server
//const MongoClient = require('mongodb').MongoClient;
const { MongoClient } = require('mongodb');
// /* Your url connection to mongodb container */
const url = 'mongodb://mongodb:27017';
//Nombre de Base Datos a la que se conectara
const dbname='Colegio';
//funcion para conectar y realizar operaciones con MongoDB

// App
const app = express();

// GET method route
app.get('/', function (req, res) {
    res.send('GET request to the homepage');
});
  
// POST method route
app.post('/', function (req, res) {
    res.send('POST request to the homepage');
});

// GET method route
app.get('/secret', function (req, res, next) {
    res.send('Never be cruel, never be cowardly. And never eat pears!');
    console.log('This is a console.log message.');
});

/*
Your implementation here 
*/

// Configurar body-parser como middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function connectToMongoDB() {
    try {
      // Crear una instancia del cliente de MongoDB
      const client = new MongoClient(url, { useUnifiedTopology: true });
  
      // Conectar al servidor de MongoDB
      await client.connect();
  
      console.log('Conexión exitosa a MongoDB');
  
      // Seleccionar la base de datos
      const db = client.db(dbname);
  
      // realizar  operaciones con la base de datos
      app.get('/coleccion', async (req, res) => {
        try {
          const collection = db.collection('users'); 
      
          const documents = await collection.find({}).toArray();
          res.json(documents);
        } catch (err) {
          console.error('Error al consultar la colección:', err);
          res.status(500).json({ error: 'Ocurrió un error al consultar la colección' });
        }
      });

      app.put('/coleccionUpd', async (req, res) => {
        const collection = db.collection('users'); 



        const query = req.query; // Obtén el query enviado en la URL
        const updateFields = req.body; // Obtén los campos a actualizar del cuerpo de la solicitud

        console.log('Query recibido:', query);
        console.log('Campos de actualización recibidos:', updateFields);
        
        collection.findOneAndUpdate(
          query, // La condición o query para encontrar el documento a actualizar
          { $set: updateFields }, // Los campos y valores a actualizar
          { upsert: true, returnOriginal: false }, // Opciones: si no se encuentra, se crea uno nuevo (upsert) y se devuelve el nuevo documento actualizado
          (err, result) => {
            if (err) {
              console.error('Error al actualizar el documento:', err);
              res.status(500).json({ error: 'Ocurrió un error al actualizar el documento' });
            } else if (!result.value) {
              // Si no se encontró un documento, se crea uno nuevo
              res.status(201).json({ message: 'Documento creado', updatedDocument: result.value });
            } else {
              res.status(200).json({ message: 'Documento actualizado', updatedDocument: result.value });
            }
          }
        );
      });

      app.delete('/coleccionDel', async (req, res) => {
        const collection = db.collection('users');
        const query = req.query; // Obtén el query enviado en la URL
      
        collection.deleteMany(query)
          .then(result => {
            if (result.deletedCount === 0) {
              // Si no se encontraron documentos que coincidan con la consulta
              res.status(204).json(); // No Content
            } else {
              // Si se encontraron y eliminaron documentos correctamente
              res.status(200).json({ message: 'Documentos eliminados', deletedCount: result.deletedCount });
            }
          })
          .catch(err => {
            console.error('Error al eliminar el documento:', err);
            res.status(500).json({ error: 'Ocurrió un error al eliminar el documento' });
          });
      });

      const port = 3000; // Puedes cambiar el puerto según tus necesidades
    app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);});

    
    



      // Cerrar la conexión
      //await client.close();
    } catch (error) {
      console.error('Error al conectar a MongoDB:', error);
    }
  }

//Llamar a la funcion para conectar a MongoDB
connectToMongoDB();


// GET method route
// Retrieve all documents in collection
// ...

// GET method route
// Query by a certain field(s)
// ...

/* PUT method. Modifying the message based on certain field(s). 
If not found, create a new document in the database. (201 Created)
If found, message, date and offset is modified (200 OK) */
// ...

/* DELETE method. Modifying the message based on certain field(s).
If not found, do nothing. (204 No Content)
If found, document deleted (200 OK) */
// ...

//app.listen(port, hostname);
//console.log(`Running on http://${hostname}:${port}`);


const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const Queue = require('bull');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const imageQueue = new Queue('image processing');

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Procesamiento de la cola
imageQueue.process(async (job, done) => {
  const { path, options } = job.data;
  const output = `uploads/output-${Date.now()}.jpg`; // Nombre del archivo de salida
  
  let command = `magick ${path} ${options} ${output}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return done(new Error(error.message));
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return done(new Error(stderr));
    }
    console.log(`Stdout: ${stdout}`);
    done(null, output);
  });
});

// Endpoint para subir y procesar imágenes
app.post('/upload', upload.array('image', 10), async (req, res) => { // Permitir múltiples archivos
  const files = req.files;
  const { resize, quality } = req.body;
  const processingPromises = files.map(file => {
    return new Promise((resolve) => {
      let options = '';
      if (resize) {
        options += `-resize ${resize} `;
      }
      if (quality) {
        options += `-quality ${quality} `;
      }

      imageQueue.add({
        path: file.path,
        options: options.trim()
      }).then(job => {
        job.finished().then(output => {
          resolve(output);
        });
      });
    });
  });

  const results = await Promise.all(processingPromises);
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

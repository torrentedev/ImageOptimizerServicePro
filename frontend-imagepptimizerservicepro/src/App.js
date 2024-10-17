import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, ProgressBar, Alert, Card, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [resize, setResize] = useState('');
  const [quality, setQuality] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 4) {
      setMessage('No puedes subir más de 4 imágenes a la vez.');
      return;
    }
    setFiles(e.target.files);
    setMessage('');
  };

  const handleResizeChange = (e) => {
    setResize(e.target.value);
  };

  const handleQualityChange = (e) => {
    setQuality(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length > 4) {
      setMessage('No puedes subir más de 4 imágenes a la vez.');
      return;
    }
    setProgress(0);
    setDownloadLinks([]);
    setMessage('');
    setLoading(true);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('image', files[i]);
    }
    formData.append('resize', resize);
    formData.append('quality', quality);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          setProgress(Math.round((loaded * 100) / total));
        },
      });

      setMessage('Imágenes procesadas con éxito.');
      setDownloadLinks(response.data);
    } catch (error) {
      console.error('Error al subir la imagen', error);
      setMessage('Error al subir la imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Container>
        <Row className="justify-content-md-center">
          <Col md="8">
            <h1 className="mt-5">Procesador de Imágenes</h1>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Selecciona imágenes</Form.Label>
                <Form.Control type="file" multiple onChange={handleFileChange} />
                <Form.Text className="text-muted">
                  Puedes subir hasta 4 imágenes a la vez.
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="formResize" className="mb-3">
                <Form.Label>Redimensionar (Ej: 200x200)</Form.Label>
                <Form.Control type="text" value={resize} onChange={handleResizeChange} placeholder="Ej: 200x200" />
              </Form.Group>
              <Form.Group controlId="formQuality" className="mb-3">
                <Form.Label>Calidad (1-100)</Form.Label>
                <Form.Control type="number" value={quality} onChange={handleQualityChange} placeholder="1-100" />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    /> Subiendo...
                  </>
                ) : (
                  'Subir y Procesar'
                )}
              </Button>
            </Form>
            {progress > 0 && <ProgressBar now={progress} label={`${progress}%`} className="mt-3" />}
            {message && (
              <Alert variant={message.includes('Error') ? 'danger' : 'success'} className="mt-3">
                {message}
              </Alert>
            )}
            {downloadLinks.length > 0 && (
              <div className="mt-3">
                <h2>Imágenes Procesadas:</h2>
                <Row>
                  {downloadLinks.map((link, index) => (
                    <Col key={index} md={4} className="mb-3">
                      <Card>
                        <Card.Img variant="top" src={`http://localhost:3000/${link}`} />
                        <Card.Body>
                          <Card.Title>Imagen {index + 1}</Card.Title>
                          <Button variant="primary" href={`http://localhost:3000/${link}`} download>
                            Descargar
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <footer className="footer mt-auto py-3 bg-light text-center">
        <Container>
          <span className="text-muted">Un desarrollo de Torrente Dev SAS</span>
        </Container>
      </footer>
    </div>
  );
}

export default App;

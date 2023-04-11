import * as React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const history = useHistory();

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    fetch('/uploadFile', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const { id } = data;
        history.push(`/musicPlayer/${id}`);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        history.push(`/musicPlayer/null`);
      });
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {selectedFile ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: 2, color: 'black' }}>{selectedFile.name}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button variant="contained" onClick={handleSubmit} sx={{ marginRight: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#222' } }}>Submit</Button>
              <Button variant="contained" onClick={handleCancel} sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: '#d9534f' } }}>Cancel</Button>
            </Box>
          </Box>
        ) : (
          <>
            <input
              accept="*"
              style={{ display: 'none' }}
              id="file-upload-button"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload-button" style={{ textAlign: 'center' }}>
              <Button variant="contained" component="span" sx={{ backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#222' } }}>
                Upload File
              </Button>
            </label>
          </>
        )}
      </Box>
    </Container>
  );
}

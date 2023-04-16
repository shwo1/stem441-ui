import * as React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import './UploadPage.css';
import logo from './stem441-high-resolution-logo-color-on-transparent-background.png';

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
        history.push(`/musicPlayer/1`);
      });
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="logo" style={{ maxWidth: '60%', height: 'auto', marginBottom: '1rem' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFBE79', marginBottom: '3rem' }}>
          给音乐分轨
        </Typography>
        {selectedFile ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: 2, color: '#FFBE79' }}>{selectedFile.name}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button variant="contained" onClick={handleSubmit} sx={{ marginRight: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#222' } }}>开始分轨</Button>
              <Button variant="contained" onClick={handleCancel} sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: '#d9534f' } }}>取消</Button>
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
                上传文件
              </Button>
            </label>
          </>
        )}
      </Box>
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
    </Container>
  );
}

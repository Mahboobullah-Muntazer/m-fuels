import React, { useState } from 'react';
import axios from 'axios';

const BackupAndRestore = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;


  const handleBackup = async () => {
    try {
      const { data, headers } = await axios.get(
        SERVER_PATH+'api/actions/backup', {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          // Check if progressEvent.target is defined before accessing properties
          if (progressEvent.target) {
            const totalLength = progressEvent.lengthComputable
              ? progressEvent.total
              : progressEvent.target.getResponseHeader('content-length') ||
                progressEvent.target.getResponseHeader('x-decompressed-content-length');

            if (totalLength) {
              setProgress(Math.round((progressEvent.loaded * 100) / totalLength));
            }
          }
        },
      });

      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup.tar.gz';
      a.click();

      URL.revokeObjectURL(url);

      console.log('Backup successful!');
    } catch (error) {
      console.error('Backup failed:', error.message);
    }
  };

  const handleRestore = async () => {
    try {
      if (!selectedFile) {
        alert('Please select a backup file for restore.');
        return;
      }
  
      const formData = new FormData();
      formData.append('backupFile', selectedFile);
  
      const response = await axios.post(SERVER_PATH + 'api/actions/restore', formData);
  
      alert(response.data.message);
    } catch (error) {
      console.error('Restore failed:', error.message);
    }
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    // If you need to use the file content, you can read it here
    // For example, to read the content as text:
    // const reader = new FileReader();
    // reader.onload = (event) => {
    //   const content = event.target.result;
    //   // Do something with the file content
    //   console.log(content);
    // };
    // reader.readAsText(file);
  };

  const handleBrowseClick = () => {
    // Trigger the file input programmatically when "Browse" is clicked
    document.getElementById('fileInput').click();
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-md shadow-md">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="backupInput">
          Backup/Restore Input
        </label>
        <div className="flex items-center">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleBrowseClick}
          >
            Browse
          </button>
          <input
            className="ml-2 w-full py-2 px-3 border border-gray-300 rounded-md"
            type="text"
            id="backupInput"
            placeholder="Enter text..."
            value={selectedFile ? selectedFile.name : ''}
            disabled
          />
        </div>
        <div className="mt-4 flex items-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleRestore}
          >
            Restore
          </button>
          <button
            className="ml-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleBackup}
          >
            Backup
          </button>
        </div>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />
         {progress > 0 && (
        <div>
          <p>Backup Progress: {progress}%</p>
          <progress value={progress} max="100" />
        </div>
      )}
      </div>
    </div>
  );
};

export default BackupAndRestore;

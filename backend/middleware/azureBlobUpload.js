const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

// Multer memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.'), false);
  }
};

const uploadMemory = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Middleware to upload buffer to Azure Blob Storage
const uploadToAzureBlob = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file to upload
  }

  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_CONTAINER_NAME || 'sahakara-documents';

    if (!connectionString || connectionString === 'your_azure_connection_string_here') {
      return res.status(500).json({ success: false, message: 'Azure Blob Storage connection string is missing or invalid.' });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create container if it does not exist
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create({ access: 'blob' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const blobName = `${req.file.fieldname}-${uniqueSuffix}${path.extname(req.file.originalname)}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    // Attach Azure properties to req.file
    req.file.azureUrl = blockBlobClient.url;
    req.file.azureBlobName = blobName;
    
    next();
  } catch (error) {
    console.error('Azure Blob Upload Error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document to Azure Storage', error: error.message });
  }
};

module.exports = {
  uploadMemory,
  uploadToAzureBlob
};

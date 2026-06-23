const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type! Allowed: images, pdf, doc, docx, ppt, pptx, xls, xlsx, zip, rar.'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;

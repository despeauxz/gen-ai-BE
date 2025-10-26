const whitelist = [
  'http://localhost:5173',
  'http://localhost:3000',
]    

export const handleCors = function(req, callback) {
  let corsOptions;
  const origin = req.headers.origin
  if (whitelist.includes(origin)) {
    corsOptions = { origin: true }; 
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions)
};
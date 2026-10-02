export default (schema) => (req, res, next) => {
  // Validate and strip unknown keys (useful for multipart/form-data where file fields may appear)
  const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: true });
  if (error) {
    console.error('Validation error on', req.method, req.originalUrl, 'body:', JSON.stringify(req.body), 'errors:', error.details.map(d => d.message));
    return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
  }
  // Replace req.body with the sanitized value so downstream uses cleaned data
  req.body = value;
  return next();
};

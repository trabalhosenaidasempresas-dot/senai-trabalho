export const successResponse = (res, data = null, message = 'Operação realizada com sucesso', status = 200) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(status).json(payload);
};

export const listResponse = (res, data, pagination = null, message = 'Operação realizada com sucesso', status = 200) => {
  const payload = { success: true, message, data };
  if (pagination) payload.pagination = pagination;
  return res.status(status).json(payload);
};

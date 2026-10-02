import * as dashboardService from '../services/dashboardService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { successResponse } from '../utils/response.js';

export const summary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  return successResponse(res, summary, 'Resumo do dashboard');
});

export default { summary };

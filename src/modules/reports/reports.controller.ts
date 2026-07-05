import type { Request, Response } from 'express';
import { sendSuccess } from '../../lib/response.js';
import {
  reportDateRangeQuerySchema,
  topProductsQuerySchema,
} from './reports.schema.js';
import * as reportsService from './reports.service.js';

export async function getDashboardSummary(req: Request, res: Response) {
  const query = reportDateRangeQuerySchema.parse(req.query);
  const data = await reportsService.getDashboardSummary(query);
  sendSuccess(res, data);
}

export async function getSalesByDay(req: Request, res: Response) {
  const query = reportDateRangeQuerySchema.parse(req.query);
  const data = await reportsService.getSalesByDay(query);
  sendSuccess(res, data);
}

export async function getOrdersByStatus(req: Request, res: Response) {
  const query = reportDateRangeQuerySchema.parse(req.query);
  const data = await reportsService.getOrdersByStatus(query);
  sendSuccess(res, data);
}

export async function getTopProducts(req: Request, res: Response) {
  const query = topProductsQuerySchema.parse(req.query);
  const data = await reportsService.getTopProducts(query);
  sendSuccess(res, data);
}

export async function getLowStockProducts(req: Request, res: Response) {
  const data = await reportsService.getLowStockProductsReport();
  sendSuccess(res, data);
}

export async function getNewCustomers(req: Request, res: Response) {
  const query = reportDateRangeQuerySchema.parse(req.query);
  const data = await reportsService.getNewCustomersReport(query);
  sendSuccess(res, data);
}

export async function getPaymentMethodSummary(req: Request, res: Response) {
  const query = reportDateRangeQuerySchema.parse(req.query);
  const data = await reportsService.getPaymentMethodSummary(query);
  sendSuccess(res, data);
}

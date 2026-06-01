import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      if (parsed.body) {
        req.body = parsed.body;
      }

      if (parsed.params) {
        req.params = parsed.params;
      }

      if (parsed.query) {
        req.query = parsed.query;
      }

      next();
    } catch (error) {
      next(error as ZodError);
    }
  };
};
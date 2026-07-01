import { z } from "zod";

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({ success: false, errors: result.error.issues });
    }
    req[source] = result.data;

    next();
  };
};

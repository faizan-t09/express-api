import { Request, Response } from "express";

const logger = (req: Request, res: Response, next: any) => {
  console.log("Got a request : ")
  console.log(`Route : ${req.url}`)
  console.log(`Method : ${req.method}`)
  console.log(`Query : ${JSON.stringify(req.query)}`)
  console.log(`Body : ${JSON.stringify(req.body)}\n`)
  next()
};

export default logger;

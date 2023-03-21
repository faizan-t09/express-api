import * as express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./Routers/userRouter";
import roleRouter from "./Routers/roleRouter";
import logger from "./logger";
dotenv.config();

const app = express.default();

app.use(express.json());
app.use(cors());

app.use(logger);
app.use("/user", userRouter);
app.use("/role", roleRouter);
// Multer start
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const upload = multer({ storage: storage })

app.post('/fileUpload',upload.single("attachment"),(req, res) => {
  res.status(200).json("File Uploaded successfully");
})

// Multer end


app.get("*", (req: express.Request, res: express.Response) => {
  res.status(404).send("Page not found");
});

app.listen(process.env.PORT || "8000", () => {
  console.log("App listening on port : " + process.env.PORT);
});

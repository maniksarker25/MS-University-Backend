/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  application,
} from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
const app: Application = express();

// parser
app.use(express.json());
app.use(cors());

// application routers ----------------
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  const a = 10;
  res.send(a);
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;

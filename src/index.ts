import express, { NextFunction, Request, Response } from "express";
import { Worker } from "worker_threads";
import async from "async";

const app = express();
const MAX_CONCURRENT_TASKS = 5;

const taskQueue = async.queue<{ fn: () => Promise<any>; res: Response }>(
  async (params, queueNext) => {
    try {
      const taskResult = await params.fn();

      params.res.status(200).json({ taskResult });

      queueNext();
    } catch (err: any) {
      params.res.status(400).json({ message: "Error here" });
      queueNext(err);
    }
  },
  MAX_CONCURRENT_TASKS,
);

const bulkheadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const runningTasks = taskQueue.running();

  if (runningTasks >= MAX_CONCURRENT_TASKS) {
    res.status(503).json({
      message: "Service unavailable sorry, try again later",
    });
    return;
  }

  next();
};

const executeTask = () => {
  const hardTaskString = `
        const { parentPort } = require('worker_threads');
        let sum = 0;
        for (let i = 0; i < 1e8; i++) {
            sum += i;
        }
        parentPort.postMessage(sum);
    `;

  return new Promise((resolve, reject) => {
    const worker = new Worker(hardTaskString, { eval: true });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
};

app.get("/bulkhead", bulkheadMiddleware, (req: Request, res: Response) => {
  taskQueue.push(
    { fn: executeTask, res },
    (err) => {
      if (err) {
        console.error("Queue error:", err);
      } else {
        console.log("Task finished successfully.");
      }
    },
  );

  console.log(
    `Task added to queue. Pending: ${taskQueue.length()}, Running: ${taskQueue.running()}`,
  );
});

app.get("/other", bulkheadMiddleware, (req: Request, res: Response) => {
  res.status(200).json({ message: "The endpoint will go working!" });
});

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

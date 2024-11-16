"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const worker_threads_1 = require("worker_threads");
const async_1 = __importDefault(require("async"));
const app = (0, express_1.default)();
const MAX_CONCURRENT_TASKS = 5;
const os_1 = __importDefault(require("os"));
const CPU_THRESHOLD = 80; // Limite de uso da CPU em %
const MEMORY_THRESHOLD = 500; // Limite de uso de memória em MB
const CHECK_INTERVAL = 1000; // Intervalo de checagem em milissegundos
function checkSystemResources() {
    const freeMemory = os_1.default.freemem() / 1024 / 1024; // Convertendo para MB
    const totalMemory = os_1.default.totalmem() / 1024 / 1024; // Convertendo para MB
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100; // Uso de memória em %
    const cpus = os_1.default.cpus();
    const cpuUsage = cpus.reduce((total, cpu) => {
        const { user, nice, sys, idle, irq } = cpu.times;
        const totalTime = user + nice + sys + idle + irq;
        const usage = ((totalTime - idle) / totalTime) * 100;
        return total + usage;
    }, 0) / cpus.length; // Média de uso da CPU
    console.log(`CPU Usage: ${cpuUsage.toFixed(2)}%`);
    console.log(`Memory Usage: ${usedMemory.toFixed(2)} MB (${memoryUsage.toFixed(2)}%)`);
    // Verifica se ultrapassou os limites
    if (cpuUsage > CPU_THRESHOLD) {
        console.warn(`CPU usage exceeded the threshold of ${CPU_THRESHOLD}%!`);
        // Adicione aqui a lógica para mitigar a sobrecarga, como reduzir tarefas.
    }
    if (usedMemory > MEMORY_THRESHOLD) {
        console.warn(`Memory usage exceeded the threshold of ${MEMORY_THRESHOLD} MB!`);
        // Adicione aqui a lógica para liberar memória ou parar tarefas.
    }
}
setInterval(checkSystemResources, CHECK_INTERVAL);
const taskQueue = async_1.default.queue((params, queueNext) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskResult = yield params.fn();
        params.res.status(200).json({ taskResult });
        queueNext();
    }
    catch (err) {
        params.res.status(400).json({ message: "Error here" });
        queueNext(err);
    }
}), MAX_CONCURRENT_TASKS);
const bulkheadMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const runningTasks = taskQueue.running();
    if (runningTasks >= MAX_CONCURRENT_TASKS) {
        res.status(503).json({
            message: "Service unavailable sorry, try again later",
        });
        return;
    }
    next();
});
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
        const worker = new worker_threads_1.Worker(hardTaskString, { eval: true });
        worker.on("message", resolve);
        worker.on("error", reject);
    });
};
app.get("/bulkhead", bulkheadMiddleware, (req, res) => {
    taskQueue.push({ fn: executeTask, res }, (err) => {
        if (err) {
            console.error("Queue error:", err);
        }
        else {
            console.log("Task finished successfully.");
        }
    });
    console.log(`Task added to queue. Pending: ${taskQueue.length()}, Running: ${taskQueue.running()}`);
});
app.get("/other", bulkheadMiddleware, (req, res) => {
    res.status(200).json({ message: "The endpoint will go working!" });
});
process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at:", p, "reason:", reason);
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

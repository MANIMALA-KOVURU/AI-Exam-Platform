'use strict';

const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');

const FRONTEND_URL = 'http://127.0.0.1:3000';
const BACKEND_URL = 'http://127.0.0.1:8000/health';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const isPackaged = app.isPackaged;
const children = new Set();
let mainWindow;
let quitting = false;

function addChild(child, label) {
  child.label = label;
  child.output = '';
  children.add(child);
  child.once('error', (error) => {
    child.startError = error;
    child.output = `${child.output}${error.message}`.slice(-6000);
  });
  for (const stream of [child.stdout, child.stderr]) {
    stream?.on('data', (chunk) => {
      const output = chunk.toString();
      child.output = `${child.output}${output}`.slice(-6000);
      console.log(`[${label}] ${output.trimEnd()}`);
    });
  }
  child.once('close', () => children.delete(child));
  return child;
}

function isRunning(child) {
  return child.exitCode === null && child.signalCode === null;
}

function assertPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (error) => {
      reject(new Error(`Port ${port} is already in use. Close the existing service and try again.`));
    });
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

function startBackend() {
  if (isPackaged) {
    const executable = path.join(process.resourcesPath, 'backend', 'aiexam-backend.exe');
    return addChild(spawn(executable, [], {
      cwd: app.getPath('userData'),
      env: { ...process.env, UPLOAD_DIR: path.join(app.getPath('userData'), 'uploads') },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    }), 'FastAPI');
  }

  const virtualEnvPython = path.join(PROJECT_ROOT, 'backend', '.venv', 'Scripts', 'python.exe');
  const python = fs.existsSync(virtualEnvPython) ? virtualEnvPython : (process.platform === 'win32' ? 'python' : 'python3');
  const args = ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'];
  const envFile = path.join(PROJECT_ROOT, '.env');
  if (fs.existsSync(envFile)) args.push('--env-file', envFile);

  return addChild(spawn(python, args, {
    cwd: path.join(PROJECT_ROOT, 'backend'),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }), 'FastAPI');
}

function startFrontend() {
  if (isPackaged) {
    const standaloneRoot = path.join(process.resourcesPath, 'frontend');
    const serverScript = path.join(standaloneRoot, 'server.js');
    return addChild(spawn(process.execPath, [serverScript], {
      cwd: standaloneRoot,
      env: {
        ELECTRON_RUN_AS_NODE: '1',
        HOSTNAME: '127.0.0.1',
        PORT: '3000',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    }), 'Next.js');
  }

  const nextCli = path.join(PROJECT_ROOT, 'frontend', 'node_modules', 'next', 'dist', 'bin', 'next');
  const node = process.platform === 'win32' ? 'node.exe' : 'node';
  return addChild(spawn(node, [nextCli, 'dev', '--hostname', '127.0.0.1', '--port', '3000'], {
    cwd: path.join(PROJECT_ROOT, 'frontend'),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }), 'Next.js');
}

function probe(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });
    request.setTimeout(1500, () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

async function isHealthyBackend() {
  return probe(BACKEND_URL);
}

async function waitForService(child, url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.startError) {
      throw new Error(`${child.label} could not start.\n\n${child.output}`);
    }
    if (!isRunning(child)) {
      throw new Error(`${child.label} stopped during startup.\n\n${child.output || 'No process output was captured.'}`);
    }
    if (await probe(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`${child.label} did not become ready at ${url}.\n\n${child.output || 'No process output was captured.'}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'AI Exam Platform',
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.removeMenu();
  mainWindow.webContents.on('page-title-updated', (event) => {
    event.preventDefault();
    mainWindow.setTitle('AI Exam Platform');
  });
  mainWindow.once('ready-to-show', () => {
    console.log('AI Exam Platform window is ready to show.');
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('did-finish-load', () => console.log('AI Exam Platform window finished loading.'));
  mainWindow.on('closed', () => {
    console.log('AI Exam Platform window closed.');
    mainWindow = undefined;
  });
  return mainWindow.loadURL(FRONTEND_URL);
}

async function stopChild(child) {
  if (!isRunning(child)) return;
  await new Promise((resolve) => {
    const timer = setTimeout(() => resolve(), 8000);
    child.once('close', () => {
      clearTimeout(timer);
      resolve();
    });
    if (process.platform === 'win32' && child.pid) {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
      killer.once('close', () => {
        if (isRunning(child)) child.kill();
      });
    } else {
      child.kill('SIGTERM');
      setTimeout(() => { if (isRunning(child)) child.kill('SIGKILL'); }, 3000).unref();
    }
  });
}

async function stopServices() {
  await Promise.all([...children].map(stopChild));
}

app.whenReady().then(async () => {
  try {
    console.log('Starting AI Exam Platform services.');
    await assertPortAvailable(3000);
    if (!(await isHealthyBackend())) {
      await assertPortAvailable(8000);
      const backend = startBackend();
      await waitForService(backend, BACKEND_URL, 90000);
    }
    const frontend = startFrontend();
    await waitForService(frontend, FRONTEND_URL, 120000);
    await createWindow();
  } catch (error) {
    console.error('AI Exam Platform startup failed:', error.stack || error);
    dialog.showErrorBox('AI Exam Platform could not start', error.message);
    quitting = true;
    await stopServices();
    app.quit();
  }
});

app.on('before-quit', (event) => {
  console.log('Electron received before-quit.');
  if (quitting) return;
  event.preventDefault();
  quitting = true;
  stopServices().finally(() => app.quit());
});

app.on('window-all-closed', () => {
  console.log('Electron reports all windows closed.');
  app.quit();
});
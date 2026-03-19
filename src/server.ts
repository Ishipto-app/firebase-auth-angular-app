import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import 'dotenv/config';

// Initialize Firebase Admin
const serviceAccount = process.env['FIREBASE_SERVICE_ACCOUNT'];
const projectId = process.env['FIREBASE_PROJECT_ID'] || (typeof FIREBASE_PROJECT_ID !== 'undefined' ? FIREBASE_PROJECT_ID : '');

if (serviceAccount) {
  try {
    const cert = JSON.parse(serviceAccount);
    console.log('Firebase Admin: Attempting to initialize with Service Account for project:', cert.project_id);
    admin.initializeApp({
      credential: admin.credential.cert(cert)
    });
    console.log('Firebase Admin: Successfully initialized with Service Account');
  } catch (error) {
    console.error('Firebase Admin: CRITICAL ERROR parsing FIREBASE_SERVICE_ACCOUNT secret. Please ensure you pasted the ENTIRE JSON file content.');
    console.error('Error detail:', error);
    // Fallback
    if (projectId) admin.initializeApp({ projectId });
    else admin.initializeApp();
  }
} else if (projectId) {
  console.log(`Initializing Firebase Admin with project ID: ${projectId}`);
  admin.initializeApp({
    projectId: projectId
  });
} else {
  console.log('Initializing Firebase Admin with default credentials');
  admin.initializeApp();
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());
const angularApp = new AngularNodeAppEngine();

app.post('/api/auth/send-verification', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Generate a code using SHA-256 hash of email and password
  const code = crypto.createHash('sha256').update(`${email}${password}`).digest('hex').substring(0, 8).toUpperCase();
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env['SMTP_EMAIL'] || 'acc@dnlogis.vn',
      pass: process.env['SMTP_PASSWORD'] || 'ypyq korg dfwh qcpk',
    },
  });

  const appUrl = process.env['APP_URL'] || `http://localhost:${process.env['PORT'] || 4000}`;
  const verificationLink = `${appUrl}/sign-up?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&code=${code}`;

  const mailOptions = {
    from: `"iShipTo Auth" <${process.env['SMTP_EMAIL'] || 'acc@dnlogis.vn'}>`,
    to: email,
    subject: 'Xác thực tài khoản Ishipto',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <p>Dear Khách hàng,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
        <p><strong>Code active:</strong> ${code}</p>
        <p><strong>Link active:</strong> <a href="${verificationLink}">${verificationLink}</a></p>
        <p><em>Note: Đây là email tự động vui lòng không reply.</em></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
  } catch (error) {
    console.error('SMTP Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/api/admin/list-users', async (req, res) => {
  const hasServiceAccount = !!process.env['FIREBASE_SERVICE_ACCOUNT'];
  console.log(`API: list-users called. Service Account present in env: ${hasServiceAccount}`);

  try {
    console.log('Attempting to list users from Firebase Auth...');
    const listUsersResult = await admin.auth().listUsers(1000);
    console.log(`Successfully retrieved ${listUsersResult.users.length} users.`);
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    }));
    return res.json(users);
  } catch (error: unknown) {
    console.error('Error listing users:', error);
    const err = error as { message?: string; code?: string };
    let message = err?.message || 'Unknown error';
    
    if (!hasServiceAccount) {
      message = "Firebase Admin was initialized WITHOUT a Service Account. You MUST add 'FIREBASE_SERVICE_ACCOUNT' to AI Studio Secrets to list users. " + message;
    }
    
    return res.status(500).json({ 
      error: 'Failed to list users', 
      message,
      code: err?.code
    });
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

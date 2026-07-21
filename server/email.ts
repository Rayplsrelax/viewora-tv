import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

const transporter = nodemailer.createTransport({
  host: ENV.smtpHost,
  port: ENV.smtpPort,
  secure: false, // TLS via STARTTLS on port 587
  auth: {
    user: ENV.smtpUser,
    pass: ENV.smtpPass,
  },
});

/**
 * Send streaming credentials to the customer after successful payment.
 */
export async function sendCredentialsEmail(options: {
  to: string;
  customerName?: string;
  username: string;
  password: string;
  m3uUrl: string;
  planName: string;
  expiryDate: string;
  additionalCredentials?: Array<{ username: string; password: string; url: string }>;
}): Promise<void> {
  const { to, customerName, username, password, m3uUrl, planName, expiryDate, additionalCredentials } = options;
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";

  // Build additional device credentials HTML
  let additionalCredsHtml = "";
  if (additionalCredentials && additionalCredentials.length > 0) {
    additionalCredsHtml = additionalCredentials.map((cred, i) => `
      <div style="background:#0f0f1a;border:1px solid #2d2d44;border-radius:12px;padding:24px;margin-bottom:16px;">
        <p style="color:#8b5cf6;font-size:13px;font-weight:600;margin:0 0 12px 0;">Device ${i + 2} Credentials</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#71717a;font-size:13px;padding:6px 0;text-transform:uppercase;letter-spacing:0.5px;">Username</td>
            <td style="color:#ffffff;font-size:15px;padding:6px 0;text-align:right;font-family:monospace;">${cred.username}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:13px;padding:6px 0;text-transform:uppercase;letter-spacing:0.5px;">Password</td>
            <td style="color:#ffffff;font-size:15px;padding:6px 0;text-align:right;font-family:monospace;">${cred.password}</td>
          </tr>
        </table>
      </div>
    `).join("");
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;margin:0;letter-spacing:-0.5px;">Viewora<span style="color:#8b5cf6;">TV</span></h1>
      <p style="color:#a1a1aa;font-size:14px;margin-top:8px;">Premium Streaming</p>
    </div>
    
    <!-- Main Card -->
    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border:1px solid #2d2d44;border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="color:#e4e4e7;font-size:16px;margin:0 0 24px 0;">${greeting},</p>
      <p style="color:#a1a1aa;font-size:15px;margin:0 0 24px 0;">
        Your <strong style="color:#8b5cf6;">${planName}</strong> subscription is now active. Here are your streaming credentials:
      </p>
      
      <!-- Primary Credentials Box -->
      <div style="background:#0f0f1a;border:1px solid #2d2d44;border-radius:12px;padding:24px;margin-bottom:16px;">
        ${additionalCredentials && additionalCredentials.length > 0 ? '<p style="color:#8b5cf6;font-size:13px;font-weight:600;margin:0 0 12px 0;">Device 1 Credentials</p>' : ''}
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#71717a;font-size:13px;padding:8px 0;text-transform:uppercase;letter-spacing:0.5px;">Username</td>
            <td style="color:#ffffff;font-size:15px;padding:8px 0;text-align:right;font-family:monospace;">${username}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:13px;padding:8px 0;text-transform:uppercase;letter-spacing:0.5px;">Password</td>
            <td style="color:#ffffff;font-size:15px;padding:8px 0;text-align:right;font-family:monospace;">${password}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:13px;padding:8px 0;text-transform:uppercase;letter-spacing:0.5px;">Expires</td>
            <td style="color:#ffffff;font-size:15px;padding:8px 0;text-align:right;">${expiryDate}</td>
          </tr>
        </table>
      </div>
      
      ${additionalCredsHtml}
      
      <!-- M3U URL -->
      <div style="background:#0f0f1a;border:1px solid #2d2d44;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="color:#71717a;font-size:12px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.5px;">M3U Playlist URL</p>
        <p style="color:#8b5cf6;font-size:13px;margin:0;word-break:break-all;font-family:monospace;">${m3uUrl}</p>
      </div>
      
      <!-- Setup Instructions -->
      <div style="border-top:1px solid #2d2d44;padding-top:24px;">
        <p style="color:#e4e4e7;font-size:14px;font-weight:600;margin:0 0 12px 0;">Quick Setup Guide:</p>
        <ol style="color:#a1a1aa;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
          <li>Download a streaming app (IPTV Smarters, TiviMate, or VLC)</li>
          <li>Select "Xtream Codes" login method</li>
          <li>Enter your username and password above</li>
          <li>Use server URL: <span style="color:#8b5cf6;font-family:monospace;">http://line.viewora.space</span></li>
          <li>Enjoy 20,000+ live channels!</li>
        </ol>
        
        <div style="margin-top:20px;padding:16px;background:#0f0f1a;border:1px solid #2d2d44;border-radius:12px;">
          <p style="color:#e4e4e7;font-size:14px;font-weight:600;margin:0 0 8px 0;">🌐 Web Player (No App Needed)</p>
          <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px 0;">
            Stream directly in your browser on any device with internet access. Works best with a VPN.
          </p>
          <a href="http://162.0.216.135/playlists" style="color:#8b5cf6;font-size:13px;font-family:monospace;">http://162.0.216.135/playlists</a>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;">
      <p style="color:#52525b;font-size:12px;margin:0;">
        Need help? Reply to this email or visit our support page.
      </p>
      <p style="color:#3f3f46;font-size:11px;margin-top:12px;">
        &copy; ${new Date().getFullYear()} Viewora TV. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Viewora TV" <${ENV.smtpUser}>`,
    to,
    subject: `Your Viewora TV Credentials — ${planName}`,
    html,
  });
}

/**
 * Send renewal confirmation email.
 */
export async function sendRenewalEmail(options: {
  to: string;
  customerName?: string;
  username: string;
  password: string;
  planName: string;
  newExpiryDate: string;
}): Promise<void> {
  const { to, customerName, username, password, planName, newExpiryDate } = options;
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;margin:0;letter-spacing:-0.5px;">Viewora<span style="color:#8b5cf6;">TV</span></h1>
      <p style="color:#a1a1aa;font-size:14px;margin-top:8px;">Premium Streaming</p>
    </div>
    
    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border:1px solid #2d2d44;border-radius:16px;padding:32px;">
      <p style="color:#e4e4e7;font-size:16px;margin:0 0 16px 0;">${greeting},</p>
      <p style="color:#a1a1aa;font-size:15px;margin:0 0 24px 0;">
        Your <strong style="color:#8b5cf6;">${planName}</strong> subscription has been successfully renewed!
      </p>
      
      <div style="background:#0f0f1a;border:1px solid #2d2d44;border-radius:12px;padding:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#71717a;font-size:13px;padding:8px 0;text-transform:uppercase;">Username</td>
            <td style="color:#ffffff;font-size:15px;padding:8px 0;text-align:right;font-family:monospace;">${username}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:13px;padding:8px 0;text-transform:uppercase;">Password</td>
            <td style="color:#ffffff;font-size:15px;padding:8px 0;text-align:right;font-family:monospace;">${password}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:13px;padding:8px 0;text-transform:uppercase;">New Expiry</td>
            <td style="color:#22c55e;font-size:15px;padding:8px 0;text-align:right;">${newExpiryDate}</td>
          </tr>
        </table>
      </div>
      
      <p style="color:#a1a1aa;font-size:14px;margin:24px 0 0 0;">
        Your credentials remain the same. No action needed — just keep streaming!
      </p>
    </div>
    
    <div style="text-align:center;padding-top:24px;">
      <p style="color:#3f3f46;font-size:11px;margin:0;">
        &copy; ${new Date().getFullYear()} Viewora TV. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Viewora TV" <${ENV.smtpUser}>`,
    to,
    subject: `Subscription Renewed — Viewora TV`,
    html,
  });
}

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

  // Extract domain from M3U URL (e.g. http://cf.slowgoyoyo.xyz/get.php?... → cf.slowgoyoyo.xyz)
  let serverDomain = "";
  try {
    const urlObj = new URL(m3uUrl);
    serverDomain = urlObj.hostname;
  } catch {
    // Fallback: try to extract from string
    const match = m3uUrl.match(/https?:\/\/([^/]+)/);
    if (match) serverDomain = match[1];
  }

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
            <td style="color:#71717a;font-size:13px;padding:8px 0;text-transform:uppercase;letter-spacing:0.5px;">Server / Domain</td>
            <td style="color:#8b5cf6;font-size:15px;padding:8px 0;text-align:right;font-family:monospace;">${serverDomain}</td>
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
        <p style="color:#e4e4e7;font-size:14px;font-weight:600;margin:0 0 16px 0;">📱 App Setup (IPTV Smarters Pro):</p>
        <ol style="color:#a1a1aa;font-size:14px;margin:0 0 16px 0;padding-left:20px;line-height:2;">
          <li>Download <strong style="color:#e4e4e7;">IPTV Smarters Pro</strong> on your device</li>
          <li><strong style="color:#e4e4e7;">On TV/Firestick:</strong> Select "Login with Xtream Codes API"</li>
          <li><strong style="color:#e4e4e7;">On mobile/laptop:</strong> Select "Add Your Playlist"</li>
          <li>Enter the following details:</li>
        </ol>
        <div style="background:#0f0f1a;border:1px solid #2d2d44;border-radius:8px;padding:16px;margin:0 0 16px 20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="color:#71717a;font-size:12px;padding:4px 0;text-transform:uppercase;">Name</td>
              <td style="color:#e4e4e7;font-size:13px;padding:4px 0;text-align:right;">Any name you prefer</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:12px;padding:4px 0;text-transform:uppercase;">Username</td>
              <td style="color:#8b5cf6;font-size:13px;padding:4px 0;text-align:right;font-family:monospace;">${username}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:12px;padding:4px 0;text-transform:uppercase;">Password</td>
              <td style="color:#8b5cf6;font-size:13px;padding:4px 0;text-align:right;font-family:monospace;">${password}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:12px;padding:4px 0;text-transform:uppercase;">URL</td>
              <td style="color:#8b5cf6;font-size:13px;padding:4px 0;text-align:right;font-family:monospace;">http://${serverDomain}</td>
            </tr>
          </table>
        </div>
        
        <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px 0;">
          <strong style="color:#e4e4e7;">Firestick users:</strong> Install the "Downloader" app first, then enter code <span style="color:#8b5cf6;font-family:monospace;">250931</span>. If that doesn't work, try <span style="color:#8b5cf6;font-family:monospace;">firesticktricks.com/smarter</span>
        </p>
        <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px 0;">
          <strong style="color:#e4e4e7;">iOS users:</strong> Search "Smarters Player Lite" in the App Store
        </p>
        <p style="color:#a1a1aa;font-size:13px;margin:0 0 20px 0;">
          <strong style="color:#e4e4e7;">Android users:</strong> Download from <a href="https://www.iptvsmarters.com/" style="color:#8b5cf6;">iptvsmarters.com</a> or Google Play Store
        </p>
        
        <div style="padding:16px;background:#0f0f1a;border:1px solid #2d2d44;border-radius:12px;margin-bottom:16px;">
          <p style="color:#e4e4e7;font-size:14px;font-weight:600;margin:0 0 8px 0;">🌐 Web Player (No App Needed)</p>
          <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px 0;">
            Stream directly in your browser on any device. Only needs your <strong style="color:#e4e4e7;">Username</strong> and <strong style="color:#e4e4e7;">Password</strong> (no URL needed). Works best with a VPN.
          </p>
          <a href="https://watch.vieworatv.live" style="color:#8b5cf6;font-size:13px;font-family:monospace;">https://watch.vieworatv.live</a>
        </div>

        <div style="padding:12px;background:#1a1a2e;border:1px solid #2d2d44;border-radius:8px;">
          <p style="color:#a1a1aa;font-size:12px;margin:0;text-align:center;">
            📖 Need more help? Visit our <a href="https://vieworatv-jydqqkdd.manus.space/setup" style="color:#8b5cf6;">full setup guide</a> for step-by-step instructions for every device.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;">
      <p style="color:#a1a1aa;font-size:13px;margin:0 0 12px 0;">Need help setting up? Contact our support team:</p>
      <div style="margin-bottom:16px;">
        <a href="https://t.me/+EbGpQ2NZyhhhMzYx" style="display:inline-block;padding:8px 16px;background:#1e3a5f;color:#93c5fd;border-radius:8px;text-decoration:none;font-size:13px;margin:0 4px;">Telegram</a>
        <a href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf" style="display:inline-block;padding:8px 16px;background:#14532d;color:#86efac;border-radius:8px;text-decoration:none;font-size:13px;margin:0 4px;">WhatsApp</a>
        <a href="mailto:info@rayallcompany.business" style="display:inline-block;padding:8px 16px;background:#27272a;color:#a1a1aa;border-radius:8px;text-decoration:none;font-size:13px;margin:0 4px;">Email</a>
      </div>
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

// qr.js - Ultra Pro Max Version with Boss Style 🔥
const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const chalk = require('chalk'); // Add this for colorful logs
const {
    default: Mbuvi_Tech,
    useMultiFileAuthState,
    jidNormalizedUser,
    Browsers,
    delay,
    makeInMemoryStore,
} = require("@whiskeysockets/baileys");

// ==================== CONFIGURATION ====================
const TEMP_DIR = './temp';
const SESSION_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3;

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ==================== UTILITY FUNCTIONS ====================
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    try {
        fs.rmSync(FilePath, {
            recursive: true,
            force: true
        });
        console.log(chalk.green(`✅ Cleaned up: ${FilePath}`));
        return true;
    } catch (err) {
        console.log(chalk.red(`❌ Cleanup failed: ${FilePath}`), err);
        return false;
    }
}

function logWithTimestamp(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
        info: chalk.blue,
        success: chalk.green,
        error: chalk.red,
        warn: chalk.yellow,
        qr: chalk.magenta
    };
    const color = colors[type] || chalk.white;
    console.log(color(`[${timestamp}] ${message}`));
}

// ==================== BOSS THEMED MESSAGES ====================
const BOSS_ART = `
╔══════════════════════════════════════╗
║     👑 BOSS-MD QR GENERATOR 👑      ║
║        Ultra Professional Suite       ║
╚══════════════════════════════════════╝
`;

const SESSION_CONNECTED_MSG = (sessionId) => `
╔══════════════════════════════════════════════════════════╗
║                   🎯 SESSION CONNECTED 🎯                ║
╠══════════════════════════════════════════════════════════╣
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   ║
║  ┃              ✨ BOSS-MD PREMIUM ✨                ┃   ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   ║
╠══════════════════════════════════════════════════════════╣
║  📱 SESSION ID:                                         ║
║  ${sessionId}  ║
╠══════════════════════════════════════════════════════════╣
║  🔧 DEPLOYMENT INSTRUCTIONS:                            ║
║  • Copy the SESSION ID above                            ║
║  • Go to Heroku Dashboard                               ║
║  • Add to Config Vars as: SESSION_ID                    ║
╠══════════════════════════════════════════════════════════╣
║  🌐 OFFICIAL LINKS:                                      ║
║  ├─ YouTube: https://youtube.com/@bossmd               ║
║  ├─ Owner: wa.me/923076411099                           ║
║  ├─ Repo: https://github.com/boss-md/BOSS-MD           ║
║  ├─ WA Group: https://chat.whatsapp.com/join           ║
║  ├─ Channel: @bossmd_updates                            ║
║  └─ Instagram: @boss_md                                 ║
╠══════════════════════════════════════════════════════════╣
║  ⭐ Don't Forget To Give Star To My Repo! ⭐            ║
╚══════════════════════════════════════════════════════════╝
`;

// ==================== MAIN QR ENDPOINT ====================
router.get('/', async (req, res) => {
    console.log(chalk.cyan(BOSS_ART));
    
    const sessionId = makeid(12);
    const sessionPath = path.join(TEMP_DIR, sessionId);
    let retryCount = 0;
    
    logWithTimestamp(`🚀 New QR session started: ${sessionId}`, 'info');
    
    // Set response headers for QR code
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Session-ID', sessionId);
    
    // Timeout handler
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            logWithTimestamp(`⏰ Session timeout for: ${sessionId}`, 'warn');
            res.status(408).json({ 
                error: 'QR Code generation timeout',
                session: sessionId 
            });
            removeFile(sessionPath);
        }
    }, SESSION_TIMEOUT);

    async function generateQR() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
            
            logWithTimestamp(`📱 Initializing WhatsApp client...`, 'info');
            
            const client = Mbuvi_Tech({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false
            });

            client.ev.on('creds.update', saveCreds);
            
            client.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr && !res.headersSent) {
                    clearTimeout(timeout);
                    logWithTimestamp(`📸 QR Code generated for session: ${sessionId}`, 'qr');
                    
                    try {
                        // Generate QR buffer
                        const qrBuffer = await QRCode.toBuffer(qr, {
                            type: 'png',
                            margin: 2,
                            scale: 8,
                            color: {
                                dark: '#00ff88',  // Boss green
                                light: '#000000'  // Black background
                            }
                        });
                        
                        // Send QR code
                        res.end(qrBuffer);
                        logWithTimestamp(`✅ QR Code sent successfully`, 'success');
                        
                        // Set new timeout for connection
                        setTimeout(() => {
                            if (connection !== 'open') {
                                logWithTimestamp(`⚠️ Connection timeout for: ${sessionId}`, 'warn');
                                client.ws.close();
                                removeFile(sessionPath);
                            }
                        }, 45000);
                        
                    } catch (qrError) {
                        logWithTimestamp(`❌ QR Generation Error: ${qrError.message}`, 'error');
                        if (!res.headersSent) {
                            res.status(500).end();
                        }
                        client.ws.close();
                        removeFile(sessionPath);
                    }
                }
                
                if (connection === "open") {
                    logWithTimestamp(`🎉 Connection OPEN for: ${sessionId}`, 'success');
                    
                    try {
                        await delay(3000);
                        
                        // Read session credentials
                        const credsPath = path.join(sessionPath, 'creds.json');
                        if (!fs.existsSync(credsPath)) {
                            throw new Error('Creds file not found');
                        }
                        
                        const data = fs.readFileSync(credsPath);
                        const b64data = Buffer.from(data).toString('base64');
                        
                        // Send session data to user
                        const sessionMessage = await client.sendMessage(
                            client.user.id, 
                            { 
                                text: '```🔐 BOSS-MD SESSION DATA🔐```\n\n' + b64data 
                            }
                        );
                        
                        await delay(1000);
                        
                        // Send beautiful welcome message
                        await client.sendMessage(
                            client.user.id,
                            { 
                                text: SESSION_CONNECTED_MSG(b64data.substring(0, 50) + '...')
                            },
                            { quoted: sessionMessage }
                        );
                        
                        // Send media if available (optional)
                        try {
                            await client.sendMessage(
                                client.user.id,
                                {
                                    image: { url: 'https://i.ibb.co/boss-logo.png' },
                                    caption: '👑 *BOSS-MD IS NOW ONLINE* 👑\n\nType *menu* to see all commands'
                                }
                            );
                        } catch (mediaErr) {
                            // Skip if media not available
                        }
                        
                        logWithTimestamp(`📨 Session data sent to user`, 'success');
                        
                        // Clean up
                        await delay(2000);
                        await client.ws.close();
                        removeFile(sessionPath);
                        
                    } catch (err) {
                        logWithTimestamp(`❌ Error in open handler: ${err.message}`, 'error');
                        client.ws.close();
                        removeFile(sessionPath);
                    }
                    
                } else if (connection === "close") {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    
                    if (statusCode === 401) {
                        logWithTimestamp(`🔴 Unauthorized - session invalid`, 'error');
                        removeFile(sessionPath);
                    } else if (retryCount < MAX_RETRIES) {
                        retryCount++;
                        logWithTimestamp(`🔄 Reconnecting... Attempt ${retryCount}/${MAX_RETRIES}`, 'warn');
                        await delay(5000);
                        generateQR();
                    } else {
                        logWithTimestamp(`❌ Max retries reached`, 'error');
                        removeFile(sessionPath);
                    }
                }
            });
            
        } catch (err) {
            logWithTimestamp(`❌ Fatal Error: ${err.message}`, 'error');
            
            if (!res.headersSent) {
                res.status(500).json({
                    error: "Service Temporarily Unavailable",
                    code: "ERR_QR_GEN",
                    session: sessionId
                });
            }
            
            removeFile(sessionPath);
        }
    }

    // Start QR generation
    generateQR();
});

// ==================== SESSION STATUS ENDPOINT ====================
router.get('/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const sessionPath = path.join(TEMP_DIR, sessionId);
    
    const status = {
        sessionId,
        exists: fs.existsSync(sessionPath),
        timestamp: Date.now()
    };
    
    if (status.exists) {
        try {
            const files = fs.readdirSync(sessionPath);
            status.files = files.length;
            status.credsExists = files.includes('creds.json');
        } catch (err) {
            status.error = err.message;
        }
    }
    
    res.json(status);
});

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
    res.json({
        status: 'operational',
        module: 'BOSS-MD QR Generator',
        version: '2.0.0',
        timestamp: Date.now(),
        tempDir: fs.existsSync(TEMP_DIR)
    });
});

// ==================== CLEANUP STALE SESSIONS ====================
setInterval(() => {
    try {
        const sessions = fs.readdirSync(TEMP_DIR);
        const now = Date.now();
        
        sessions.forEach(session => {
            const sessionPath = path.join(TEMP_DIR, session);
            const stats = fs.statSync(sessionPath);
            const age = now - stats.mtimeMs;
            
            // Remove sessions older than 10 minutes
            if (age > 600000) {
                removeFile(sessionPath);
                logWithTimestamp(`🧹 Cleaned stale session: ${session}`, 'info');
            }
        });
    } catch (err) {
        // Ignore cleanup errors
    }
}, 300000); // Clean every 5 minutes

module.exports = router;

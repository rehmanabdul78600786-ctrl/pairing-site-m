const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { default: Mbuvi_Tech, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { makeid } = require('./id');

function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid(); 
    let number = req.query.number;
    if (!number) return res.status(400).json({ code: "Number missing" });

    number = number.replace(/[^0-9]/g, '');

    async function generatePairingCode() {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'temp', id));
        try {
            const client = Mbuvi_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: Browsers.macOS('Chrome')
            });

            if (!client.authState.creds.registered) {
                await delay(1500);
                const code = await client.requestPairingCode(number);
                if (!res.headersSent) res.json({ code });
            }

            client.ev.on('creds.update', saveCreds);

            client.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === 'open') {
                    await delay(5000);

                    const confirmationMessage = `
╭━〔 *BOSS-MD* 〕━··๏
┃★╭──────────────
┃★│ 👑 Owner : *BOSS Official*
┃★│ 🤖 Baileys : *Multi Device*
┃★│ 💻 Type : *NodeJs*
┃★│ 🚀 Platform : *Render / Localhost*
┃★│ 🔣 Prefix : *[ . ]*
┃★│ 🏷️ Version : *1.0.0*
┃★╰──────────────
╰━━━━━━━━━━━━━━┈⊷

*╭┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⟢*
*┇▸* 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✅
*┇▸* 𝐁𝐎𝐓 - 𝐁𝐎𝐒𝐒-𝐌𝐃
*┇▸* 𝐎𝐖𝐍𝐄𝐑 - 𝐁𝐎𝐒𝐒
*┇▸* 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐃 - ${id}
*╰┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⟢*

🔹 Repo : https://github.com/bosstech-collab/Boss-md-
🔹 Owner Pic : https://files.catbox.moe/7w1yde.jpg
🔹 Live : http://localhost:8000

Don't Forget To Give Star⭐ To My Repo
`;

                    await client.sendMessage(client.user.id, { text: confirmationMessage });

                    await delay(100);
                    await client.ws.close();
                    return removeFile(path.join(__dirname, 'temp', id));
                }
                else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    generatePairingCode();
                }
            });
        } catch (err) {
            console.error('Pairing Service Error:', err.message);
            removeFile(path.join(__dirname, 'temp', id));
            if (!res.headersSent) res.json({ code: 'Service Currently Unavailable' });
        }
    }

    await generatePairingCode();
});

module.exports = router;

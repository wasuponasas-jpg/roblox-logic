const express = require('express');
const app = express();
// ปรับระบบ Port ให้รองรับการ Deploy บนเว็บเซิร์ฟเวอร์จริง (เช่น Render)
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

let currentBitValue = 0;

// 1. Endpoint รับข้อมูลจาก Roblox
app.post('/api/transmit', (req, res) => {
    let value = 0;
    if (typeof req.body === 'object' && req.body.value !== undefined) {
        value = parseInt(req.body.value);
    } else if (typeof req.body === 'string' || typeof req.body === 'number') {
        value = parseInt(req.body);
    }

    if (!isNaN(value) && value >= 0 && value <= 255) {
        currentBitValue = value;
        return res.status(200).json({ success: true, value: currentBitValue });
    } else {
        return res.status(400).json({ success: false, message: "Must be 0-255" });
    }
});

// 2. API สำหรับหน้า UI ดึงข้อมูล
app.get('/api/data', (req, res) => {
    res.json({ value: currentBitValue });
});

// 3. หน้า UI Dashboard (เข้าผ่าน / หรือ /dashboard ก็ได้)
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Build Logic - 8-Bit Monitor</title>
        <style>
            body { background-color: #0b0b0d; color: #ffffff; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background-color: #131316; padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); text-align: center; border: 1px solid #222226; width: 90%; max-width: 500px; }
            h1 { color: #00e676; margin: 0 0 5px 0; font-size: 24px; letter-spacing: 1px; }
            p { color: #6c6c75; margin: 0 0 30px 0; font-size: 14px; }
            .bit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; background: #070708; padding: 20px; border-radius: 12px; }
            .bit-box { display: flex; flex-direction: column; align-items: center; gap: 6px; }
            .lamp { width: 40px; height: 40px; border-radius: 50%; background-color: #222226; border: 2px solid #2d2d33; transition: all 0.15s ease; }
            .lamp.on { background-color: #00e676; border-color: #a7ffeb; box-shadow: 0 0 15px #00e676; }
            .bit-label { font-size: 11px; color: #525259; font-weight: bold; }
            .value-num { font-size: 48px; font-weight: bold; color: #ffffff; }
            .value-lbl { font-size: 12px; color: #6c6c75; text-transform: uppercase; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>BUILD LOGIC LIVE</h1>
            <p>ระบบตรวจจับสถานะบิตออนไลน์ผ่าน GitHub</p>
            <div class="bit-grid">
                <div class="bit-box"><div id="bit7" class="lamp"></div><div class="bit-label">B7 (128)</div></div>
                <div class="bit-box"><div id="bit6" class="lamp"></div><div class="bit-label">B6 (64)</div></div>
                <div class="bit-box"><div id="bit5" class="lamp"></div><div class="bit-label">B5 (32)</div></div>
                <div class="bit-box"><div id="bit4" class="lamp"></div><div class="bit-label">B4 (16)</div></div>
                <div class="bit-box"><div id="bit3" class="lamp"></div><div class="bit-label">B3 (8)</div></div>
                <div class="bit-box"><div id="bit2" class="lamp"></div><div class="bit-label">B2 (4)</div></div>
                <div class="bit-box"><div id="bit1" class="lamp"></div><div class="bit-label">B1 (2)</div></div>
                <div class="bit-box"><div id="bit0" class="lamp"></div><div class="bit-label">B0 (1)</div></div>
            </div>
            <div class="value-num" id="decVal">0</div>
            <div class="value-lbl">ค่าฐานสิบ (Decimal)</div>
        </div>
        <script>
            function updateMonitor(val) {
                document.getElementById('decVal').innerText = val;
                const bin = val.toString(2).padStart(8, '0');
                for (let i = 0; i < 8; i++) {
                    const state = bin[7 - i];
                    const lamp = document.getElementById('bit' + i);
                    if (state === '1') lamp.classList.add('on');
                    else lamp.classList.remove('on');
                }
            }
            setInterval(() => {
                fetch('/api/data')
                    .then(r => r.json())
                    .then(d => updateMonitor(d.value))
                    .catch(e => console.log("Connecting..."));
            }, 500);
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

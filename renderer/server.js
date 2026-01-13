// renderer/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const TMP_DIR = path.join(__dirname, 'tmp');

if (!fs.existsSync(OUTPUTS_DIR)) fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

app.get('/', (req, res) => res.send('Asal renderer is up'));

app.post('/render', async (req, res) => {
  try {
    const id = uuidv4();
    const jobDir = path.join(TMP_DIR, id);
    fs.mkdirSync(jobDir, { recursive: true });

    const frames = req.body.frames || []; // مسارات نسبية داخل /app/assets أو قائمة PNG جاهزة
    const fps = req.body.fps || 30;
    const outputName = req.body.outputName || `out_${id}.mp4`;
    const outputPath = path.join(OUTPUTS_DIR, outputName);

    // إذا كانت frames مسارات إلى ملفات ضمن assets (مثلاً "assets/frame_0001.png")
    for (let i = 0; i < frames.length; i++) {
      const src = path.join(__dirname, frames[i]);
      const dest = path.join(jobDir, `frame_${String(i + 1).padStart(4, '0')}.png`);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      } else {
        console.warn('frame not found:', src);
      }
    }

    // استخدم ffmpeg لصنع الفيديو من PNGs
    const ffArgs = [
      '-y',
      '-framerate', String(fps),
      '-i', path.join(jobDir, 'frame_%04d.png'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=1080:1920',
      outputPath
    ];

    const ff = spawn('ffmpeg', ffArgs);

    ff.stderr.on('data', data => {
      console.log('ffmpeg:', data.toString());
    });

    ff.on('close', code => {
      // تنظيف المجلد المؤقت (اختياري)
      // fs.rmSync(jobDir, { recursive: true, force: true });
      if (code === 0) {
        return res.json({ ok: true, output: `/outputs/${outputName}` });
      } else {
        return res.status(500).json({ ok: false, code });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Renderer listening on port ${PORT}`));

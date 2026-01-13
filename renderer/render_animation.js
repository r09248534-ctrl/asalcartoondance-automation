// renderer/render_animation.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function svgToPng(svgPath, outPath, width=1080, height=1920){
  // يستخدم ImageMagick convert (موجود داخل الحاوية حسب Dockerfile)
  execSync(`convert -background none -resize ${width}x${height} '${svgPath}' '${outPath}'`);
}

function createFramesFromSvgs(svgList, outDir){
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  svgList.forEach((svg, idx) => {
    const out = path.join(outDir, `frame_${String(idx+1).padStart(4,'0')}.png`);
    svgToPng(svg, out);
  });
}

module.exports = { createFramesFromSvgs };

// 心有灵犀 · 小程序头像生成（512x512）
// 设计：粉紫品牌渐变底 + 相对两颗白心 + 灵犀星芒连线
const sharp = require(String.raw`C:\Users\yufei\AppData\Local\Temp\icon-gen\node_modules\sharp`);

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b9d"/>
      <stop offset="52%" stop-color="#e055b0"/>
      <stop offset="100%" stop-color="#a844d4"/>
    </linearGradient>
    <radialGradient id="glow" cx="42%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="heart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffe0ee"/>
    </linearGradient>
    <linearGradient id="heart2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#ffd6ec" stop-opacity="0.92"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="115" fill="url(#bg)"/>
  <rect width="512" height="512" rx="115" fill="url(#glow)"/>

  <!-- 星点 -->
  <circle cx="112" cy="118" r="7" fill="#ffffff" opacity="0.9"/>
  <circle cx="404" cy="94" r="5" fill="#ffffff" opacity="0.65"/>
  <circle cx="436" cy="336" r="6" fill="#ffffff" opacity="0.55"/>
  <circle cx="80" cy="342" r="5" fill="#ffffff" opacity="0.5"/>

  <!-- 灵犀星芒：两心之间上方的大星 -->
  <path d="M286 96 C290 128 302 140 334 144 C302 148 290 160 286 192 C282 160 270 148 238 144 C270 140 282 128 286 96 Z" fill="#ffe9a8"/>
  <path d="M352 60 C354 76 360 82 376 84 C360 86 354 92 352 108 C350 92 344 86 328 84 C344 82 350 76 352 60 Z" fill="#fff3c9" opacity="0.9"/>
  <path d="M198 128 C200 140 205 145 217 147 C205 149 200 154 198 166 C196 154 191 149 179 147 C191 145 196 140 198 128 Z" fill="#fff3c9" opacity="0.8"/>

  <!-- 连接两心的灵犀弧线 -->
  <path d="M166 380 C216 422 304 422 358 366" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="9" stroke-linecap="round" stroke-dasharray="2 26"/>

  <!-- 大心（左，微微左倾） -->
  <path d="M50 88 C10 62 2 34 16 20 C27 9 43 13 50 26 C57 13 73 9 84 20 C98 34 90 62 50 88 Z"
        transform="translate(56,158) scale(2.55) rotate(-9, 50, 50)" fill="url(#heart)"/>
  <!-- 小心（右，微微右倾，依偎在大心旁） -->
  <path d="M50 88 C10 62 2 34 16 20 C27 9 43 13 50 26 C57 13 73 9 84 20 C98 34 90 62 50 88 Z"
        transform="translate(298,208) scale(1.72) rotate(13, 50, 50)" fill="url(#heart2)"/>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile(String.raw`C:\Users\yufei\AppData\Local\Temp\icon-gen\icon-512.png`)
  .then(info => console.log('done', info.width + 'x' + info.height));

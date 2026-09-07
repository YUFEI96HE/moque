/*
 * 心有灵犀 · 默契大挑战 —— 共享核心
 * 题库 / 载荷编解码 / 算分与点评
 * UMD：小程序 require() 与 H5 <script> 双环境复用
 * 注意：mp/utils/core.js 为本文件的同步副本，改动后需同步
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = factory(); }
  else { root.LingXi = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------- 题库 ---------------- */

  var CATEGORIES = [
    { id: 'love',   name: '恋爱默契', emoji: '💕' },
    { id: 'friend', name: '友情默契', emoji: '🍻' },
    { id: 'wild',   name: '脑洞挑战', emoji: '🛸' }
  ];

  // bank id = 类型前缀 + 序号（载荷中引用）
  var QUESTIONS = [
    // 💕 恋爱默契
    { id: 'L1',  cat: 'love', text: '最理想的周末怎么过？',            opts: ['睡到自然醒', '出门吃吃吃', '宅家追剧打游戏', '说走就走的短途游'] },
    { id: 'L2',  cat: 'love', text: '对方哪一点最先让你心动？',        opts: ['颜值', '才华', '性格有趣', '对我特别好'] },
    { id: 'L3',  cat: 'love', text: '吵架之后一般谁先低头？',          opts: ['我', 'TA', '冷战到自然和好', '吃顿好的就和好'] },
    { id: 'L4',  cat: 'love', text: '理想的爱情状态是？',              opts: ['每天黏在一起', '各自独立互不打扰', '像朋友一样聊天', '像家人一样踏实'] },
    { id: 'L5',  cat: 'love', text: '约会最想去哪？',                  opts: ['电影院', '逛吃逛吃', '来场旅行', '在家一起做饭'] },
    { id: 'L6',  cat: 'love', text: 'TA 的小脾气一般因为什么？',       opts: ['没秒回消息', '忘了纪念日', '游戏打太久', '根本没有小脾气'] },
    { id: 'L7',  cat: 'love', text: '未来想养宠物吗？',                opts: ['养猫', '养狗', '都要', '都不要'] },
    { id: 'L8',  cat: 'love', text: '最能接受的恋爱长跑年限？',        opts: ['闪婚也行', '1~2 年', '3~5 年', '顺其自然'] },
    { id: 'L9',  cat: 'love', text: 'TA 的手机壁纸大概是？',           opts: ['自己的自拍', '我俩的合照', '偶像爱豆', '默认壁纸'] },
    { id: 'L10', cat: 'love', text: '情人节最想要的仪式感是？',        opts: ['贵重礼物', '手写情书', '烛光晚餐', '只要陪着就好'] },
    { id: 'L11', cat: 'love', text: '一起旅游谁做攻略？',              opts: ['我做', 'TA 做', '一起做', '到了再说'] },
    { id: 'L12', cat: 'love', text: '恋爱后想公开到什么程度？',        opts: ['全网官宣', '只告诉好友', '低调保密', '看心情'] },
    { id: 'L13', cat: 'love', text: 'TA 最离不开的手机 APP 是？',      opts: ['微信', '短视频', '游戏', '购物'] },
    { id: 'L14', cat: 'love', text: '遇到矛盾时你的第一反应？',        opts: ['当场说开', '缓一晚再谈', '找朋友吐槽', '自己消化'] },
    { id: 'L15', cat: 'love', text: '最想要的未来画面是？',            opts: ['海岛婚礼', '城市安家', '回归田园', '环游世界'] },
    // 🍻 友情默契
    { id: 'F1',  cat: 'friend', text: '你们经常聊的话题是？',          opts: ['八卦吃瓜', '工作学习', '游戏开黑', '情感烦恼'] },
    { id: 'F2',  cat: 'friend', text: '老友见面的第一件事？',          opts: ['先抱一下', '直接开损', '找家店坐下', '发语音说不来了'] },
    { id: 'F3',  cat: 'friend', text: '对方最让你服气的一点？',        opts: ['靠谱', '有趣', '情商高', '讲义气'] },
    { id: 'F4',  cat: 'friend', text: '借钱这种事找对方会？',          opts: ['秒借不问用途', '要说明理由', '视金额而定', '坚决不谈钱'] },
    { id: 'F5',  cat: 'friend', text: '你们的关系人设是？',            opts: ['互损损友', '商业互吹', '君子之交', '无话不谈'] },
    { id: 'F6',  cat: 'friend', text: '对方微信备注你大概是？',        opts: ['真名', '外号', '损称', '神秘代号'] },
    { id: 'F7',  cat: 'friend', text: '一起旅行谁负责订票？',          opts: ['我', 'TA', '分工合作', '每次都临时抱佛脚'] },
    { id: 'F8',  cat: 'friend', text: '对方深夜找你一般是？',          opts: ['emo 了', '有八卦', '叫你打游戏', '让你带饭'] },
    { id: 'F9',  cat: 'friend', text: '你们最常见的活动是？',          opts: ['干饭', '开黑', '逛街', '运动健身'] },
    { id: 'F10', cat: 'friend', text: '对方的生日你记得吗？',          opts: ['倒背如流', '大概月份', '靠软件提醒', '什么？？今天？？'] },
    { id: 'F11', cat: 'friend', text: '如果对方恋爱了，你会？',        opts: ['狂磕 CP', '查户口式盘问', '担心被冷落', '无所谓'] },
    { id: 'F12', cat: 'friend', text: '最想和对方一起完成的事？',      opts: ['一起旅行', '合伙搞钱', '一起健身', '混吃等死'] },
    { id: 'F13', cat: 'friend', text: '对方在你心里的地位？',          opts: ['家人级别', '灵魂伴侣', '酒肉朋友', '点赞之交'] },
    { id: 'F14', cat: 'friend', text: '吵过最凶的一次是因为？',        opts: ['误会', '三观不合', '借钱', '根本没吵过'] },
    // 🛸 脑洞挑战
    { id: 'W1',  cat: 'wild', text: '世界末日只能带一样东西？',        opts: ['WiFi 路由器', '冰箱', '另一半', '银行卡'] },
    { id: 'W2',  cat: 'wild', text: '最想要的超能力？',                opts: ['读心术', '隐身', '时间暂停', '瞬间移动'] },
    { id: 'W3',  cat: 'wild', text: '人生重来一次会改变什么？',        opts: ['选的专业', '某段感情', '早睡早起', '什么都不改'] },
    { id: 'W4',  cat: 'wild', text: '如果动物会说话，最想养？',        opts: ['鹦鹉', '猫', '狗', '乌龟'] },
    { id: 'W5',  cat: 'wild', text: '中了 500 万第一件事？',           opts: ['辞职', '买房', '环游世界', '先瞒着所有人'] },
    { id: 'W6',  cat: 'wild', text: '更想去哪个时代生活？',            opts: ['大唐盛世', '90 年代', '未来世界', '就要现在'] },
    { id: 'W7',  cat: 'wild', text: '被困荒岛先解决什么？',            opts: ['淡水', '火种', '求救信号', '心态'] },
    { id: 'W8',  cat: 'wild', text: '最想拥有的职业身份？',            opts: ['作家', '游戏制作人', '环球旅行家', '包租公/包租婆'] },
    { id: 'W9',  cat: 'wild', text: '手机消失一天你会？',              opts: ['浑身难受', '无所谓', '太好了', '再找一台'] },
    { id: 'W10', cat: 'wild', text: '如果能删除一个发明？',            opts: ['闹钟', '短视频', '电梯广告', '网络弹窗'] },
    { id: 'W11', cat: 'wild', text: '想给 100 年后的自己留什么？',     opts: ['存款', '一封信', '一段视频', '什么都不留'] },
    { id: 'W12', cat: 'wild', text: '最想体验的职业互换？',            opts: ['和老板互换', '和明星互换', '和宠物互换', '和 AI 互换'] },
    { id: 'W13', cat: 'wild', text: '每天多出 4 小时你会用来？',       opts: ['看电影', '打游戏', '读书', '发呆'] },
    { id: 'W14', cat: 'wild', text: '长生不老你愿意吗？',              opts: ['愿意', '不愿意', '看情况', '让我再想想'] }
  ];

  /* ---------------- 点评文案 ---------------- */

  var VERDICTS = [
    { min: 100, emoji: '🐉', title: '天作之合',   sub: '心有灵犀一点通，你们是失散多年的灵魂拷贝！' },
    { min: 80,  emoji: '💘', title: '默契满分预定', sub: '就差一点点，你们已经是彼此的嘴替了！' },
    { min: 60,  emoji: '🌈', title: '渐入佳境',   sub: '大方向一致，细节还在磨合，未来可期！' },
    { min: 40,  emoji: '🎭', title: '欢喜冤家',   sub: '虽然经常不在一个频道，但吵不散的才是真感情！' },
    { min: 20,  emoji: '🧊', title: '相爱相杀',   sub: '你们是彼此的谜语人，建议多约几顿饭培养默契！' },
    { min: 0,   emoji: '🌍', title: '平行宇宙',   sub: '恭喜二位，来自两个不同的星球，依然选择相遇！' }
  ];

  /* ---------------- 编解码 ----------------
   * 载荷结构（紧凑 JSON）：
   * 挑战  { v:1, n:出题人称呼, c:[{i:'L1'} | {t:'题目',o:[4选项]}...], s:[出题人答案0-3] }
   * 战报  { v:1, n:..., c:[...], s:[...], b:[挑战人答案] }
   * 序列化：JSON → UTF-8 字节 → XOR 混淆 → Base64URL
   */

  var XOR_KEY = 'lingxi2026';

  function utf8Encode(str) {
    var bytes = [], i, c, code;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c < 0x80) { bytes.push(c); }
      else if (c < 0x800) {
        bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
      } else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < str.length) {
        code = 0x10000 + ((c - 0xD800) << 10) + (str.charCodeAt(i + 1) - 0xDC00);
        i++;
        bytes.push(0xF0 | (code >> 18), 0x80 | ((code >> 12) & 0x3F), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
      } else {
        bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
      }
    }
    return bytes;
  }

  function utf8Decode(bytes) {
    var out = '', i = 0, c, c2, c3, c4, code;
    while (i < bytes.length) {
      c = bytes[i++];
      if (c < 0x80) { out += String.fromCharCode(c); }
      else if (c < 0xE0) { c2 = bytes[i++]; out += String.fromCharCode(((c & 0x1F) << 6) | (c2 & 0x3F)); }
      else if (c < 0xF0) {
        c2 = bytes[i++]; c3 = bytes[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F));
      } else {
        c2 = bytes[i++]; c3 = bytes[i++]; c4 = bytes[i++];
        code = (((c & 0x07) << 18) | ((c2 & 0x3F) << 12) | ((c3 & 0x3F) << 6) | (c4 & 0x3F)) - 0x10000;
        out += String.fromCharCode(0xD800 + (code >> 10), 0xDC00 + (code & 0x3FF));
      }
    }
    return out;
  }

  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  function b64urlEncode(bytes) {
    var out = '', i, b1, b2, b3;
    for (i = 0; i < bytes.length; i += 3) {
      b1 = bytes[i]; b2 = bytes[i + 1]; b3 = bytes[i + 2];
      out += B64[b1 >> 2];
      out += B64[((b1 & 3) << 4) | (b2 === undefined ? 0 : b2 >> 4)];
      out += b2 === undefined ? '' : B64[((b2 & 15) << 2) | (b3 === undefined ? 0 : b3 >> 6)];
      out += b3 === undefined ? '' : B64[b3 & 63];
    }
    return out;
  }

  function b64urlDecode(str) {
    var map = {}, i;
    for (i = 0; i < B64.length; i++) { map[B64[i]] = i; }
    var bytes = [], buffer = 0, bits = 0;
    for (i = 0; i < str.length; i++) {
      var v = map[str[i]];
      if (v === undefined) { return null; }
      buffer = (buffer << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((buffer >> bits) & 0xFF);
      }
    }
    return bytes;
  }

  function xor(bytes) {
    var out = [], i;
    for (i = 0; i < bytes.length; i++) { out.push(bytes[i] ^ XOR_KEY.charCodeAt(i % XOR_KEY.length)); }
    return out;
  }

  function encodeObj(obj) {
    return b64urlEncode(xor(utf8Encode(JSON.stringify(obj))));
  }

  function decodeStr(str) {
    if (!str) { return null; }
    try {
      var bytes = b64urlDecode(str.replace(/ /g, '+'));
      if (!bytes) { return null; }
      return JSON.parse(utf8Decode(xor(bytes)));
    } catch (e) {
      return null;
    }
  }

  /* ---------------- 题目存取 ---------------- */

  var BANK = {};
  QUESTIONS.forEach(function (q) { BANK[q.id] = q; });

  // 出题时的选题项：{ bankId: 'L1', ans: 0~3 } 或 { custom: {t:'题目', o:[...4选项]}, ans: 0~3 }
  function buildPayload(name, picks, answerer) {
    var qs = [], s = [];
    picks.forEach(function (p) {
      if (p.bankId) {
        var q = BANK[p.bankId];
        if (!q) { throw new Error('bad bank id: ' + p.bankId); }
        qs.push({ i: p.bankId });
      } else if (p.custom) {
        qs.push({ t: String(p.custom.t || '').slice(0, 60), o: p.custom.o.map(function (x) { return String(x).slice(0, 24); }) });
      } else {
        throw new Error('bad pick');
      }
      s.push(p.ans | 0);
    });
    if (qs.length < 1) { throw new Error('no questions'); }
    var obj = { v: 1, n: String(name || '').slice(0, 16) || '神秘人', c: qs, s: s };
    if (answerer) { obj.b = answerer; }
    return obj;
  }

  function encodeChallenge(name, picks) {
    return encodeObj(buildPayload(name, picks));
  }

  function encodeResult(name, picks, answerer) {
    return encodeObj(buildPayload(name, picks, answerer));
  }

  // 展开为可直接渲染的题目数组
  function expandQuestions(payload) {
    if (!payload || !payload.c || !payload.c.length) { return null; }
    var list = [];
    for (var i = 0; i < payload.c.length; i++) {
      var ref = payload.c[i], q;
      if (ref.i && BANK[ref.i]) {
        q = BANK[ref.i];
      } else if (ref.t && ref.o && ref.o.length >= 2) {
        q = { id: 'C' + i, text: ref.t, opts: ref.o.concat(['', '', '', '']).slice(0, 4) };
      } else {
        return null; // 引用非法
      }
      list.push(q);
    }
    return list;
  }

  /* ---------------- 算分 ---------------- */

  function verdictFor(score) {
    for (var i = 0; i < VERDICTS.length; i++) {
      if (score >= VERDICTS[i].min) { return VERDICTS[i]; }
    }
    return VERDICTS[VERDICTS.length - 1];
  }

  function score(payload, answers) {
    var qs = expandQuestions(payload);
    if (!qs || !payload.s || !answers || qs.length !== payload.s.length || answers.length !== qs.length) { return null; }
    var detail = [], hit = 0;
    for (var i = 0; i < qs.length; i++) {
      var a = payload.s[i], b = answers[i];
      var ok = a === b;
      if (ok) { hit++; }
      detail.push({
        text: qs[i].text,
        opts: qs[i].opts,
        aIdx: a, bIdx: b,
        hit: ok,
        label: 'Q' + (i + 1)
      });
    }
    var total = qs.length;
    var s = Math.round((hit / total) * 100);
    return { score: s, hit: hit, total: total, verdict: verdictFor(s), detail: detail };
  }

  return {
    CATEGORIES: CATEGORIES,
    QUESTIONS: QUESTIONS,
    VERDICTS: VERDICTS,
    BANK: BANK,
    encodeChallenge: encodeChallenge,
    encodeResult: encodeResult,
    decodeStr: decodeStr,
    encodeObj: encodeObj,
    buildPayload: buildPayload,
    expandQuestions: expandQuestions,
    score: score,
    verdictFor: verdictFor
  };
});

var LX = require('../../utils/core.js');
var store = require('../../utils/store.js');

Page({
  data: {
    mode: 'error', // answer | result | error
    // 答题
    fromName: '',
    total: 0,
    now: 1,
    pct: 0,
    qText: '',
    qOpts: [],
    // 战报
    score: 0,
    emoji: '',
    title: '',
    sub: '',
    hit: 0,
    totalN: 0,
    detail: [],
    isOwner: false
  },

  payload: null,
  questions: null,
  answers: [],
  idx: 0,
  rd: '',

  onLoad: function (options) {
    var d = options.d || '';
    var payload = LX.decodeStr(d);
    if (!payload || payload.v !== 1) { this.setData({ mode: 'error' }); return; }
    this.payload = payload;
    this.rd = d;

    // 战报模式：载荷里带挑战人答案
    if (payload.b && payload.b.length) {
      var result = LX.score(payload, payload.b);
      if (!result) { this.setData({ mode: 'error' }); return; }
      this.renderResult(result, true);
      return;
    }

    // 答题模式
    var qs = LX.expandQuestions(payload);
    if (!qs || !payload.s) { this.setData({ mode: 'error' }); return; }
    this.questions = qs;
    this.answers = [];
    this.idx = 0;
    this.setData({ mode: 'answer', fromName: payload.n, total: qs.length });
    this.renderQ();
  },

  renderQ: function () {
    var q = this.questions[this.idx];
    this.setData({
      now: this.idx + 1,
      pct: Math.round((this.idx / this.questions.length) * 100),
      qText: q.text,
      qOpts: q.opts.filter(function (o) { return o; })
    });
  },

  pick: function (e) {
    this.answers.push(+e.currentTarget.dataset.i);
    this.idx++;
    if (this.idx >= this.questions.length) { this.finish(); }
    else { this.renderQ(); }
  },

  finish: function () {
    var result = LX.score(this.payload, this.answers);
    if (!result) { this.setData({ mode: 'error' }); return; }
    // 战报载荷 = 原挑战载荷 + 挑战人答案
    var obj = JSON.parse(JSON.stringify(this.payload));
    obj.b = this.answers;
    this.rd = LX.encodeObj(obj);
    store.saveHistory({
      t: Date.now(),
      role: 'b',
      peer: this.payload.n,
      score: result.score,
      verdict: result.verdict.title,
      rd: this.rd
    });
    this.renderResult(result, false);
  },

  renderResult: function (result, isOwner) {
    var self = this;
    var detail = result.detail.map(function (d, i) {
      var payload = self.payload;
      return {
        label: 'Q' + (i + 1),
        text: d.text,
        hit: d.hit,
        aText: d.opts[d.aIdx] || '?',
        bText: d.opts[d.bIdx] || '?',
        aName: '出题人 · ' + (payload.n || '神秘人'),
        bName: isOwner ? (payload.n || '对方') : '挑战人'
      };
    });
    this.setData({
      mode: 'result',
      isOwner: isOwner,
      score: 0,
      emoji: result.verdict.emoji,
      title: result.verdict.title,
      sub: result.verdict.sub,
      hit: result.hit,
      totalN: result.total,
      detail: detail
    });
    // 分数滚动动画
    var target = result.score;
    var step = Math.max(1, Math.round(target / 28));
    var timer = setInterval(function () {
      var cur = self.data.score + step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      self.setData({ score: cur });
    }, 36);
  },

  goCreate: function () { wx.reLaunch({ url: '/pages/create/create' }); },
  goHome: function () { wx.reLaunch({ url: '/pages/home/home' }); },

  onShareAppMessage: function () {
    if (this.data.mode === 'result' && this.rd) {
      return {
        title: '我们默契 ' + this.data.score + '% · ' + this.data.title + '！你敢来测吗？',
        path: '/pages/battle/battle?d=' + this.rd
      };
    }
    return {
      title: '心有灵犀 · 默契大挑战：敢来测测我们的默契吗？',
      path: '/pages/home/home'
    };
  }
});

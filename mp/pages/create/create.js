var LX = require('../../utils/core.js');

Page({
  data: {
    name: '',
    cats: [{ id: 'all', name: '全部', emoji: '🎲' }].concat(LX.CATEGORIES),
    cat: 'all',
    qList: [],
    customList: [],
    pickedCount: 0,
    customT: '',
    customO: ['', '', '', ''],
    generated: false
  },

  picks: [],       // [{bankId, ans}] 或 [{cid, ans}]
  customMap: {},   // cid -> {t, o}
  customSeq: 0,
  payload: '',

  onLoad: function () {
    this.renderLists();
  },

  onShareAppMessage: function () {
    if (this.payload) {
      return {
        title: (this.data.name || '有人') + '出了一道默契考验，敢来应战吗？🤺',
        path: '/pages/battle/battle?d=' + this.payload
      };
    }
    return {
      title: '心有灵犀 · 默契大挑战：敢来测测我们的默契吗？',
      path: '/pages/home/home'
    };
  },

  /* ---------------- 事件 ---------------- */

  inputName: function (e) { this.setData({ name: e.detail.value }); },

  setCat: function (e) {
    this.setData({ cat: e.currentTarget.dataset.cat });
    this.renderLists();
  },

  toggleQ: function (e) {
    var id = e.currentTarget.dataset.id;
    var idx = this.indexOfPick('bankId', id);
    if (idx >= 0) { this.picks.splice(idx, 1); }
    else {
      if (this.picks.length >= 5) { this.toast('最多选 5 道题哦'); return; }
      this.picks.push({ bankId: id, ans: -1 });
    }
    this.renderLists();
  },

  toggleCustom: function (e) {
    var cid = e.currentTarget.dataset.cid;
    var idx = this.indexOfPick('cid', cid);
    if (idx >= 0) { this.picks.splice(idx, 1); }
    else {
      if (this.picks.length >= 5) { this.toast('最多选 5 道题哦'); return; }
      this.picks.push({ cid: cid, ans: -1 });
    }
    this.renderLists();
  },

  setAns: function (e) {
    var id = e.currentTarget.dataset.id;
    var i = +e.currentTarget.dataset.i;
    var p = this.getPick('bankId', id);
    if (p) { p.ans = i; this.renderLists(); }
  },

  setCustomAns: function (e) {
    var cid = e.currentTarget.dataset.cid;
    var i = +e.currentTarget.dataset.i;
    var p = this.getPick('cid', cid);
    if (p) { p.ans = i; this.renderLists(); }
  },

  inputCustomQ: function (e) { this.setData({ customT: e.detail.value }); },

  inputCustomO: function (e) {
    var i = +e.currentTarget.dataset.i;
    var o = this.data.customO.slice();
    o[i] = e.detail.value;
    this.setData({ customO: o });
  },

  addCustom: function () {
    var t = (this.data.customT || '').trim();
    var os = this.data.customO.map(function (x) { return (x || '').trim(); });
    var filled = os.filter(function (x) { return x; });
    if (!t) { this.toast('先写问题哦'); return; }
    if (filled.length < 4) { this.toast('4 个选项都要填（凑个搞笑的也行）'); return; }
    var cid = 'c' + (++this.customSeq);
    this.customMap[cid] = { t: t, o: os };
    this.setData({ customT: '', customO: ['', '', '', ''] });
    if (this.picks.length >= 5) { this.toast('候选已加，先取消一题再选它'); }
    else { this.picks.push({ cid: cid, ans: -1 }); }
    this.renderLists();
    this.toast('已加入并选中，记得写你的答案');
  },

  make: function () {
    if (!this.picks.length) { return; }
    var un = this.picks.filter(function (p) { return p.ans < 0; }).length;
    if (un) { this.toast('还有 ' + un + ' 道题没写你自己的答案'); return; }
    var name = this.data.name.trim();
    var self = this;
    try {
      var toEncode = this.picks.map(function (p) {
        if (p.bankId) { return { bankId: p.bankId, ans: p.ans }; }
        var c = self.customMap[p.cid];
        return { custom: { t: c.t, o: c.o }, ans: p.ans };
      });
      this.payload = LX.encodeChallenge(name, toEncode);
    } catch (err) {
      this.toast('生成失败，请重试');
      return;
    }
    this.setData({ generated: true });
  },

  backEdit: function () { this.setData({ generated: false }); },

  /* ---------------- 渲染 ---------------- */

  renderLists: function () {
    var cat = this.data.cat;
    var self = this;
    var qList = LX.QUESTIONS
      .filter(function (q) { return cat === 'all' || q.cat === cat; })
      .map(function (q) {
        var p = self.getPick('bankId', q.id);
        return {
          id: q.id,
          text: q.text,
          tag: self.catName(q.cat),
          picked: !!p,
          opts: q.opts.map(function (t, i) { return { t: t, on: !!p && p.ans === i }; })
        };
      });
    var customList = Object.keys(this.customMap).map(function (cid) {
      var c = self.customMap[cid];
      var p = self.getPick('cid', cid);
      return {
        cid: cid,
        t: c.t,
        picked: !!p,
        opts: c.o.map(function (t, i) { return { t: t, on: !!p && p.ans === i }; })
      };
    });
    this.setData({ qList: qList, customList: customList, pickedCount: this.picks.length });
  },

  catName: function (id) {
    for (var i = 0; i < LX.CATEGORIES.length; i++) {
      if (LX.CATEGORIES[i].id === id) { return LX.CATEGORIES[i].emoji + ' ' + LX.CATEGORIES[i].name; }
    }
    return '';
  },

  indexOfPick: function (key, val) {
    for (var i = 0; i < this.picks.length; i++) { if (this.picks[i][key] === val) { return i; } }
    return -1;
  },

  getPick: function (key, val) {
    var i = this.indexOfPick(key, val);
    return i >= 0 ? this.picks[i] : null;
  },

  toast: function (msg) {
    wx.showToast({ title: msg, icon: 'none' });
  }
});

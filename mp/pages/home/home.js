var store = require('../../utils/store.js');

function formatWhen(t) {
  var d = new Date(t);
  var p = function (n) { return (n < 10 ? '0' : '') + n; };
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

Page({
  data: {
    showHow: false,
    recent: []
  },

  onShow: function () {
    var recent = store.getHistory().map(function (it) {
      return { t: it.t, role: it.role, peer: it.peer, score: it.score, verdict: it.verdict, rd: it.rd, when: formatWhen(it.t) };
    });
    this.setData({ recent: recent });
  },

  toggleHow: function () { this.setData({ showHow: !this.data.showHow }); },

  goCreate: function () {
    wx.navigateTo({ url: '/pages/create/create' });
  },

  openRecent: function (e) {
    var rd = e.currentTarget.dataset.rd;
    if (rd) { wx.navigateTo({ url: '/pages/battle/battle?d=' + rd }); }
  },

  onShareAppMessage: function () {
    return {
      title: '心有灵犀 · 默契大挑战：敢来测测我们的默契吗？',
      path: '/pages/home/home'
    };
  }
});

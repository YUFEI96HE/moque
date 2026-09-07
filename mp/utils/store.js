/* 本地历史战报存取 */
var KEY = 'lx_history_v1';

function getHistory() {
  try {
    return wx.getStorageSync(KEY) || [];
  } catch (e) {
    return [];
  }
}

function saveHistory(item) {
  var list = getHistory();
  list.unshift(item);
  try {
    wx.setStorageSync(KEY, list.slice(0, 10));
  } catch (e) { /* 存储失败不影响主流程 */ }
}

module.exports = { getHistory: getHistory, saveHistory: saveHistory };

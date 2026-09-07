/* 心有灵犀 · 默契大挑战 —— H5 逻辑 */
(function () {
  'use strict';
  var LX = window.LingXi;
  function $(id) { return document.getElementById(id); }

  /* ---------------- 基础 UI ---------------- */
  var views = { home: $('view-home'), create: $('view-create'), battle: $('view-battle') };
  function show(name) {
    Object.keys(views).forEach(function (k) { views[k].classList.toggle('hidden', k !== name); });
    window.scrollTo(0, 0);
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.add('hidden'); }, 2200);
  }

  function openModal(opt) {
    $('modal-title').textContent = opt.title || '';
    $('modal-body').textContent = opt.body || '';
    var row = $('modal-link-row');
    if (opt.link) {
      row.classList.remove('hidden');
      $('modal-link').value = opt.link;
    } else { row.classList.add('hidden'); }
    $('modal-cancel').classList.toggle('hidden', !opt.cancel);
    $('modal-ok').textContent = opt.okText || '好的';
    $('modal-ok').onclick = function () {
      $('modal').classList.add('hidden');
      if (opt.link) { copyText(opt.link); }
      if (opt.onOk) { opt.onOk(); }
    };
    $('modal-cancel').onclick = function () { $('modal').classList.add('hidden'); };
    $('modal').classList.remove('hidden');
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('已复制，去粘贴给 TA 吧 💌'); }
      catch (e) { toast('复制失败，请长按链接手动复制'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('已复制，去粘贴给 TA 吧 💌'); }, fallback);
    } else { fallback(); }
  }

  function baseUrl() {
    return location.origin + location.pathname;
  }

  /* ---------------- 首页 ---------------- */
  var HIS_KEY = 'lx_history_v1';
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HIS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveHistory(item) {
    var list = getHistory();
    list.unshift(item);
    localStorage.setItem(HIS_KEY, JSON.stringify(list.slice(0, 10)));
  }
  function renderRecent() {
    var list = getHistory();
    var box = $('recent-box');
    if (!list.length) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    $('recent-list').innerHTML = '';
    list.forEach(function (it) {
      var div = document.createElement('div');
      div.className = 'recent-item';
      var dt = new Date(it.t);
      var when = (dt.getMonth() + 1) + '月' + dt.getDate() + '日 ' + ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
      div.innerHTML = '<div class="recent-title">' + esc(it.role === 'a' ? ('你向 ' + esc(it.peer) + ' 发起了挑战') : (esc(it.peer) + ' 应战了你的考题')) +
        '<small>' + when + ' · ' + esc(it.verdict) + '</small></div><div class="recent-score">' + it.score + '%</div>';
      div.onclick = function () { location.href = baseUrl() + '?d=' + it.rd; };
      $('recent-list').appendChild(div);
    });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  $('btn-how').onclick = function () { $('how-box').classList.toggle('hidden'); };
  $('btn-go-create').onclick = function () {
    renderTabs();
    renderQList();
    updateCount();
    show('create');
  };

  /* ---------------- 出题 ---------------- */
  var cat = 'all';
  var picks = [];            // {bankId, ans} | {cid, ans}
  var customMap = {};        // cid -> {t, o}
  var customSeq = 0;

  function renderTabs() {
    var tabs = [{ id: 'all', name: '全部', emoji: '🎲' }].concat(LX.CATEGORIES);
    var box = $('cat-tabs');
    box.innerHTML = '';
    tabs.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'cat-tab' + (cat === t.id ? ' on' : '');
      b.textContent = t.emoji + ' ' + t.name;
      b.onclick = function () { cat = t.id; renderTabs(); renderQList(); };
      box.appendChild(b);
    });
  }

  function questionsFor(catId) {
    return LX.QUESTIONS.filter(function (q) { return catId === 'all' || q.cat === catId; });
  }

  function findPick(bankId) {
    for (var i = 0; i < picks.length; i++) { if (picks[i].bankId === bankId) { return picks[i]; } }
    return null;
  }
  function findPickByCid(cid) {
    for (var i = 0; i < picks.length; i++) { if (picks[i].cid === cid) { return picks[i]; } }
    return null;
  }

  function optBtn(text, on, onClick) {
    var b = document.createElement('div');
    b.className = 'ans-opt' + (on ? ' on' : '');
    b.textContent = text;
    b.onclick = function (e) { e.stopPropagation(); onClick(); };
    return b;
  }

  function renderQList() {
    var list = $('q-list');
    list.innerHTML = '';
    // 自定义题卡片置顶
    Object.keys(customMap).forEach(function (cid) {
      var c = customMap[cid];
      var p = findPickByCid(cid);
      var card = document.createElement('div');
      card.className = 'card q-card-item' + (p ? ' picked' : '');
      var optsHtml = '';
      var optBox = document.createElement('div');
      optBox.className = 'ans-opts';
      c.o.forEach(function (o, oi) {
        optBox.appendChild(optBtn(o, p && p.ans === oi, function () {
          if (!p) { return; }
          p.ans = oi;
          renderQList(); updateCount();
        }));
      });
      card.innerHTML = '<div class="q-head"><div class="q-pick"></div><div><div class="q-title">✍️ ' + esc(c.t) +
        '</div><div class="q-tag">自定义题 · 点下方选择你的答案</div></div></div>';
      card.appendChild(optBox);
      card.onclick = function () { toggleCustom(cid); };
      list.appendChild(card);
    });

    questionsFor(cat).forEach(function (q) {
      var p = findPick(q.id);
      var card = document.createElement('div');
      card.className = 'card q-card-item' + (p ? ' picked' : '');
      var optBox = document.createElement('div');
      optBox.className = 'ans-opts';
      q.opts.forEach(function (o, oi) {
        optBox.appendChild(optBtn(o, p && p.ans === oi, function () {
          if (!p) { return; }
          p.ans = oi;
          renderQList(); updateCount();
        }));
      });
      card.innerHTML = '<div class="q-head"><div class="q-pick"></div><div><div class="q-title">' + esc(q.text) +
        '</div><div class="q-tag">' + esc(catName(q.cat)) + ' · ' + (p ? '点击下方选择你的答案' : '点击卡片选中') + '</div></div></div>';
      card.appendChild(optBox);
      card.onclick = function () { togglePick(q.id); };
      list.appendChild(card);
    });
  }

  function catName(id) {
    for (var i = 0; i < LX.CATEGORIES.length; i++) { if (LX.CATEGORIES[i].id === id) { return LX.CATEGORIES[i].emoji + ' ' + LX.CATEGORIES[i].name; } }
    return '';
  }

  function togglePick(bankId) {
    var p = findPick(bankId);
    if (p) { picks.splice(picks.indexOf(p), 1); }
    else {
      if (picks.length >= 5) { toast('最多选 5 道题哦'); return; }
      picks.push({ bankId: bankId, ans: -1 });
    }
    renderQList(); updateCount();
  }
  function toggleCustom(cid) {
    var p = findPickByCid(cid);
    if (p) { picks.splice(picks.indexOf(p), 1); }
    else {
      if (picks.length >= 5) { toast('最多选 5 道题哦'); return; }
      picks.push({ cid: cid, ans: -1 });
    }
    renderQList(); updateCount();
  }

  function updateCount() {
    $('picked-count').textContent = picks.length;
    $('btn-make').disabled = picks.length === 0;
  }

  $('btn-add-custom').onclick = function () {
    var t = $('custom-q').value.trim();
    var os = Array.prototype.map.call(document.querySelectorAll('#custom-card .opt'), function (i) { return i.value.trim(); });
    var filled = os.filter(function (x) { return x; });
    if (!t) { toast('先写问题哦'); return; }
    if (filled.length < 2) { toast('至少写 2 个选项'); return; }
    if (filled.length < 4) { toast('4 个选项都要填（写不出就凑一个搞笑的）'); return; }
    var cid = 'c' + (++customSeq);
    customMap[cid] = { t: t, o: os };
    $('custom-q').value = '';
    document.querySelectorAll('#custom-card .opt').forEach(function (i) { i.value = ''; });
    toggleCustom(cid);
    toast('已加入候选，点卡片选中它');
  };

  $('btn-create-back').onclick = function () { show('home'); renderRecent(); };

  $('btn-make').onclick = function () {
    if (!picks.length) { return; }
    var un = picks.filter(function (p) { return p.ans < 0; });
    if (un.length) { toast('还有 ' + un.length + ' 道题没写你自己的答案'); return; }
    var name = $('creator-name').value.trim();
    var payload;
    try {
      var toEncode = picks.map(function (p) {
        if (p.bankId) { return { bankId: p.bankId, ans: p.ans }; }
        var c = customMap[p.cid];
        return { custom: { t: c.t, o: c.o }, ans: p.ans };
      });
      payload = LX.encodeChallenge(name, toEncode);
    } catch (e) { toast('生成失败：' + e.message); return; }
    var link = baseUrl() + '?d=' + payload;
    openModal({
      title: '🔗 挑战已生成',
      body: '复制链接发给 TA（微信直接粘贴发送即可），TA 答完会立刻出结果，再让 TA 把战报分享回来～',
      link: link
    });
  };

  /* ---------------- 挑战：答题 ---------------- */
  var battleState = null; // {payload, questions, answers, idx}

  function startAnswer(payload) {
    var qs = LX.expandQuestions(payload);
    if (!qs || !payload.s) { showError(); return; }
    battleState = { payload: payload, questions: qs, answers: [], idx: 0 };
    $('battle-from').innerHTML = '来自 <b>' + esc(payload.n) + '</b> 的默契考验 · 共 ' + qs.length + ' 题';
    $('q-total').textContent = qs.length;
    $('battle-answer').classList.remove('hidden');
    $('battle-result').classList.add('hidden');
    show('battle');
    renderQuestion();
  }

  function renderQuestion() {
    var st = battleState;
    $('q-now').textContent = st.idx + 1;
    $('progress-bar').style.width = (st.idx / st.questions.length * 100) + '%';
    $('q-text').textContent = st.questions[st.idx].text;
    var box = $('q-opts');
    box.innerHTML = '';
    st.questions[st.idx].opts.forEach(function (o, oi) {
      if (!o) { return; }
      var b = document.createElement('button');
      b.className = 'q-opt';
      b.textContent = o;
      b.onclick = function () { pickOption(oi); };
      box.appendChild(b);
    });
  }

  function pickOption(oi) {
    var st = battleState;
    st.answers.push(oi);
    st.idx++;
    if (st.idx >= st.questions.length) { finishAnswer(); }
    else { renderQuestion(); }
  }

  function finishAnswer() {
    var st = battleState;
    var result = LX.score(st.payload, st.answers);
    if (!result) { showError(); return; }
    // 战报载荷 = 原挑战载荷 + 挑战人答案，原样保留题目引用
    var obj = JSON.parse(JSON.stringify(st.payload));
    obj.b = st.answers;
    showResult(st.payload, result, LX.encodeObj(obj), false);
  }

  /* ---------------- 挑战：战报 ---------------- */

  function showResult(payload, result, rd, isOwner) {
    $('battle-answer').classList.add('hidden');
    $('battle-result').classList.remove('hidden');
    show('battle');

    $('detail-title').textContent = isOwner ? '🔍 对方的答案对照' : '🔍 逐题对照';

    // 分数动画
    var num = $('score-num'), cur = 0;
    $('ring-fg').style.strokeDashoffset = 327;
    var step = Math.max(1, Math.round(result.score / 28));
    var timer = setInterval(function () {
      cur += step;
      if (cur >= result.score) { cur = result.score; clearInterval(timer); }
      num.textContent = cur;
      $('ring-fg').style.strokeDashoffset = 327 * (1 - cur / 100);
    }, 36);

    $('verdict-emoji').textContent = result.verdict.emoji;
    $('verdict-title').textContent = result.verdict.title;
    $('verdict-sub').textContent = result.verdict.sub + '（答对 ' + result.hit + '/' + result.total + '）';

    var list = $('detail-list');
    list.innerHTML = '';
    result.detail.forEach(function (d) {
      var card = document.createElement('div');
      card.className = 'card detail-item';
      var an = esc(d.opts[d.aIdx] || '?'), bn = esc(d.opts[d.bIdx] || '?');
      card.innerHTML =
        '<div class="d-q"><div class="d-badge ' + (d.hit ? 'hit' : 'miss') + '">' + (d.hit ? '✓' : '✗') + '</div><span>' +
        esc(d.text) + '</span></div>' +
        '<div class="d-answers">' +
        '<div class="d-ans ' + (d.hit ? 'hit' : 'miss') + '"><small>出题人 · ' + esc(payload.n) + '</small>' + an + '</div>' +
        '<div class="d-ans ' + (d.hit ? 'hit' : 'miss') + '"><small>' + esc(peerName(payload)) + '</small>' + bn + '</div>' +
        '</div>';
      list.appendChild(card);
    });

    $('btn-share-result').onclick = function () {
      openModal({
        title: '📤 回传战报',
        body: isOwner ? '这就是 TA 发来的战报～截个图 or 复制链接留存都行。' : '复制下面的战报链接，发给出题人「' + payload.n + '」，让 TA 看看你们的默契对照！',
        link: rd ? (baseUrl() + '?d=' + rd) : null,
        okText: rd ? '复制战报' : '好的'
      });
    };
    $('btn-again').onclick = function () {
      location.href = baseUrl();
    };

    // 存历史
    if (!isOwner && rd) {
      saveHistory({ t: Date.now(), role: 'b', peer: payload.n, score: result.score, verdict: result.verdict.title, rd: rd });
    }
  }

  function peerName(payload) { return payload.n || '出题人'; }

  function showError() {
    show('home');
    renderRecent();
    toast('挑战已失效或链接不完整 😢');
  }

  /* ---------------- 路由入口 ---------------- */
  (function boot() {
    var m = location.search.match(/[?&]d=([A-Za-z0-9\-_]+)/);
    if (m) {
      var payload = LX.decodeStr(m[1]);
      if (!payload || payload.v !== 1) { showError(); return; }
      if (payload.b && payload.b.length) {
        var result = LX.score(payload, payload.b);
        if (!result) { showError(); return; }
        showResult(payload, result, m[1], true);
      } else {
        startAnswer(payload);
      }
    } else {
      renderRecent();
      show('home');
    }
  })();
})();

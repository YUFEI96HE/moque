/* core.js 单元测试：node test/core.test.js */
var assert = require('assert');
var LX = require('../shared/core.js');

// 1. 纯题库挑战：编解码往返
var picks1 = [
  { bankId: 'L1', ans: 0 }, { bankId: 'F2', ans: 3 }, { bankId: 'W3', ans: 1 },
  { bankId: 'L15', ans: 2 }, { bankId: 'W14', ans: 0 }
];
var enc = LX.encodeChallenge('小可爱', picks1);
console.log('bank challenge payload len =', enc.length);
var dec = LX.decodeStr(enc);
assert(dec && dec.v === 1 && dec.n === '小可爱', 'roundtrip basic');
assert(dec.c.length === 5 && dec.s.length === 5);
assert(dec.s[0] === 0 && dec.s[1] === 3);

var qs = LX.expandQuestions(dec);
assert(qs.length === 5 && qs[0].text === '最理想的周末怎么过？' && qs[0].opts.length === 4);

// 2. 算分
var r = LX.score(dec, [0, 3, 1, 2, 0]);
assert(r.score === 100 && r.hit === 5 && r.verdict.title === '天作之合', 'full score');
var r2 = LX.score(dec, [0, 0, 1, 2, 1]);
assert(r2.hit === 3 && r2.score === 60 && r2.verdict.title === '渐入佳境', 'partial score');
assert(r2.detail[1].hit === false && r2.detail[1].opts[r2.detail[1].aIdx] === '发语音说不来了' && r2.detail[1].bIdx === 0);
assert(LX.score(dec, [1, 2, 3, 1, 2]).score === 0, 'zero score');
assert(LX.score(dec, [0, 0]) === null, 'answer length mismatch -> null');

// 3. 自定义题混合
var picks2 = [
  { custom: { t: '我们第一次见面在哪儿？', o: ['学校', '网络', '朋友聚会', 'x'.repeat(40)] }, ans: 1 },
  { bankId: 'W2', ans: 2 }
];
var enc2 = LX.encodeChallenge('测试人', picks2);
console.log('mixed challenge payload len =', enc2.length);
var dec2 = LX.decodeStr(enc2);
assert(dec2.c[0].t === '我们第一次见面在哪儿？');
assert(dec2.c[0].o.length === 4 && dec2.c[0].o[0] === '学校');
assert(dec2.c[0].o[3].length === 24, 'long option sliced to 24');
assert(LX.expandQuestions(dec2)[0].opts.length === 4);

// 4. 非法输入
assert(LX.decodeStr('!!!!!') === null, 'bad base64 -> null');
assert(LX.expandQuestions({ c: [{ i: 'NOPE' }] }) === null, 'unknown bank id -> null');
assert(LX.expandQuestions(null) === null);

// 5. 点评区间
assert(LX.verdictFor(80).title === '默契满分预定');
assert(LX.verdictFor(20).title === '相爱相杀');
assert(LX.verdictFor(0).title === '平行宇宙');

// 6. 战报载荷往返
var rEnc = LX.encodeObj(Object.assign({}, dec, { b: [0, 3, 1, 2, 0] }));
var rDec = LX.decodeStr(rEnc);
assert(rDec.b.length === 5 && rDec.s.length === 5);
assert(LX.score(rDec, rDec.b).score === 100);

// 7. 长度预算（微信分享 path 可承受）
assert(enc.length < 300, 'bank payload short enough');

// 8. 昵称截断
var long = LX.encodeChallenge('x'.repeat(30), [{ bankId: 'L1', ans: 1 }]);
assert(LX.decodeStr(long).n.length === 16, 'name sliced to 16');

// 9. 异常分支
var threw = false;
try { LX.encodeChallenge('a', []); } catch (e) { threw = true; }
assert(threw, 'no picks -> throw');
threw = false;
try { LX.encodeChallenge('a', [{ bankId: 'XX', ans: 0 }]); } catch (e) { threw = true; }
assert(threw, 'bad bank id -> throw');

// 10. emoji 往返（surrogate pair）
var em = LX.encodeChallenge('😀emoji', [{ custom: { t: '你最喜欢的表情😀🎉?', o: ['😀', '🎉', '💩', '🚀'] }, ans: 2 }]);
var emd = LX.decodeStr(em);
assert(emd.n === '😀emoji' && emd.c[0].o[2] === '💩', 'emoji roundtrip');

console.log('ALL TESTS PASSED ✓');

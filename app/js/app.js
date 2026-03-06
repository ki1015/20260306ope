(function () {
  'use strict';

  var STORAGE_KEY = 'quiz_stats';
  var UNLOCK_KEY = 'app_unlocked';
  var LOCK_PASSWORD = 'takoyaki'; /* 公開用パスワード。変更する場合はここを編集 */

  var CATEGORIES = {
    positioning: 'ポジショニング・Value Line',
    make_buy: '内製・外製',
    partnership: 'パートナーシップ・リーン',
    scm: 'SCM',
    inventory: '在庫・PSI',
    franchise: 'フランチャイズ',
    global: 'グローバル',
    industry: '業界分析',
    ops_framework: 'オペ戦略の枠組み',
    continuous: '継続的改善',
    scale_economy: '規模の経済・範囲・密度',
    production_mode: '計画生産・受注生産',
    process_analysis: 'プロセス・ボトルネック',
    cost_benefit: '費用対効果・意思決定'
  };

  var DATA_URL = '../data/quiz_questions.json';
  var QUESTIONS_PER_SESSION = 10;
  // 回答時間: 制限なし / 10秒 / 20秒 / 30秒
  var TIME_LIMIT_OPTIONS = [
    { value: 0, label: '制限なし' },
    { value: 10, label: '10秒' },
    { value: 20, label: '20秒' },
    { value: 30, label: '30秒' }
  ];

  var state = {
    allQuestions: [],
    questions: [],
    index: 0,
    score: 0,
    sessionWrongIds: [],
    onlyWrongMode: false,
    userAnswerIndex: null,
    showResult: false,
    answerTimeLimit: 0,
    answerTimerId: null,
    timerCountdownId: null,
    challengeModeLabel: '',
    shuffledCorrectIndex: 0
  };

  var screens = {
    title: document.getElementById('screen-title'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result'),
    summary: document.getElementById('screen-summary')
  };

  var els = {
    categoryList: document.getElementById('category-list'),
    btnFullChallenge: document.getElementById('btn-full-challenge'),
    btnAll: document.getElementById('btn-all'),
    btnWrongOnly: document.getElementById('btn-wrong-only'),
    statsArea: document.getElementById('stats-area'),
    timeLimitOptions: document.getElementById('time-limit-options'),
    quizModeLabel: document.getElementById('quiz-mode-label'),
    resultModeLabel: document.getElementById('result-mode-label'),
    resultProgressText: document.getElementById('result-progress-text'),
    resultScoreText: document.getElementById('result-score-text'),
    progressText: document.getElementById('progress-text'),
    timerDisplay: document.getElementById('timer-display'),
    timerBarWrap: document.getElementById('timer-bar-wrap'),
    timerBar: document.getElementById('timer-bar'),
    scoreText: document.getElementById('score-text'),
    questionText: document.getElementById('question-text'),
    choices: document.getElementById('choices'),
    resultLabel: document.getElementById('result-label'),
    resultBadge: document.getElementById('result-badge'),
    explanationText: document.getElementById('explanation-text'),
    btnNext: document.getElementById('btn-next'),
    summaryText: document.getElementById('summary-text'),
    summaryStats: document.getElementById('summary-stats'),
    btnRetry: document.getElementById('btn-retry'),
    btnRetrySessionWrong: document.getElementById('btn-retry-session-wrong'),
    btnReviewWrong: document.getElementById('btn-review-wrong'),
    btnBackQuiz: document.getElementById('btn-back-quiz'),
    btnBackResult: document.getElementById('btn-back-result'),
    btnResetStats: document.getElementById('btn-reset-stats')
  };

  (function setTitleImagePath() {
    var img = document.querySelector('.title-image');
    if (!img) return;
    var script = document.currentScript || document.querySelector('script[src*="app.js"]');
    var base = (script && script.src) ? script.src.replace(/\/js\/app\.js.*$/, '/') : '';
    img.src = base ? (base + 'img/title.png') : 'img/title.png';
  })();

  function getStats() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function setStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {}
  }

  function recordAnswer(questionId, isCorrect) {
    var stats = getStats();
    if (!stats[questionId]) stats[questionId] = { correct: 0, wrong: 0 };
    if (isCorrect) stats[questionId].correct += 1;
    else stats[questionId].wrong += 1;
    setStats(stats);
  }

  function getWrongQuestionIds() {
    var stats = getStats();
    var ids = [];
    Object.keys(stats).forEach(function (id) {
      if (stats[id].wrong > 0) ids.push(id);
    });
    return ids;
  }

  function getSessionCategoryStats() {
    var wrongSet = {};
    state.sessionWrongIds.forEach(function (id) { wrongSet[id] = true; });
    var byCat = {};
    state.questions.forEach(function (q) {
      var c = q.category;
      if (!byCat[c]) byCat[c] = { correct: 0, wrong: 0 };
      if (wrongSet[q.id]) byCat[c].wrong += 1;
      else byCat[c].correct += 1;
    });
    var list = [];
    Object.keys(byCat).forEach(function (c) {
      var t = byCat[c].correct + byCat[c].wrong;
      if (t > 0) {
        list.push({
          id: c,
          name: CATEGORIES[c] || c,
          correct: byCat[c].correct,
          wrong: byCat[c].wrong,
          total: t,
          rate: Math.round((byCat[c].correct / t) * 100)
        });
      }
    });
    list.sort(function (a, b) { return b.rate - a.rate; });
    return list;
  }

  function getCategoryStats(questions) {
    var stats = getStats();
    var byCat = {};
    questions.forEach(function (q) {
      var c = q.category;
      if (!byCat[c]) byCat[c] = { correct: 0, wrong: 0 };
      var s = stats[q.id];
      if (s) {
        byCat[c].correct += s.correct;
        byCat[c].wrong += s.wrong;
      }
    });
    var list = [];
    Object.keys(byCat).forEach(function (c) {
      var t = byCat[c].correct + byCat[c].wrong;
      if (t > 0) {
        list.push({
          id: c,
          name: CATEGORIES[c] || c,
          correct: byCat[c].correct,
          wrong: byCat[c].wrong,
          total: t,
          rate: Math.round((byCat[c].correct / t) * 100)
        });
      }
    });
    list.sort(function (a, b) { return b.rate - a.rate; });
    return list;
  }

  function getOverallStats(questions) {
    var stats = getStats();
    var correct = 0, wrong = 0;
    questions.forEach(function (q) {
      var s = stats[q.id];
      if (s) {
        correct += s.correct;
        wrong += s.wrong;
      }
    });
    var total = correct + wrong;
    return {
      correct: correct,
      wrong: wrong,
      total: total,
      rate: total > 0 ? Math.round((correct / total) * 100) : 0,
      answeredCount: Object.keys(stats).length
    };
  }

  function showScreen(id) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('active', screens[key].id === 'screen-' + id);
    });
  }

  function goToStart() {
    clearAnswerTimer();
    showScreen('title');
    renderTitleScreen();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function startQuiz(categoryId, onlyWrong, fullChallenge) {
    var selectedBtn = document.querySelector('#time-limit-options .time-limit-btn.selected');
    if (selectedBtn && selectedBtn.dataset.seconds !== undefined) {
      state.answerTimeLimit = parseInt(selectedBtn.dataset.seconds, 10) || 0;
    }
    var list;
    if (onlyWrong) {
      var wrongIds = getWrongQuestionIds();
      var idSet = {};
      wrongIds.forEach(function (id) { idSet[id] = true; });
      list = state.allQuestions.filter(function (q) { return idSet[q.id]; });
      if (list.length === 0) {
        list = state.allQuestions;
      }
    } else {
      list = categoryId
        ? state.allQuestions.filter(function (q) { return q.category === categoryId; })
        : state.allQuestions;
      if (list.length === 0) list = state.allQuestions;
    }
    list = shuffle(list);
    if (fullChallenge || onlyWrong) {
      state.questions = list;
    } else {
      state.questions = list.slice(0, QUESTIONS_PER_SESSION);
    }
    state.index = 0;
    state.score = 0;
    state.sessionWrongIds = [];
    state.onlyWrongMode = !!onlyWrong;
    state.showResult = false;
    state.challengeModeLabel = fullChallenge ? '全問チャレンジ' : (onlyWrong ? '間違えた問題だけ復習' : (categoryId ? (CATEGORIES[categoryId] || categoryId) : 'ランダム10問'));
    showScreen('quiz');
    renderQuestion();
  }

  function retrySessionWrong() {
    var ids = state.sessionWrongIds.slice();
    if (ids.length === 0) return;
    var idSet = {};
    ids.forEach(function (id) { idSet[id] = true; });
    state.questions = shuffle(state.allQuestions.filter(function (q) { return idSet[q.id]; }));
    state.index = 0;
    state.score = 0;
    state.sessionWrongIds = [];
    state.onlyWrongMode = true;
    state.showResult = false;
    state.challengeModeLabel = '間違えた問題だけ復習';
    showScreen('quiz');
    renderQuestion();
  }

  function clearAnswerTimer() {
    if (state.answerTimerId) {
      clearTimeout(state.answerTimerId);
      state.answerTimerId = null;
    }
    if (state.timerCountdownId) {
      clearInterval(state.timerCountdownId);
      state.timerCountdownId = null;
    }
    if (els.timerDisplay) els.timerDisplay.textContent = '';
    if (els.timerBarWrap) {
      els.timerBarWrap.style.display = 'none';
      els.timerBarWrap.setAttribute('aria-hidden', 'true');
    }
    if (els.timerBar) els.timerBar.classList.remove('timer-bar-warning');
  }

  function updateTimerBar(remaining, total) {
    if (!els.timerBar || !els.timerBarWrap) return;
    var pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
    els.timerBar.style.width = pct + '%';
    els.timerBar.setAttribute('aria-valuenow', remaining);
    els.timerBar.setAttribute('aria-valuemax', total);
    if (remaining <= 3) els.timerBar.classList.add('timer-bar-warning');
    else els.timerBar.classList.remove('timer-bar-warning');
  }

  function startAnswerTimer() {
    if (state.answerTimeLimit <= 0 || !els.timerDisplay) return;
    var remaining = state.answerTimeLimit;
    var total = state.answerTimeLimit;
    els.timerDisplay.textContent = '残り ' + remaining + '秒';
    els.timerDisplay.className = 'timer-display';
    if (els.timerBarWrap) {
      els.timerBarWrap.style.display = 'block';
      els.timerBarWrap.setAttribute('aria-hidden', 'false');
    }
    updateTimerBar(remaining, total);
    state.timerCountdownId = setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) {
        updateTimerBar(0, total);
        clearAnswerTimer();
        timeUp();
        return;
      }
      els.timerDisplay.textContent = '残り ' + remaining + '秒';
      if (remaining <= 3) els.timerDisplay.classList.add('timer-warning');
      updateTimerBar(remaining, total);
    }, 1000);
    state.answerTimerId = setTimeout(function () {
      if (state.timerCountdownId) clearInterval(state.timerCountdownId);
      state.timerCountdownId = null;
      state.answerTimerId = null;
      timeUp();
    }, state.answerTimeLimit * 1000);
  }

  function timeUp() {
    if (state.showResult) return;
    var q = state.questions[state.index];
    if (!q) return;
    state.showResult = true;
    state.sessionWrongIds.push(q.id);
    recordAnswer(q.id, false);
    var correctIndex = q.type === 'boolean' ? (q.correct ? 0 : 1) : state.shuffledCorrectIndex;
    var buttons = els.choices.querySelectorAll('.choice-btn');
    buttons.forEach(function (b, i) {
      b.disabled = true;
      if (i === correctIndex) b.classList.add('correct');
    });
    els.resultLabel.textContent = '時間切れ';
    els.resultLabel.className = 'result-label wrong';
    if (els.resultBadge) {
      els.resultBadge.textContent = '⏱ 時間切れ！';
      els.resultBadge.className = 'result-badge wrong';
      els.resultBadge.setAttribute('aria-hidden', 'false');
    }
    var resultScreen = document.getElementById('screen-result');
    if (resultScreen) {
      resultScreen.classList.remove('is-correct', 'is-wrong');
      resultScreen.classList.add('is-wrong');
    }
    var correctLabelTimeUp = q.type === 'boolean' ? ['○', '×'][correctIndex] : String.fromCharCode(65 + correctIndex);
    els.explanationText.textContent = formatExplanation('時間切れ', correctLabelTimeUp, q.explanation, true);
    if (els.resultModeLabel) {
      els.resultModeLabel.textContent = state.challengeModeLabel || '';
      els.resultModeLabel.style.display = state.challengeModeLabel ? 'block' : 'none';
      els.resultModeLabel.setAttribute('aria-hidden', state.challengeModeLabel ? 'false' : 'true');
    }
    if (els.resultProgressText) els.resultProgressText.textContent = (state.index + 1) + ' / ' + state.questions.length;
    if (els.resultScoreText) els.resultScoreText.textContent = state.score + ' 正解';
    showScreen('result');
  }

  function renderQuestion() {
    clearAnswerTimer();
    var q = state.questions[state.index];
    if (!q) {
      showSummary();
      return;
    }

    var total = state.questions.length;
    if (els.quizModeLabel) {
      els.quizModeLabel.textContent = state.challengeModeLabel || '';
      els.quizModeLabel.style.display = state.challengeModeLabel ? 'block' : 'none';
      els.quizModeLabel.setAttribute('aria-hidden', state.challengeModeLabel ? 'false' : 'true');
    }
    els.progressText.textContent = (state.index + 1) + ' / ' + total;
    els.scoreText.textContent = state.score + ' 正解';

    els.questionText.textContent = q.question;
    els.choices.innerHTML = '';

    if (q.type === 'boolean') {
      var wrap = document.createElement('div');
      wrap.className = 'choice-bool';
      ['○', '×'].forEach(function (label, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.textContent = label;
        btn.dataset.index = String(i);
        btn.addEventListener('click', onChoiceClick);
        wrap.appendChild(btn);
      });
      els.choices.appendChild(wrap);
    } else {
      var options = q.options || [];
      var indices = options.map(function (_, i) { return i; });
      var shuffledIndices = shuffle(indices);
      state.shuffledCorrectIndex = shuffledIndices.indexOf(q.correctIndex);
      shuffledIndices.forEach(function (origIdx, i) {
        var opt = options[origIdx];
        var letter = String.fromCharCode(65 + i);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.textContent = letter + '. ' + opt;
        btn.dataset.index = String(i);
        btn.addEventListener('click', onChoiceClick);
        els.choices.appendChild(btn);
      });
    }

    startAnswerTimer();
  }

  function onChoiceClick(ev) {
    if (state.showResult) return;
    clearAnswerTimer();
    var btn = ev.target;
    if (btn.className.indexOf('choice-btn') === -1) return;

    var idx = parseInt(btn.dataset.index, 10);
    var q = state.questions[state.index];
    var correctIndex = q.type === 'boolean' ? (q.correct ? 0 : 1) : state.shuffledCorrectIndex;
    var isCorrect = idx === correctIndex;

    state.userAnswerIndex = idx;
    state.showResult = true;
    if (isCorrect) {
      state.score += 1;
    } else {
      state.sessionWrongIds.push(q.id);
    }

    recordAnswer(q.id, isCorrect);

    var buttons = els.choices.querySelectorAll('.choice-btn');
    buttons.forEach(function (b, i) {
      b.disabled = true;
      if (i === correctIndex) b.classList.add('correct');
      else if (i === idx && !isCorrect) b.classList.add('wrong');
    });

    els.resultLabel.textContent = isCorrect ? '正解' : '不正解';
    els.resultLabel.className = 'result-label ' + (isCorrect ? 'correct' : 'wrong');
    if (els.resultBadge) {
      els.resultBadge.textContent = isCorrect ? '✓ 正解！' : '✗ 不正解';
      els.resultBadge.className = 'result-badge ' + (isCorrect ? 'correct' : 'wrong');
      els.resultBadge.setAttribute('aria-hidden', 'false');
    }
    var resultScreen = document.getElementById('screen-result');
    if (resultScreen) {
      resultScreen.classList.remove('is-correct', 'is-wrong');
      resultScreen.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
    }
    var userLabel = q.type === 'boolean' ? ['○', '×'][idx] : String.fromCharCode(65 + idx);
    var correctLabel = q.type === 'boolean' ? ['○', '×'][correctIndex] : String.fromCharCode(65 + correctIndex);
    els.explanationText.textContent = formatExplanation(userLabel, correctLabel, q.explanation, false);
    if (els.resultModeLabel) {
      els.resultModeLabel.textContent = state.challengeModeLabel || '';
      els.resultModeLabel.style.display = state.challengeModeLabel ? 'block' : 'none';
      els.resultModeLabel.setAttribute('aria-hidden', state.challengeModeLabel ? 'false' : 'true');
    }
    if (els.resultProgressText) els.resultProgressText.textContent = (state.index + 1) + ' / ' + state.questions.length;
    if (els.resultScoreText) els.resultScoreText.textContent = state.score + ' 正解';
    showScreen('result');
  }

  function onNext() {
    state.index += 1;
    state.showResult = false;
    state.userAnswerIndex = null;
    if (state.index >= state.questions.length) {
      showSummary();
    } else {
      showScreen('quiz');
      renderQuestion();
    }
  }

  function showSummary() {
    var total = state.questions.length;
    var s = state.score;
    var rate = total > 0 ? Math.round((s / total) * 100) : 0;
    var isOnlyWrongMode = state.onlyWrongMode;
    var sessionWrongCount = state.sessionWrongIds.length;

    // 「間違えた問題だけ」モードで今回全部正解 → 全部正解で終了
    if (isOnlyWrongMode && sessionWrongCount === 0) {
      els.summaryText.innerHTML = '全部正解！<br><span class="summary-done">おつかれさま</span>';
      els.summaryStats.innerHTML = '';
      if (els.btnRetrySessionWrong) els.btnRetrySessionWrong.style.display = 'none';
      if (els.btnReviewWrong) els.btnReviewWrong.style.display = 'none';
      showScreen('summary');
      return;
    }

    els.summaryText.innerHTML = '<strong>' + s + ' / ' + total + '</strong> 問正解（今回の正答率 ' + rate + '%）';

    var sessionByCat = getSessionCategoryStats();
    var overall = getOverallStats(state.allQuestions);
    var byCat = getCategoryStats(state.allQuestions);

    var html = '';

    html += '<p class="stat-section-label">今回のチャレンジ</p>';
    html += '<p class="overall-stat">今回の正答率 <strong>' + rate + '%</strong>（' + s + ' / ' + total + ' 問）</p>';
    if (sessionByCat.length > 0) {
      html += '<p class="stat-label">今回のカテゴリ別 正答率</p><ul class="stat-list stat-list-rates">';
      sessionByCat.forEach(function (x) {
        html += '<li>' + escapeHtml(x.name) + ' … ' + x.rate + '%</li>';
      });
      html += '</ul>';
    }

    html += '<p class="stat-section-label">生涯（累計）</p>';
    if (overall.total > 0) {
      html += '<p class="overall-stat">累計正答率 <strong>' + overall.rate + '%</strong>（' + overall.answeredCount + ' 問に解答済み）</p>';
    }
    if (byCat.length > 0) {
      html += '<p class="stat-label">カテゴリ別 正答率（累計）</p><ul class="stat-list stat-list-rates">';
      byCat.forEach(function (x) {
        html += '<li>' + escapeHtml(x.name) + ' … ' + x.rate + '%</li>';
      });
      html += '</ul>';
    }
    els.summaryStats.innerHTML = html || '';

    // 今回間違えた問題だけもう一度（「間違えた問題だけ」モードで不正解があったとき）
    if (els.btnRetrySessionWrong) {
      if (isOnlyWrongMode && sessionWrongCount > 0) {
        els.btnRetrySessionWrong.textContent = '今回間違えた問題だけもう一度（' + sessionWrongCount + ' 問）';
        els.btnRetrySessionWrong.style.display = '';
      } else {
        els.btnRetrySessionWrong.style.display = 'none';
      }
    }

    var wrongCount = getWrongQuestionIds().length;
    if (els.btnReviewWrong) {
      els.btnReviewWrong.textContent = wrongCount > 0 ? '間違えた問題を復習（' + wrongCount + ' 問）' : '間違えた問題を復習';
      els.btnReviewWrong.style.display = wrongCount > 0 ? '' : 'none';
    }

    showScreen('summary');
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatExplanation(yourAnswerLabel, correctLabel, explanation, isTimeUp) {
    var raw = explanation || '（解説なし）';
    var reason = raw;
    var example = '';
    var idx = raw.indexOf('例：');
    if (idx === -1) idx = raw.indexOf('例:');
    if (idx !== -1) {
      reason = raw.slice(0, idx).trim();
      example = raw.slice(idx).trim();
    }
    var lines = [
      'あなたの回答',
      yourAnswerLabel,
      '',
      '正解',
      correctLabel,
      '',
      '理由',
      reason,
      '',
      '具体例',
      example || '（特になし）'
    ];
    return lines.join('\n');
  }

  function renderTimeLimitOptions() {
    if (!els.timeLimitOptions) return;
    els.timeLimitOptions.innerHTML = '';
    TIME_LIMIT_OPTIONS.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-limit-btn' + (state.answerTimeLimit === opt.value ? ' selected' : '');
      btn.textContent = opt.label;
      btn.dataset.seconds = String(opt.value);
      btn.addEventListener('click', function () {
        state.answerTimeLimit = opt.value;
        renderTimeLimitOptions();
      });
      els.timeLimitOptions.appendChild(btn);
    });
  }

  function renderTitleScreen() {
    renderTimeLimitOptions();
    renderCategoryToggles();

    var wrongIds = getWrongQuestionIds();
    var wrongCount = wrongIds.length;
    if (els.btnWrongOnly) {
      els.btnWrongOnly.textContent = '間違えた問題だけ復習（' + wrongCount + ' 問）';
      els.btnWrongOnly.style.display = wrongCount > 0 ? '' : 'none';
      els.btnWrongOnly.onclick = function () { startQuiz(null, true, false); };
    }

    var overall = getOverallStats(state.allQuestions);
    if (els.statsArea) {
      if (overall.total > 0) {
        els.statsArea.innerHTML =
          '<p class="stats-heading">生涯成績</p><p class="stats-line">正答率 <strong>' + overall.rate + '%</strong> · 解答済み <strong>' + overall.answeredCount + '</strong> 問</p>';
        els.statsArea.style.display = 'block';
      } else {
        els.statsArea.style.display = 'none';
      }
    }
  }

  function renderCategoryToggles() {
    if (!els.categoryList) return;
    els.categoryList.innerHTML = '';
    Object.keys(CATEGORIES).forEach(function (id) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-btn category-toggle-btn';
      btn.textContent = CATEGORIES[id];
      btn.dataset.categoryId = id;
      btn.addEventListener('click', function () {
        startQuiz(id, false, false);
      });
      els.categoryList.appendChild(btn);
    });
  }

  function bind() {
    els.btnNext.addEventListener('click', onNext);
    if (els.btnFullChallenge) {
      els.btnFullChallenge.addEventListener('click', function () { startQuiz(null, false, true); });
    }
    if (els.btnAll) {
      els.btnAll.addEventListener('click', function () { startQuiz(null, false, false); });
    }
    if (els.btnRetry) {
      els.btnRetry.addEventListener('click', goToStart);
    }
    if (els.btnBackQuiz) {
      els.btnBackQuiz.addEventListener('click', goToStart);
    }
    if (els.btnBackResult) {
      els.btnBackResult.addEventListener('click', goToStart);
    }
    if (els.btnResetStats) {
      els.btnResetStats.addEventListener('click', function () {
        if (confirm('正誤の記録をすべてリセットします。よろしいですか？')) {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {}
          renderTitleScreen();
        }
      });
    }
    if (els.btnRetrySessionWrong) {
      els.btnRetrySessionWrong.addEventListener('click', function () {
        retrySessionWrong();
      });
    }
    if (els.btnReviewWrong) {
      els.btnReviewWrong.addEventListener('click', function () {
        startQuiz(null, true, false);
      });
    }
  }

  function loadData() {
    fetch(DATA_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.allQuestions = data.questions || [];
        renderTitleScreen();
      })
      .catch(function () {
        if (els.categoryList) {
          els.categoryList.innerHTML = '<p class="error-msg">問題データの読み込みに失敗しました。<br>同じフォルダでサーバーを起動して開いてください。<br>例: npx serve .</p>';
        }
      });
  }

  function isUnlocked() {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function unlock() {
    try {
      sessionStorage.setItem(UNLOCK_KEY, '1');
    } catch (e) {}
    var lockEl = document.getElementById('screen-lock');
    if (lockEl) lockEl.classList.add('unlocked');
    loadData();
    bind();
  }

  function initWithLock() {
    var lockEl = document.getElementById('screen-lock');
    if (!lockEl) {
      loadData();
      bind();
      return;
    }
    if (isUnlocked()) {
      lockEl.classList.add('unlocked');
      loadData();
      bind();
      return;
    }
    var form = document.getElementById('lock-form');
    var input = document.getElementById('lock-password');
    var err = document.getElementById('lock-error');
    if (form && input) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (err) err.textContent = '';
        if (input.value === LOCK_PASSWORD) {
          unlock();
        } else {
          if (err) err.textContent = 'パスワードが違います';
          input.focus();
        }
      });
      input.focus();
    }
  }

  initWithLock();
})();

/* ============================================================
   Excel 基础、函数与实战 · 网页版教程
   交互脚本：目录导航 / 全文搜索 / 滚动定位 / 学习进度 / 代码复制
   ============================================================ */
(function () {
  'use strict';

  const KEY_DONE = 'excel-course-done';
  const KEY_LAST = 'excel-course-last';
  const KEY_THEME = 'excel-course-theme';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 隐私模式忽略 */ }
    }
  };

  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
  }

  /* ---------------- 深色模式 ---------------- */
  function initTheme() {
    const saved = store.get(KEY_THEME, null);
    if (saved === 'dark') document.documentElement.classList.add('dark');
    if (saved === 'light') document.documentElement.classList.remove('dark');

    const btn = $('#themeBtn');
    if (!btn) return;
    const paintThemeButton = () => {
      const isDark = document.documentElement.classList.contains('dark');
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? '切换为浅色模式' : '切换为深色模式');
    };
    paintThemeButton();
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      store.set(KEY_THEME, isDark ? 'dark' : 'light');
      paintThemeButton();
      toast(isDark ? '已切换为深色模式' : '已切换为浅色模式');
    });
  }

  /* ---------------- 侧边抽屉 ---------------- */
  function initDrawer() {
    const sidebar = $('#sidebar');
    const scrim = $('#scrim');
    const menuBtn = $('#menuBtn');
    if (!sidebar || !menuBtn) return;

    const isFloating = () => window.matchMedia('(max-width: 1059px)').matches;
    const setOpen = (open) => {
      sidebar.classList.toggle('open', open);
      scrim.classList.toggle('show', open);
      document.body.classList.toggle('nav-open', open && isFloating());
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? '关闭目录' : '打开目录');
    };
    const close = () => setOpen(false);

    menuBtn.addEventListener('click', () => {
      setOpen(!sidebar.classList.contains('open'));
    });
    scrim.addEventListener('click', close);
    sidebar.addEventListener('click', (e) => {
      if (e.target.closest('a') && isFloating()) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (!isFloating()) close(); });
  }

  /* ---------------- 为详解编生成可用目录 ---------------- */
  function hydrateNav() {
    const mainTopic = /^(?:\d+\.\s|第[一二三四五六七八九十百]+章\s|0\.\s)/;

    $$('.nav-part').forEach((navPart) => {
      if ($('.nav-chapters', navPart)) return;
      const btn = $('.nav-part-btn', navPart);
      const target = btn && document.getElementById(btn.dataset.target);
      if (!btn || !target) return;

      const topics = $$('.section-title', target).filter((heading) => mainTopic.test(heading.textContent.trim()));
      const list = document.createElement('ul');
      list.className = 'nav-chapters';

      const links = topics.length ? [target].concat(topics) : [target];
      links.forEach((heading) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.dataset.navLink = heading.id;
        a.textContent = heading === target ? (topics.length ? '本编导览' : '进入本编') : heading.textContent.replace(/\s+/g, ' ').trim();
        li.appendChild(a);
        list.appendChild(li);
      });
      navPart.appendChild(list);

      const count = $('.nav-count', navPart);
      if (count) count.textContent = String(links.length);
    });
  }

  /* ---------------- 目录展开 / 折叠 ---------------- */
  function initNav() {
    $$('.nav-part-btn').forEach((btn, index) => {
      const list = $('.nav-chapters', btn.parentElement);
      if (list) {
        if (!list.id) list.id = 'nav-list-' + (index + 1);
        btn.setAttribute('aria-controls', list.id);
      }
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', () => {
        const part = btn.parentElement;
        const willExpand = !part.classList.contains('expanded');
        part.classList.toggle('expanded', willExpand);
        btn.setAttribute('aria-expanded', String(willExpand));
        if (willExpand) {
          const target = document.getElementById(btn.dataset.target);
          if (target) scrollToEl(target);
        }
      });
    });

    const collapse = $('#collapseAll');
    if (collapse) {
      collapse.addEventListener('click', () => {
        const anyOpen = $$('.nav-part.expanded').length > 0;
        $$('.nav-part').forEach((p) => {
          p.classList.toggle('expanded', !anyOpen);
          const btn = $('.nav-part-btn', p);
          if (btn) btn.setAttribute('aria-expanded', String(!anyOpen));
        });
        collapse.textContent = anyOpen ? '全部展开' : '全部折叠';
      });
    }
  }

  function scrollToEl(el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - 68;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ---------------- 学习进度 ---------------- */
  function initProgress() {
    let done = store.get(KEY_DONE, []);
    if (!Array.isArray(done)) done = [];
    const total = $$('.done-btn').length;

    function paint() {
      $$('.done-btn').forEach((btn) => {
        const on = done.indexOf(btn.dataset.done) !== -1;
        btn.classList.toggle('is-done', on);
        btn.textContent = on ? '已学完' : '标记学完';
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', on ? '取消本章已学完标记' : '标记本章已学完');
        btn.title = on ? '取消本章已学完标记' : '标记本章已学完';
      });
      $$('[data-nav-link]').forEach((a) => {
        a.classList.toggle('done', done.indexOf(a.dataset.navLink) !== -1);
      });
      const count = $('#doneCount');
      const fill = $('#progressFill');
      if (count) count.textContent = String(done.length);
      if (fill) fill.style.width = total ? (done.length / total * 100) + '%' : '0%';
    }

    $$('.done-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.done;
        const i = done.indexOf(id);
        if (i === -1) { done.push(id); toast('已标记本章学完'); }
        else { done.splice(i, 1); toast('已取消标记'); }
        store.set(KEY_DONE, done);
        paint();
      });
    });

    const reset = $('#resetProgress');
    if (reset) {
      reset.addEventListener('click', () => {
        done = [];
        store.set(KEY_DONE, done);
        paint();
        toast('学习进度已重置');
      });
    }
    paint();
  }

  /* ---------------- 阅读位置记忆 ---------------- */
  function initResume() {
    const btn = $('#resumeBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        const last = store.get(KEY_LAST, null);
        const el = last && document.getElementById(last);
        if (el) { scrollToEl(el); toast('已回到上次阅读位置'); }
        else { toast('还没有阅读记录'); }
      });
    }
  }

  /* ---------------- 滚动定位：侧栏高亮 + 右侧小节目录 ---------------- */
  function initScrollSpy() {
    const navTargets = $$('[data-nav-link]').map((link) => document.getElementById(link.dataset.navLink)).filter(Boolean);
    const tocList = $('#tocList');
    let activeTarget = null;

    function renderToc(target) {
      if (!tocList) return;
      tocList.innerHTML = '';
      let sections = [];
      if (target && target.classList.contains('chapter')) {
        sections = $$('.section-title', target);
      } else if (target && target.classList.contains('section-title')) {
        const part = target.closest('.part');
        const all = part ? $$('.section-title', part) : [];
        const mainIds = new Set(navTargets.map((el) => el.id));
        const start = all.indexOf(target);
        if (start !== -1) {
          sections = [target];
          for (let i = start + 1; i < all.length && !mainIds.has(all[i].id); i++) sections.push(all[i]);
        }
      }
      sections.forEach((h) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.dataset.tocLink = h.id;
        li.appendChild(a);
        tocList.appendChild(li);
      });
    }

    function setActive(target) {
      if (target === activeTarget) return;
      activeTarget = target;

      if (!target) {
        $$('[data-nav-link]').forEach((a) => a.classList.remove('active'));
        if (tocList) tocList.innerHTML = '';
        return;
      }

      const id = target.id;
      store.set(KEY_LAST, id);

      $$('[data-nav-link]').forEach((a) => a.classList.remove('active'));
      const link = $('[data-nav-link="' + id + '"]');
      if (link) {
        link.classList.add('active');
        const part = link.closest('.nav-part');
        if (part && !part.classList.contains('expanded')) part.classList.add('expanded');
        const nav = $('.sidebar nav');
        if (nav) {
          const r = link.getBoundingClientRect();
          const nr = nav.getBoundingClientRect();
          if (r.top < nr.top || r.bottom > nr.bottom) {
            nav.scrollTop += r.top - nr.top - nr.height / 2;
          }
        }
      }
      renderToc(target);
    }

    function onScroll() {
      const hero = $('.hero');
      if (hero && hero.getBoundingClientRect().bottom > 120) {
        setActive(null);
      } else {
        // 当前主题：最后一个顶部已越过阈值的目录目标
        let current = navTargets[0];
        for (let i = 0; i < navTargets.length; i++) {
          if (navTargets[i].getBoundingClientRect().top <= 120) current = navTargets[i];
          else break;
        }
        setActive(current);
      }

      // 小节高亮
      const sections = activeTarget && activeTarget.classList.contains('chapter') ? $$('.section-title', activeTarget) : [];
      let cur = null;
      sections.forEach((h) => { if (h.getBoundingClientRect().top <= 140) cur = h; });
      $$('[data-toc-link]').forEach((a) => {
        a.classList.toggle('active', !!cur && a.dataset.tocLink === cur.id);
      });

      // 阅读进度
      const bar = $('#readingBar');
      if (bar) {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      }
      const top = $('#toTop');
      if (top) top.classList.toggle('show', window.pageYOffset > 600);
    }

    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; onScroll(); });
    }, { passive: true });
    onScroll();
  }

  /* ---------------- 全文搜索 ---------------- */
  function initSearch() {
    const input = $('#searchInput');
    const panel = $('#searchPanel');
    const results = $('#searchResults');
    const stat = $('#searchStat');
    const doc = $('#doc');
    const wrap = input && input.closest('.search-wrap');
    if (!input || !doc) return;

    // 建立索引：每个可读元素 → 文本 + 所属章节
    const index = [];
    let chapterTitle = '';
    let chapterId = '';
    let sectionTitle = '';
    let sectionId = '';
    const nodes = $$('.part-title, .chapter-title, .section-title, p, li, td, th, code, figcaption', doc);

    nodes.forEach((el) => {
      if (el.classList.contains('part-title')) {
        chapterTitle = el.textContent.trim();
        chapterId = el.parentElement.id;
        sectionTitle = ''; sectionId = '';
      } else if (el.classList.contains('chapter-title')) {
        chapterTitle = el.textContent.replace(/(已学完|标记学完)$/, '').trim();
        chapterId = el.parentElement.id;
        sectionTitle = ''; sectionId = '';
      } else if (el.classList.contains('section-title')) {
        sectionTitle = el.textContent.trim();
        sectionId = el.id;
      }
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      if (text.length < 2) return;
      index.push({
        text: text,
        low: text.toLowerCase(),
        id: sectionId || chapterId,
        crumb: sectionTitle ? chapterTitle + ' › ' + sectionTitle : chapterTitle
      });
    });

    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    function snippet(text, low, q) {
      const at = low.indexOf(q);
      const start = Math.max(0, at - 34);
      const raw = (start > 0 ? '…' : '') + text.slice(start, at + q.length + 96) + '…';
      const rl = raw.toLowerCase();
      let outHtml = '';
      let i = 0;
      let pos = rl.indexOf(q);
      while (pos !== -1) {
        outHtml += escapeHtml(raw.slice(i, pos)) + '<mark class="hit">' +
                   escapeHtml(raw.substr(pos, q.length)) + '</mark>';
        i = pos + q.length;
        pos = rl.indexOf(q, i);
      }
      return outHtml + escapeHtml(raw.slice(i));
    }

    function closeSearch() {
      panel.hidden = true;
      doc.style.display = '';
      $('.hero').style.display = '';
    }

    function run(qRaw) {
      const q = qRaw.trim().toLowerCase();
      wrap.classList.toggle('has-value', q.length > 0);
      if (!q) { closeSearch(); return; }
      // 中文单字也允许检索；英文需 2 字符以上
      if (q.length < 2 && !/[\u4e00-\u9fff]/.test(q)) { closeSearch(); return; }

      const hits = [];
      const seen = {};
      for (let i = 0; i < index.length && hits.length < 80; i++) {
        const item = index[i];
        if (item.low.indexOf(q) === -1) continue;
        const key = item.id + '|' + item.text.slice(0, 24);
        if (seen[key]) continue;
        seen[key] = 1;
        hits.push(item);
      }

      results.innerHTML = hits.length
        ? hits.map((h) =>
            '<li><a href="#' + h.id + '" data-jump="' + h.id + '">' +
            '<span class="result-crumb">' + escapeHtml(h.crumb) + '</span>' +
            '<span class="result-text">' + snippet(h.text, h.low, q) + '</span></a></li>').join('')
        : '<li class="no-result">没有找到匹配内容。可尝试更短的关键词，例如“透视”“引用”“XLOOKUP”。</li>';

      stat.textContent = '搜索“' + qRaw.trim() + '”：' + hits.length + ' 条结果' +
                         (hits.length >= 80 ? '（已显示前 80 条）' : '');
      panel.hidden = false;
      doc.style.display = 'none';
      $('.hero').style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => run(input.value), 150);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { input.value = ''; run(''); input.blur(); }
    });

    results.addEventListener('click', (e) => {
      const a = e.target.closest('[data-jump]');
      if (!a) return;
      e.preventDefault();
      const el = document.getElementById(a.dataset.jump);
      closeSearch();
      if (el) {
        scrollToEl(el);
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
      }
    });

    $('#closeSearch').addEventListener('click', () => { input.value = ''; run(''); });
    $('#searchClear').addEventListener('click', () => { input.value = ''; run(''); input.focus(); });

    // 快捷键：/ 或 Ctrl/Cmd+K 聚焦搜索
    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  /* ---------------- 代码复制 ---------------- */
  function initCopy() {
    $$('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement.querySelector('code');
        if (!code) return;
        const text = code.textContent;
        const done = () => {
          btn.classList.add('copied');
          btn.textContent = '已复制';
          setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '复制'; }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(fallback);
        } else { fallback(); }

        function fallback() {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); }
          catch (err) { toast('浏览器不支持自动复制，请手动选择'); }
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------------- 其他按钮 ---------------- */
  function initMisc() {
    const top = $('#toTop');
    if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const printBtn = $('#printBtn');
    if (printBtn) printBtn.addEventListener('click', () => window.print());

    // 平滑跳转并记录位置
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.dataset.jump) return;
      const id = a.getAttribute('href').slice(1);
      const el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      scrollToEl(el);
      history.replaceState(null, '', '#' + id);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initDrawer();
    hydrateNav();
    initNav();
    initProgress();
    initResume();
    initScrollSpy();
    initSearch();
    initCopy();
    initMisc();

    const hash = location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => scrollToEl(el), 60);
    }
  });
})();

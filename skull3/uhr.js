  const RADII = {
    sek: 110, min: 152, std: 194, tag: 236, jahr: 278
  };
  const CIRC = {};
  for(const k in RADII){ CIRC[k] = 2 * Math.PI * RADII[k]; }

  for(const k in CIRC){
    document.getElementById('r-' + k).style.strokeDasharray = CIRC[k];
  }

  function pad(n){ return n.toString().padStart(2, '0'); }

  function daysInMonth(year, monthIndex){
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function dayOfYearFraction(now){
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    return (now - start) / (end - start);
  }

  function setRing(key, fraction){
    const c = CIRC[key];
    const offset = c * (1 - fraction);
    document.getElementById('r-' + key).style.strokeDashoffset = offset;
  }

  const COUNTER_STORAGE_KEY = 'time-rings:counters';
  const COUNTER_COLORS = ['var(--c-sek)', 'var(--c-min)', 'var(--c-std)', 'var(--c-tag)', 'var(--c-jahr)'];

  let counters = [];
  try{
    counters = JSON.parse(localStorage.getItem(COUNTER_STORAGE_KEY) || '[]');
  } catch(e){
    counters = [];
  }

  if(!Array.isArray(counters)) counters = [];
  let migrated = false;
  counters.forEach(function(c, i){
    if(typeof c.color !== 'number'){
      c.color = i % COUNTER_COLORS.length;
      migrated = true;
    }
  });
  if(migrated){
    try{ localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counters)); } catch(e){}
  }

  let renderedKey = '';
  let formOpen = false;
  let editingId = null;
  let confirmingId = null;

  function persistCounters(){
    localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counters));
  }

  function escapeHtml(str){
    return str.replace(/[&<>"']/g, function(ch){
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function toLocalInputValue(date){
    const p = function(n){ return n.toString().padStart(2, '0'); };
    return date.getFullYear() + '-' + p(date.getMonth() + 1) + '-' + p(date.getDate()) + 'T' + p(date.getHours()) + ':' + p(date.getMinutes());
  }

  function readTarget(form){
    const d = form.querySelector('[data-field="date"]').value;
    const t = form.querySelector('[data-field="time"]').value;
    return (d && t) ? d + 'T' + t : '';
  }

  function diffBreakdown(now, target){
    let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    let anchor = new Date(now.getFullYear(), now.getMonth() + months, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    if(anchor > target){
      months -= 1;
      anchor = new Date(now.getFullYear(), now.getMonth() + months, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    }
    let remainMs = Math.max(0, target - anchor);
    const days = Math.floor(remainMs / 86400000);
    remainMs -= days * 86400000;
    const hours = Math.floor(remainMs / 3600000);
    remainMs -= hours * 3600000;
    const minutes = Math.floor(remainMs / 60000);
    return { months: Math.max(0, months), days, hours, minutes };
  }

  function formatRemaining(now, target){
    if(target <= now) return 'erreicht';
    const br = diffBreakdown(now, target);
    const years = Math.floor(br.months / 12);
    const months = br.months % 12;
    const { days, hours, minutes } = br;
    const parts = [];
    if(years > 0) parts.push(years + ' Jahr' + (years === 1 ? '' : 'e'));
    if(years > 0 || months > 0) parts.push(months + ' Monat' + (months === 1 ? '' : 'e'));
    if(years > 0 || months > 0 || days > 0) parts.push(days + ' Tag' + (days === 1 ? '' : 'e'));
    parts.push(hours + ' Std');
    parts.push(minutes + ' Min');
    const last = parts.pop();
    return 'noch ' + (parts.length ? parts.join(', ') + ' und ' : '') + last;
  }

  function counterProgress(now, c){
    const target = new Date(c.target);
    const created = new Date(c.created);
    if(target <= created) return 100;
    return Math.min(100, Math.max(0, ((now - created) / (target - created)) * 100));
  }

  const REPEAT_LABELS = { daily: 'täglich', weekly: 'wöchentlich', monthly: 'monatlich', yearly: 'jährlich' };
  const REPEAT_VALUES = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

  function colorOf(c){
    return COUNTER_COLORS[(Number(c.color) || 0) % COUNTER_COLORS.length];
  }

  function pickColor(list){
    const used = COUNTER_COLORS.map(function(){ return 0; });
    list.forEach(function(c){
      if(typeof c.color === 'number' && c.color >= 0 && c.color < used.length) used[c.color]++;
    });
    let best = 0;
    for(let i = 1; i < used.length; i++){
      if(used[i] < used[best]) best = i;
    }
    return best;
  }

  function occurrence(anchor, repeat, k){
    if(repeat === 'daily'){
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + k, anchor.getHours(), anchor.getMinutes());
    }
    if(repeat === 'weekly'){
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 7 * k, anchor.getHours(), anchor.getMinutes());
    }
    const months = repeat === 'yearly' ? 12 * k : k;
    const y = anchor.getFullYear();
    const m = anchor.getMonth() + months;
    const lastDay = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(anchor.getDate(), lastDay), anchor.getHours(), anchor.getMinutes());
  }

  function advanceRecurring(now){
    let changed = false;
    counters.forEach(function(c){
      const rep = c.repeat || 'none';
      if(rep === 'none') return;
      if(new Date(c.target) > now) return;
      const anchor = new Date(c.anchor || c.target);
      if(isNaN(anchor)) return;
      let k = 0;
      let t = anchor;
      while(t <= now && k < 20000){
        k++;
        t = occurrence(anchor, rep, k);
      }
      if(k > 0) c.created = occurrence(anchor, rep, k - 1).toISOString();
      c.target = t.toISOString();
      changed = true;
    });
    return changed;
  }

  function nextAfter(anchor, repeat, now){
    let k = 0;
    let t = anchor;
    while(t <= now && k < 20000){
      k++;
      t = occurrence(anchor, repeat, k);
    }
    return t;
  }

  function formatDateTime(d){
    return d.toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
  }

  function updatePastHint(form){
    const hint = form.querySelector('[data-hint]');
    if(!hint) return;
    const val = readTarget(form);
    const target = val ? new Date(val) : null;
    const now = new Date();
    if(!target || isNaN(target) || target > now){
      hint.hidden = true;
      hint.textContent = '';
      return;
    }
    const rep = form.querySelector('[data-field="repeat"]').value;
    if(REPEAT_LABELS[rep]){
      hint.textContent = 'Der Zeitpunkt liegt in der Vergangenheit. Der Counter (' + REPEAT_LABELS[rep] + ') springt direkt zum nächsten Termin: ' + formatDateTime(nextAfter(target, rep, now)) + '.';
    } else {
      hint.textContent = 'Der Zeitpunkt liegt in der Vergangenheit. Der Counter wird sofort als erreicht angezeigt.';
    }
    hint.hidden = false;
  }

  function sortedCounters(now){
    const n = now.getTime();
    return counters.slice().sort(function(a, b){
      const ta = new Date(a.target).getTime();
      const tb = new Date(b.target).getTime();
      const da = ta <= n;
      const db = tb <= n;
      if(da !== db) return da ? 1 : -1;
      return da ? tb - ta : ta - tb;
    });
  }

  function shortRemaining(now, target){
    const br = diffBreakdown(now, target);
    const years = Math.floor(br.months / 12);
    const months = br.months % 12;
    if(years > 0) return years + ' Jahr' + (years === 1 ? '' : 'e');
    if(months > 0) return months + ' Monat' + (months === 1 ? '' : 'e');
    if(br.days > 0) return br.days + ' Tag' + (br.days === 1 ? '' : 'e');
    if(br.hours > 0) return br.hours + ' Std und ' + br.minutes + ' Min';
    return br.minutes > 0 ? br.minutes + ' Min' : 'unter 1 Min';
  }

  function updateTabTitle(now){
    let next = null;
    counters.forEach(function(c){
      const t = new Date(c.target);
      if(t > now && (!next || t < next)) next = t;
    });
    const title = next ? 'noch ' + shortRemaining(now, next) + ' · Zeitringe' : 'Zeitringe';
    if(document.title !== title) document.title = title;
  }

  function repeatSelect(value){
    const opts = [['none', 'Einmalig'], ['daily', 'Täglich'], ['weekly', 'Wöchentlich'], ['monthly', 'Monatlich'], ['yearly', 'Jährlich']];
    return '<label class="counter-field"><span>Wiederholung</span>' +
      '<select class="counter-input" data-field="repeat" title="Nach Ablauf springt der Counter automatisch zum nächsten Termin">' +
      opts.map(function(o){
        return '<option value="' + o[0] + '"' + (o[0] === value ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') +
      '</select></label>';
  }

  function removeControl(c){
    if(c.id === confirmingId){
      return '<span class="counter-confirm">' +
        '<span class="counter-confirm-text">Löschen?</span>' +
        '<button type="button" class="btn-danger" data-action="confirm-delete" data-id="' + c.id + '">Ja</button>' +
        '<button type="button" class="btn-text-sm" data-action="cancel-delete">Nein</button>' +
      '</span>';
    }
    return '<button type="button" class="counter-remove" data-action="delete" data-id="' + c.id + '" aria-label="Entfernen">×</button>';
  }

  function itemTemplate(c, i, now){
    const target = new Date(c.target);
    const pct = counterProgress(now, c);
    const color = colorOf(c);
    return '<div class="counter-item" data-id="' + c.id + '" data-action="edit" tabindex="0">' +
      '<div class="counter-head">' +
        '<span class="counter-title">' + escapeHtml(c.title) +
          (REPEAT_LABELS[c.repeat] ? '<span class="counter-repeat">↻ ' + REPEAT_LABELS[c.repeat] + '</span>' : '') +
        '</span>' +
        removeControl(c) +
      '</div>' +
      '<div class="counter-remaining">' + formatRemaining(now, target) + '</div>' +
      '<div class="counter-bar-track"><div class="counter-bar-fill' + (pct >= 100 ? ' done' : '') + '" style="width:' + pct + '%;background:' + color + ';color:' + color + '"></div></div>' +
    '</div>';
  }

  function editTemplate(c){
    const target = new Date(c.target);
    const parts = toLocalInputValue(target).split('T');
    return '<form class="counter-item-edit" data-edit-form data-id="' + c.id + '">' +
      '<div class="counter-head">' +
        '<input type="text" class="counter-input" data-field="title" value="' + escapeHtml(c.title) + '" maxlength="28" required>' +
        removeControl(c) +
      '</div>' +
      '<div class="counter-form-row">' +
        '<label class="counter-field"><span>Datum</span><input type="date" class="counter-input" data-field="date" value="' + parts[0] + '" required></label>' +
        '<label class="counter-field"><span>Uhrzeit</span><input type="time" class="counter-input" data-field="time" value="' + parts[1] + '" required></label>' +
        repeatSelect(c.repeat || 'none') +
      '</div>' +
      '<div class="counter-hint" data-hint role="status" hidden></div>' +
      '<div class="counter-edit-actions">' +
        '<button type="button" class="btn-text" data-action="cancel-edit">Abbrechen</button>' +
        '<button type="submit" class="btn-ok">OK</button>' +
      '</div>' +
    '</form>';
  }

  function renderList(){
    const list = document.querySelector('[data-list]');
    const now = new Date();
    const sorted = sortedCounters(now);
    renderedKey = sorted.map(function(c){ return c.id; }).join(',');
    list.innerHTML = sorted.map(function(c, i){
      return c.id === editingId ? editTemplate(c) : itemTemplate(c, i, now);
    }).join('');
    const editForm = list.querySelector('[data-edit-form]');
    if(editForm) updatePastHint(editForm);
  }

  function renderToggleArea(){
    const area = document.querySelector('[data-toggle-area]');
    if(formOpen){
      area.innerHTML =
        '<form class="counter-form" data-form>' +
          '<input type="text" class="counter-input" data-field="title" placeholder="Titel" maxlength="28" required>' +
          '<div class="counter-form-row">' +
            '<label class="counter-field"><span>Datum</span><input type="date" class="counter-input" data-field="date" required></label>' +
            '<label class="counter-field"><span>Uhrzeit</span><input type="time" class="counter-input" data-field="time" value="00:00" required></label>' +
            repeatSelect('none') +
          '</div>' +
          '<div class="counter-hint" data-hint role="status" hidden></div>' +
          '<div class="counter-note">Hinweis: Die Counter werden nur in diesem Browser gespeichert, nicht auf einem Server. Sichere sie regelmäßig über das Zahnrad unten rechts (Exportieren).</div>' +
          '<div class="counter-edit-actions">' +
            '<button type="button" class="btn-text" data-action="cancel-form">Abbrechen</button>' +
            '<button type="submit" class="btn-ok">OK</button>' +
          '</div>' +
        '</form>';
      const titleInput = area.querySelector('[data-field="title"]');
      if(titleInput) titleInput.focus();
    } else {
      area.innerHTML = '<button type="button" class="counter-toggle" data-action="open-form">+ Counter</button>';
    }
  }

  function updateLiveCounterValues(){
    const now = new Date();
    if(editingId === null){
      const key = sortedCounters(now).map(function(c){ return c.id; }).join(',');
      if(key !== renderedKey){ renderList(); return; }
    }
    counters.forEach(function(c){
      if(c.id === editingId) return;
      const el = document.querySelector('.counter-item[data-id="' + c.id + '"]');
      if(!el) return;
      el.querySelector('.counter-remaining').textContent = formatRemaining(now, new Date(c.target));
      const fill = el.querySelector('.counter-bar-fill');
      const pct = counterProgress(now, c);
      fill.style.width = pct + '%';
      fill.classList.toggle('done', pct >= 100);
    });
  }

  const countersEl = document.querySelector('.counters');

  countersEl.addEventListener('click', function(e){
    const actionEl = e.target.closest('[data-action]');
    if(!actionEl) return;
    const action = actionEl.dataset.action;

    if(action === 'open-form'){
      formOpen = true;
      renderToggleArea();
    } else if(action === 'cancel-form'){
      formOpen = false;
      renderToggleArea();
    } else if(action === 'delete'){
      confirmingId = actionEl.dataset.id;
      renderList();
    } else if(action === 'cancel-delete'){
      confirmingId = null;
      renderList();
    } else if(action === 'confirm-delete'){
      const id = actionEl.dataset.id;
      counters = counters.filter(function(c){ return c.id !== id; });
      if(editingId === id) editingId = null;
      confirmingId = null;
      persistCounters();
      renderList();
    } else if(action === 'cancel-edit'){
      editingId = null;
      renderList();
    } else if(action === 'edit'){
      editingId = actionEl.dataset.id;
      renderList();
      const titleInput = document.querySelector('.counter-item-edit [data-field="title"]');
      if(titleInput) titleInput.focus();
    }
  });

  countersEl.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const actionEl = e.target.closest('[data-action="edit"]');
    if(!actionEl) return;
    e.preventDefault();
    editingId = actionEl.dataset.id;
    renderList();
    const titleInput = document.querySelector('.counter-item-edit [data-field="title"]');
    if(titleInput) titleInput.focus();
  });

  countersEl.addEventListener('submit', function(e){
    e.preventDefault();
    if(e.target.matches('[data-form]')){
      const title = e.target.querySelector('[data-field="title"]').value.trim();
      const targetVal = readTarget(e.target);
      if(!title || !targetVal) return;
      const repeat = e.target.querySelector('[data-field="repeat"]').value;
      const targetIso = new Date(targetVal).toISOString();
      const entry = {
        id: newId(),
        title: title,
        target: targetIso,
        created: new Date().toISOString(),
        repeat: REPEAT_VALUES.indexOf(repeat) >= 0 ? repeat : 'none',
        color: pickColor(counters)
      };
      if(entry.repeat !== 'none') entry.anchor = targetIso;
      counters.push(entry);
      formOpen = false;
      persistCounters();
      renderList();
      renderToggleArea();
    } else if(e.target.matches('[data-edit-form]')){
      const id = e.target.dataset.id;
      const title = e.target.querySelector('[data-field="title"]').value.trim();
      const targetVal = readTarget(e.target);
      if(!title || !targetVal) return;
      const c = counters.find(function(cc){ return cc.id === id; });
      if(c){
        const repeatVal = e.target.querySelector('[data-field="repeat"]').value;
        const repeat = REPEAT_VALUES.indexOf(repeatVal) >= 0 ? repeatVal : 'none';
        const newTarget = new Date(targetVal).toISOString();
        c.title = title;
        if(newTarget !== c.target){
          c.target = newTarget;
          if(repeat !== 'none') c.anchor = newTarget;
        }
        c.repeat = repeat;
        if(repeat === 'none') delete c.anchor;
        else if(!c.anchor) c.anchor = c.target;
        advanceRecurring(new Date());
      }
      editingId = null;
      persistCounters();
      renderList();
    }
  });

  function onFormChange(e){
    const form = e.target.closest('[data-form], [data-edit-form]');
    if(form) updatePastHint(form);
  }
  countersEl.addEventListener('input', onFormChange);
  countersEl.addEventListener('change', onFormChange);

  /* ---------- Export / Import / Backup-Erinnerung ---------- */
  const EXPORT_KEY = 'time-rings:last-export';
  const BACKUP_DAYS = 14;

  function newId(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function getLastExport(){
    try{
      const v = localStorage.getItem(EXPORT_KEY);
      if(!v) return null;
      const d = new Date(v);
      return isNaN(d) ? null : d;
    } catch(e){ return null; }
  }

  function daysSince(d){
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  }

  function relDays(n){
    return n === 0 ? 'heute' : (n === 1 ? 'vor 1 Tag' : 'vor ' + n + ' Tagen');
  }

  function backupInfo(){
    const le = getLastExport();
    if(le) return { exported: true, days: daysSince(le) };
    const times = counters.map(function(c){ return new Date(c.created).getTime(); }).filter(function(n){ return isFinite(n); });
    if(!times.length) return null;
    return { exported: false, days: daysSince(new Date(Math.min.apply(null, times))) };
  }

  function setText(el, text){
    if(el.textContent !== text) el.textContent = text;
  }

  function updateBackupHint(){
    const info = backupInfo();
    const status = document.getElementById('backup-status');
    const pill = document.getElementById('backup-pill');
    const pillText = document.getElementById('backup-pill-text');
    if(!info){
      setText(status, 'Noch keine Counter vorhanden.');
      pill.hidden = true;
      return;
    }
    const text = info.exported ? 'Letzter Export: ' + relDays(info.days) : 'Noch nie exportiert';
    setText(status, text);
    const due = info.days > BACKUP_DAYS;
    pill.hidden = !due;
    if(due) setText(pillText, 'Backup fällig · ' + text.charAt(0).toLowerCase() + text.slice(1));
  }

  function setMsg(text, isError){
    const el = document.getElementById('settings-msg');
    el.textContent = text;
    el.classList.toggle('error', !!isError);
  }

  function exportCounters(){
    const data = {
      app: 'zeitringe',
      version: 2,
      exported: new Date().toISOString(),
      counters: counters
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zeitringe-counter-' + toLocalInputValue(new Date()).slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    try{ localStorage.setItem(EXPORT_KEY, new Date().toISOString()); } catch(e){}
    updateBackupHint();
    setMsg(counters.length + ' Counter exportiert.', false);
  }

  function sanitizeImported(raw){
    const list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.counters) ? raw.counters : null);
    if(!list) return null;
    const out = [];
    const seen = {};
    list.forEach(function(c){
      if(!c || typeof c.title !== 'string') return;
      const target = new Date(c.target);
      if(isNaN(target)) return;
      let created = new Date(c.created);
      if(isNaN(created)) created = new Date();
      let id = (typeof c.id === 'string' && /^[a-z0-9]{1,40}$/i.test(c.id)) ? c.id : newId();
      if(seen[id]) id = newId();
      seen[id] = true;
      const repeat = REPEAT_VALUES.indexOf(c.repeat) >= 0 ? c.repeat : 'none';
      const entry = {
        id: id,
        title: c.title.trim().slice(0, 28) || 'Counter',
        target: target.toISOString(),
        created: created.toISOString(),
        repeat: repeat
      };
      if(repeat !== 'none'){
        const anchor = new Date(c.anchor);
        entry.anchor = isNaN(anchor) ? entry.target : anchor.toISOString();
      }
      if(typeof c.color === 'number' && c.color >= 0 && c.color < COUNTER_COLORS.length && Math.floor(c.color) === c.color){
        entry.color = c.color;
      }
      out.push(entry);
    });
    out.forEach(function(entry){
      if(typeof entry.color !== 'number') entry.color = pickColor(out);
    });
    return out;
  }

  let pendingImport = null;
  let pendingExported = null;

  function adoptExportDate(d){
    if(!d) return;
    const le = getLastExport();
    if(le && d <= le) return;
    try{ localStorage.setItem(EXPORT_KEY, d.toISOString()); } catch(e){}
  }

  function closeImportChoice(){
    pendingImport = null;
    pendingExported = null;
    document.getElementById('import-choice').hidden = true;
  }

  function finishImport(){
    editingId = null;
    confirmingId = null;
    advanceRecurring(new Date());
    persistCounters();
    renderList();
    updateBackupHint();
    closeImportChoice();
  }

  function handleImportFile(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onerror = function(){ setMsg('Datei konnte nicht gelesen werden.', true); };
    reader.onload = function(){
      let parsed;
      try{ parsed = JSON.parse(reader.result); }
      catch(e){ setMsg('Ungültige Datei: kein gültiges JSON.', true); return; }
      const list = sanitizeImported(parsed);
      if(!list || !list.length){
        closeImportChoice();
        setMsg('Keine gültigen Counter in der Datei gefunden.', true);
        return;
      }
      let fileExported = null;
      if(parsed && typeof parsed.exported === 'string'){
        const d = new Date(parsed.exported);
        if(!isNaN(d)) fileExported = d;
      }
      if(counters.length === 0){
        counters = list;
        adoptExportDate(fileExported);
        finishImport();
        setMsg(list.length + ' Counter importiert.', false);
        return;
      }
      pendingImport = list;
      pendingExported = fileExported;
      document.getElementById('import-choice-text').textContent =
        list.length + ' Counter in der Datei. Bestehende ersetzen oder ergänzen?';
      document.getElementById('import-choice').hidden = false;
      setMsg('', false);
    };
    reader.readAsText(file);
  }

  const gearBtn = document.getElementById('gear-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const importFile = document.getElementById('import-file');

  function setPanel(open){
    settingsPanel.hidden = !open;
    gearBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if(!open){ closeImportChoice(); setMsg('', false); }
    else updateBackupHint();
  }

  gearBtn.addEventListener('click', function(){ setPanel(settingsPanel.hidden); });
  document.getElementById('backup-pill').addEventListener('click', function(){ setPanel(true); });

  document.addEventListener('click', function(e){
    if(!settingsPanel.hidden && !e.target.closest('#settings')) setPanel(false);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !settingsPanel.hidden){ setPanel(false); gearBtn.focus(); }
  });

  document.getElementById('btn-export').addEventListener('click', exportCounters);
  document.getElementById('btn-import').addEventListener('click', function(){ importFile.click(); });
  importFile.addEventListener('change', function(){
    handleImportFile(importFile.files[0]);
    importFile.value = '';
  });

  document.getElementById('btn-import-replace').addEventListener('click', function(){
    if(!pendingImport) return;
    const n = pendingImport.length;
    counters = pendingImport;
    adoptExportDate(pendingExported);
    finishImport();
    setMsg(n + ' Counter importiert (ersetzt).', false);
  });

  document.getElementById('btn-import-merge').addEventListener('click', function(){
    if(!pendingImport) return;
    const existing = {};
    counters.forEach(function(c){ existing[c.id] = true; });
    let added = 0;
    pendingImport.forEach(function(c){
      if(existing[c.id]) return;
      counters.push(c);
      added++;
    });
    const skipped = pendingImport.length - added;
    finishImport();
    setMsg(added + ' hinzugefügt' + (skipped ? ', ' + skipped + ' bereits vorhanden' : '') + '.', false);
  });

  document.getElementById('btn-import-cancel').addEventListener('click', closeImportChoice);

  renderList();
  renderToggleArea();

  function tick(){
    const now = new Date();

    const secFrac  = (now.getSeconds()) / 60;
    const minFrac  = (now.getMinutes() * 60 + now.getSeconds()) / 3600;
    const hourFrac = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
    const dim      = daysInMonth(now.getFullYear(), now.getMonth());
    const dayFrac  = ((now.getDate() - 1) + hourFrac) / dim;
    const yearFrac = dayOfYearFraction(now);

    setRing('sek', secFrac);
    setRing('min', minFrac);
    setRing('std', hourFrac);
    setRing('tag', dayFrac);
    setRing('jahr', yearFrac);

    document.getElementById('clock').textContent =
      pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

    document.getElementById('date').textContent =
      now.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    document.getElementById('v-sek').textContent   = now.getSeconds() + '/60';
    document.getElementById('v-min').textContent   = now.getMinutes() + '/60';
    document.getElementById('v-std').textContent   = now.getHours() + '/24';
    document.getElementById('v-tag').textContent   = now.getDate() + '/' + dim;
    document.getElementById('v-jahr').textContent  = Math.round(yearFrac * 100) + '%';

    if(advanceRecurring(now)) persistCounters();
    updateLiveCounterValues();
    updateBackupHint();
    updateTabTitle(now);
  }

  tick();
  setInterval(tick, 1000);

// ─────────────────────────────────────────────
//  Employee Journey — CI&T
//  Radar Chatbot · Internal Communication
//  Code.gs — routing + data functions
// ─────────────────────────────────────────────

// ── After running createRoadmapSheet(), paste the spreadsheet ID here: ──
const ROADMAP_SHEET_ID = '';

// ── ROUTING ──────────────────────────────────────────────────────────────

function doGet(e) {
  const page = (e.parameter && e.parameter.page) || 'discovery';
  const lang = (e.parameter && e.parameter.lang) || 'pt';

  const pageMap = {
    'discovery': 'Discovery',
    'roadmap':   'Roadmap',
    'fases':     'Fases'
  };

  const templateName = pageMap[page] || 'Discovery';

  try {
    const template = HtmlService.createTemplateFromFile(templateName);
    template.lang        = lang;
    template.currentPage = page;
    try { template.serviceUrl = ScriptApp.getService().getUrl(); } catch(e) { template.serviceUrl = ''; }

    return template.evaluate()
      .setTitle('Employee Journey — CI&T')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    const fallback = HtmlService.createTemplateFromFile('Discovery');
    fallback.lang        = lang;
    fallback.currentPage = 'discovery';
    try { fallback.serviceUrl = ScriptApp.getService().getUrl(); } catch(e) { fallback.serviceUrl = ''; }

    return fallback.evaluate()
      .setTitle('Employee Journey — CI&T')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// Helper — include a shared HTML partial
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ── ROADMAP DATA ──────────────────────────────────────────────────────────

/**
 * Called from Roadmap.html via google.script.run.getRoadmapData()
 * Reads the Roadmap and Config sheets and returns structured data.
 */
function getRoadmapData() {
  if (!ROADMAP_SHEET_ID) {
    throw new Error('ROADMAP_SHEET_ID not configured. Run createRoadmapSheet() first, then paste the ID into Code.gs.');
  }

  const ss = SpreadsheetApp.openById(ROADMAP_SHEET_ID);

  // ── Product launch date from Config ──
  let launchDate = null;
  try {
    const cfg = ss.getSheetByName('Config');
    if (cfg) {
      const val = cfg.getRange('B2').getValue();
      if (val) launchDate = _fmtDate(val);
    }
  } catch (e) { /* no config sheet — skip */ }

  // ── Roadmap rows ──
  const sheet = ss.getSheetByName('Roadmap');
  if (!sheet) throw new Error('Sheet "Roadmap" not found.');

  const raw  = sheet.getDataRange().getValues();
  const hdrs = raw[0];
  const col  = {};
  hdrs.forEach((h, i) => { col[String(h).trim()] = i; });

  const phases = [];
  let cur = null;

  for (let i = 1; i < raw.length; i++) {
    const r    = raw[i];
    const type = String(r[col['type']] || '').trim().toUpperCase();
    if (!type) continue;

    if (type === 'PHASE') {
      cur = {
        id:     r[col['phase_id']],
        name:   r[col['phase_name']],
        status: String(r[col['phase_status']] || '').trim(),
        tasks:  []
      };
      phases.push(cur);

    } else if ((type === 'TASK' || type === 'MILESTONE') && cur) {
      const isMilestone = String(r[col['is_milestone']] || '').toUpperCase() === 'TRUE' || r[col['is_milestone']] === true;
      cur.tasks.push({
        name:        String(r[col['task_name']] || '').trim(),
        isMilestone: isMilestone,
        status:      String(r[col['phase_status']] || '').trim(),
        startDate:   r[col['start_date']] ? _fmtDate(r[col['start_date']]) : null,
        endDate:     r[col['end_date']]   ? _fmtDate(r[col['end_date']])   : null
      });
    }
  }

  return { launchDate, phases };
}

/** Normalises a date value from Sheets to ISO yyyy-mm-dd string */
function _fmtDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const s = String(val).trim();
  // dd/mm/yyyy → yyyy-mm-dd
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return s;
}

// ── SETUP: create spreadsheet ─────────────────────────────────────────────

/**
 * Run this ONCE from the Apps Script editor (▶ Run → createRoadmapSheet).
 * It creates the spreadsheet, logs the ID, and returns it.
 * After running, copy the ID into ROADMAP_SHEET_ID above.
 */
function createRoadmapSheet() {
  const ss = SpreadsheetApp.create('Employee Journey — Roadmap Data');

  // ── Config sheet ──
  const cfg = ss.getActiveSheet();
  cfg.setName('Config');
  cfg.getRange('A1:B1').setValues([['key', 'value']]).setFontWeight('bold').setBackground('#EEF0F3');
  cfg.getRange('A2').setValue('product_launch_date');
  cfg.getRange('B2').setValue('');  // user fills this in
  cfg.getRange('A3').setValue('// Format: dd/mm/yyyy').setFontColor('#9A9EA6');
  cfg.setColumnWidth(1, 200);
  cfg.setColumnWidth(2, 200);

  // ── Roadmap sheet ──
  const rm   = ss.insertSheet('Roadmap');
  const hdrs = ['type', 'phase_id', 'phase_name', 'phase_status', 'task_name', 'start_date', 'end_date', 'is_milestone'];
  rm.getRange(1, 1, 1, hdrs.length).setValues([hdrs]).setFontWeight('bold').setBackground('#EEF0F3');

  const data = [
    // Phase 1
    ['PHASE',     1, 'Phase 1 — Foundation',  'IN PROGRESS',   '',                                    '',            '',            'FALSE'],
    ['TASK',      1, '',                       '',              'Employee journey mapping',             '01/07/2026',  '31/07/2026',  'FALSE'],
    ['TASK',      1, '',                       '',              'Scope alignment with stakeholders',    '10/07/2026',  '25/07/2026',  'FALSE'],
    ['TASK',      1, '',                       '',              'PMO governance charter',               '15/07/2026',  '25/07/2026',  'FALSE'],
    ['MILESTONE', 1, '',                       '',              'Official project kickoff',             '31/07/2026',  '',            'TRUE'],
    // Phase 2
    ['PHASE',     2, 'Phase 2 — Expansion',   'PLANNED',       '',                                    '',            '',            'FALSE'],
    ['TASK',      2, '',                       '',              'Onboarding flows in chatbot',          '01/09/2026',  '07/10/2026',  'FALSE'],
    ['TASK',      2, '',                       '',              'Benefits & FAQ flows',                 '15/09/2026',  '07/10/2026',  'FALSE'],
    ['TASK',      2, '',                       '',              'Communication plan — Phase 2',         '01/09/2026',  '21/09/2026',  'FALSE'],
    ['MILESTONE', 2, '',                       '',              'Phase 2 launch',                       '07/10/2026',  '',            'TRUE'],
    // Phase 3
    ['PHASE',     3, 'Phase 3 — Depth',       'PLANNED',       '',                                    '',            '',            'FALSE'],
    ['TASK',      3, '',                       '',              'System integrations (PTO, payroll)',   '18/10/2026',  '23/11/2026',  'FALSE'],
    ['TASK',      3, '',                       '',              'Career & development flows',           '18/10/2026',  '23/11/2026',  'FALSE'],
    ['MILESTONE', 3, '',                       '',              'Phase 3 launch',                       '23/11/2026',  '',            'TRUE'],
    // Phase 4
    ['PHASE',     4, 'Phase 4 — Sensitive',   'TO BE DEFINED', '',                                    '',            '',            'FALSE'],
    ['TASK',      4, '',                       '',              'Sensitive flow mapping',               '',            '',            'FALSE'],
    ['TASK',      4, '',                       '',              'Legal & compliance validation',        '',            '',            'FALSE'],
    ['MILESTONE', 4, '',                       '',              'Phase 4 launch',                       '',            '',            'TRUE'],
  ];

  rm.getRange(2, 1, data.length, hdrs.length).setValues(data);

  // Column widths
  const widths = [120, 80, 220, 150, 260, 120, 120, 110];
  widths.forEach((w, i) => rm.setColumnWidth(i + 1, w));

  // Freeze header row
  rm.setFrozenRows(1);

  const id  = ss.getId();
  const url = ss.getUrl();

  Logger.log('');
  Logger.log('✅ Spreadsheet created!');
  Logger.log('URL: ' + url);
  Logger.log('');
  Logger.log('→ Copy this ID into ROADMAP_SHEET_ID in Code.gs:');
  Logger.log(id);

  return id;
}

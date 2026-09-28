// ─────────────────────────────────────────────
//  Employee Journey — CI&T
//  Radar Chatbot · Internal Communication
//  Code.gs — main routing file
// ─────────────────────────────────────────────

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

    return template.evaluate()
      .setTitle('Employee Journey — CI&T')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    // Page not found — fallback to Discovery
    const fallback = HtmlService.createTemplateFromFile('Discovery');
    fallback.lang        = lang;
    fallback.currentPage = 'discovery';

    return fallback.evaluate()
      .setTitle('Employee Journey — CI&T')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// Helper — include a shared HTML partial (use in templates with <?!= include('Filename') ?>)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

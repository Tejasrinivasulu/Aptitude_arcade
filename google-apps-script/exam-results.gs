/**
 * Google Apps Script — deploy as Web App (Execute as: Me, Access: Anyone)
 * Paste into script.google.com → New project → Deploy → Web app
 * Copy URL into .env as VITE_GOOGLE_SHEET_URL
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Submitted At',
        'Full Name',
        'Email',
        'Roll Number',
        'Test Key',
        'Title',
        'Topic',
        'Score',
        'Total',
        'Percentage',
        'Performance',
        'Submit Reason',
        'Tab Violations',
        'Face Warnings',
        'Auto Submit',
      ]);
    }

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.fullName || '',
      data.email || '',
      data.rollNumber || '',
      data.testKey || '',
      data.title || '',
      data.topic || '',
      data.score ?? '',
      data.total ?? '',
      data.percentage ?? '',
      data.performance || '',
      data.submitReason || '',
      data.tabViolations ?? 0,
      data.faceWarnings ?? 0,
      data.autoSubmit ? 'Yes' : 'No',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Aptitude Arcade Exam Results endpoint is active.');
}

// ============================================
// Google Apps Script — Big Era 4 Email Backend
// Handles BOTH Lesson 1 and Lesson 2 submissions
// ============================================
//
// SETUP INSTRUCTIONS (see SETUP_INSTRUCTIONS.md for step-by-step):
// 1. Go to https://script.google.com while logged into paul.strootman@gmail.com
// 2. Create a new project (or open the existing one)
// 3. Paste this entire code into the editor
// 4. Click Deploy > New deployment > Web app
// 5. Set "Execute as: Me" and "Who has access: Anyone"
// 6. Copy the deployment URL
// 7. Replace GOOGLE_APPS_SCRIPT_URL in BOTH index.html files with that URL
//

// Teacher email mapping — students never see these addresses
var TEACHER_EMAILS = {
  "Ms. Singh": "psingh@asdubai.org",
  "Mr. Ghassan": "ggammoh@asdubai.org",
  "Mr. Ghammoh": "ggammoh@asdubai.org",
  "Ms. Dourley": "cdourley@asdubai.org",
  "Mr. Strootman": "pstrootman@asdubai.org"
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var studentName = data.studentName || "Unknown Student";
    // Lesson 1 sends "teacherName", Lesson 2 sends "teacher"
    var teacherName = data.teacherName || data.teacher || "Unknown Teacher";
    var section = data.section || "Unknown Section";
    var lessonName = data.lessonName || "Big Era 4";

    // Lesson 1 nests inside "responses", Lesson 2 puts levels at top level
    var responses = data.responses || {
      level1: data.level1,
      level2: data.level2,
      level3: data.level3,
      level4: data.level4
    };

    // Get teacher email
    var teacherEmail = TEACHER_EMAILS[teacherName];
    if (!teacherEmail) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Unknown teacher: " + teacherName }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Build email subject: Section — Student Name — Teacher Name — Lesson
    var subject = section + " — " + studentName + " — " + teacherName + " — " + lessonName;

    // Detect which lesson and build the appropriate email
    var htmlBody, plainBody;
    if (lessonName.indexOf("Lesson 2") !== -1) {
      htmlBody = buildLesson2HTML(studentName, teacherName, section, lessonName, responses);
    } else {
      htmlBody = buildLesson1HTML(studentName, teacherName, section, lessonName, responses);
    }
    plainBody = buildEmailPlain(studentName, teacherName, section, lessonName, responses);

    // Send email to teacher's school address
    GmailApp.sendEmail(teacherEmail, subject, plainBody, {
      htmlBody: htmlBody,
      name: "Big Era 4 - Student Submission",
      replyTo: "noreply@example.com"
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Work submitted successfully!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Big Era 4 email backend is running." }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ===========================
// Shared Email Styles
// ===========================
function getEmailStyles() {
  var css = '';
  css += 'body { font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }';
  css += 'h1 { color: #1a3a5c; border-bottom: 3px solid #c8a951; padding-bottom: 10px; }';
  css += 'h2 { color: #1a3a5c; margin-top: 30px; }';
  css += 'h3 { color: #4a3728; margin-top: 20px; }';
  css += '.header-info { background: #f5f0e1; padding: 15px; border-radius: 8px; margin-bottom: 20px; }';
  css += '.header-info p { margin: 5px 0; }';
  css += '.level-section { border-left: 4px solid #ccc; padding-left: 15px; margin: 20px 0; }';
  css += '.level-1 { border-color: #cd7f32; }';
  css += '.level-2 { border-color: #8a9ea7; }';
  css += '.level-3 { border-color: #c8a951; }';
  css += '.level-4 { border-color: #1a3a5c; }';
  css += '.activity { background: #fafafa; padding: 12px; border-radius: 6px; margin: 10px 0; }';
  css += '.score { font-weight: bold; color: #2a7d2a; }';
  css += '.response-text { background: #fff; border: 1px solid #ddd; padding: 10px; border-radius: 4px; margin: 5px 0; white-space: pre-wrap; }';
  css += '.label { font-weight: bold; color: #555; }';
  return css;
}

function buildEmailHeader(studentName, teacherName, section, lessonName, lessonTitle) {
  var html = '';
  html += '<!DOCTYPE html><html><head><style>' + getEmailStyles() + '</style></head><body>';
  html += '<h1>' + escapeHtml(lessonTitle) + '</h1>';
  html += '<div class="header-info">';
  html += '<p><strong>Student:</strong> ' + escapeHtml(studentName) + '</p>';
  html += '<p><strong>Teacher:</strong> ' + escapeHtml(teacherName) + '</p>';
  html += '<p><strong>Section:</strong> ' + escapeHtml(section) + '</p>';
  html += '<p><strong>Lesson:</strong> ' + escapeHtml(lessonName) + '</p>';
  html += '<p><strong>Submitted:</strong> ' + new Date().toLocaleString("en-US", {timeZone: "Asia/Dubai"}) + ' (Dubai Time)</p>';
  html += '</div>';
  return html;
}

function buildEmailFooter() {
  return '<hr><p style="color:#999; font-size:12px;">This submission was generated automatically from the Big Era 4 interactive lesson page.</p></body></html>';
}


// ===========================
// LESSON 1 — HTML Email Builder
// ===========================
function buildLesson1HTML(studentName, teacherName, section, lessonName, responses) {
  var html = buildEmailHeader(studentName, teacherName, section, lessonName, 'Big Era 4 — Lesson 1: Student Submission');

  // Level 1
  html += '<div class="level-section level-1">';
  html += '<h2>Level 1: Knowledge Recall</h2>';

  if (responses.level1) {
    var l1 = responses.level1;

    html += '<div class="activity">';
    html += '<h3>1.1 Vocabulary Matching</h3>';
    if (l1.vocabMatching) {
      html += '<p class="score">Score: ' + (l1.vocabMatching.score || 'Not completed') + '</p>';
      if (l1.vocabMatching.matches) {
        html += '<ul>';
        for (var term in l1.vocabMatching.matches) {
          html += '<li><strong>' + escapeHtml(term) + '</strong> → ' + escapeHtml(l1.vocabMatching.matches[term]) + '</li>';
        }
        html += '</ul>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>1.2 Timeline Sorting</h3>';
    if (l1.timelineSorting) {
      html += '<p class="score">Score: ' + (l1.timelineSorting.score || 'Not completed') + '</p>';
      if (l1.timelineSorting.order) {
        html += '<ol>';
        for (var i = 0; i < l1.timelineSorting.order.length; i++) {
          html += '<li>' + escapeHtml(l1.timelineSorting.order[i]) + '</li>';
        }
        html += '</ol>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>1.3 Population Fill-in-the-Blank</h3>';
    if (l1.fillInBlank) {
      html += '<p class="score">Score: ' + (l1.fillInBlank.score || 'Not completed') + '</p>';
      if (l1.fillInBlank.answers) {
        html += '<ul>';
        for (var j = 0; j < l1.fillInBlank.answers.length; j++) {
          html += '<li>' + escapeHtml(l1.fillInBlank.answers[j]) + '</li>';
        }
        html += '</ul>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>1.4 Empire-City Matching</h3>';
    if (l1.cityMatching) {
      html += '<p class="score">Score: ' + (l1.cityMatching.score || 'Not completed') + '</p>';
      if (l1.cityMatching.matches) {
        html += '<ul>';
        for (var city in l1.cityMatching.matches) {
          html += '<li><strong>' + escapeHtml(city) + '</strong> → ' + escapeHtml(l1.cityMatching.matches[city]) + '</li>';
        }
        html += '</ul>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';
  }
  html += '</div>';

  // Level 2
  html += '<div class="level-section level-2">';
  html += '<h2>Level 2: Explain & Apply</h2>';

  if (responses.level2) {
    var l2 = responses.level2;

    html += '<div class="activity">';
    html += '<h3>2.1 Cause-and-Effect Chain</h3>';
    if (l2.causeEffect) {
      html += '<p class="score">Score: ' + (l2.causeEffect.score || 'Not completed') + '</p>';
      if (l2.causeEffect.order) {
        html += '<ol>';
        for (var k = 0; k < l2.causeEffect.order.length; k++) {
          html += '<li>' + escapeHtml(l2.causeEffect.order[k]) + '</li>';
        }
        html += '</ol>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>2.2 Explain It — Written Responses</h3>';
    if (l2.explainIt) {
      for (var q = 0; q < l2.explainIt.length; q++) {
        var resp = l2.explainIt[q];
        html += '<div class="response-text">';
        html += '<p class="label">Prompt ' + (q + 1) + ':</p>';
        html += '<p>' + escapeHtml(resp.prompt || '') + '</p>';
        html += '<p class="label">Response (' + (resp.wordCount || 0) + ' words):</p>';
        html += '<p>' + escapeHtml(resp.response || 'No response') + '</p>';
        html += '</div>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>2.3 Trade Goods Categorization</h3>';
    if (l2.tradeGoods) {
      html += '<p class="score">Score: ' + (l2.tradeGoods.score || 'Not completed') + '</p>';
      if (l2.tradeGoods.categories) {
        for (var cat in l2.tradeGoods.categories) {
          html += '<p><strong>' + escapeHtml(cat) + ':</strong> ' + escapeHtml(l2.tradeGoods.categories[cat].join(', ')) + '</p>';
        }
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';
  }
  html += '</div>';

  // Level 3
  html += '<div class="level-section level-3">';
  html += '<h2>Level 3: Analyze with Evidence</h2>';

  if (responses.level3) {
    var l3 = responses.level3;

    html += '<div class="activity">';
    html += '<h3>3.1 Consequences Analysis</h3>';
    if (l3.consequences) {
      html += '<p class="score">Sorting Score: ' + (l3.consequences.score || 'Not completed') + '</p>';
      if (l3.consequences.positive) {
        html += '<p><strong>Positive:</strong> ' + escapeHtml(l3.consequences.positive.join(', ')) + '</p>';
      }
      if (l3.consequences.negative) {
        html += '<p><strong>Negative:</strong> ' + escapeHtml(l3.consequences.negative.join(', ')) + '</p>';
      }
      if (l3.consequences.positiveExplanation) {
        html += '<div class="response-text"><p class="label">Why positive consequences were beneficial:</p>';
        html += '<p>' + escapeHtml(l3.consequences.positiveExplanation) + '</p></div>';
      }
      if (l3.consequences.negativeExplanation) {
        html += '<div class="response-text"><p class="label">Why negative consequences were harmful:</p>';
        html += '<p>' + escapeHtml(l3.consequences.negativeExplanation) + '</p></div>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>3.2 Claim-Evidence-Reasoning</h3>';
    if (l3.cer) {
      html += '<div class="response-text"><p class="label">Claim:</p>';
      html += '<p>' + escapeHtml(l3.cer.claim || 'No response') + '</p></div>';
      html += '<div class="response-text"><p class="label">Evidence:</p>';
      html += '<p>' + escapeHtml(l3.cer.evidence || 'No response') + '</p></div>';
      html += '<div class="response-text"><p class="label">Reasoning:</p>';
      html += '<p>' + escapeHtml(l3.cer.reasoning || 'No response') + '</p></div>';
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

  }
  html += '</div>';

  // Level 4
  html += '<div class="level-section level-4">';
  html += '<h2>Level 4: Connect & Create</h2>';

  if (responses.level4) {
    var l4 = responses.level4;

    html += '<div class="activity">';
    html += '<h3>4.1 "Our Big Era" — Modern Parallel Essay</h3>';
    if (l4.modernEssay) {
      html += '<div class="response-text">';
      html += '<p class="label">Response (' + (l4.modernEssay.wordCount || 0) + ' words):</p>';
      html += '<p>' + escapeHtml(l4.modernEssay.response || 'No response') + '</p>';
      html += '</div>';
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>4.2 Synectics — "Big Era IV Is Like a ___"</h3>';
    if (l4.synectics && l4.synectics.length > 0) {
      for (var s = 0; s < l4.synectics.length; s++) {
        var syn = l4.synectics[s];
        html += '<div class="response-text">';
        html += '<p class="label">"Big Era IV is like a ' + escapeHtml(syn.object || '?') + ' because..."</p>';
        html += '<p>(' + (syn.wordCount || 0) + ' words): ' + escapeHtml(syn.response || 'No response') + '</p>';
        html += '</div>';
      }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';
  }
  html += '</div>';

  html += buildEmailFooter();
  return html;
}


// ===========================
// LESSON 2 — HTML Email Builder
// ===========================
function buildLesson2HTML(studentName, teacherName, section, lessonName, responses) {
  var html = buildEmailHeader(studentName, teacherName, section, lessonName, 'Big Era 4 — Lesson 2: The Hardware (Mechanics of the Silk Road)');

  // Level 1
  html += '<div class="level-section level-1">';
  html += '<h2>Level 1: Knowledge Recall</h2>';

  if (responses.level1) {
    var l1 = responses.level1;

    html += '<div class="activity">';
    html += '<h3>1.1 Vocabulary Matching</h3>';
    if (l1.vocabMatching && typeof l1.vocabMatching === 'object') {
      var vocabKeys = Object.keys(l1.vocabMatching);
      if (vocabKeys.length > 0) {
        html += '<p class="score">Matched: ' + vocabKeys.length + ' terms</p>';
        html += '<ul>';
        for (var v = 0; v < vocabKeys.length; v++) {
          html += '<li><strong>' + escapeHtml(vocabKeys[v]) + '</strong> → ' + escapeHtml(l1.vocabMatching[vocabKeys[v]]) + '</li>';
        }
        html += '</ul>';
      } else { html += '<p><em>Not completed</em></p>'; }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>1.2 Silk Road Geography Fill-in-the-Blank</h3>';
    if (l1.fillInBlanks && typeof l1.fillInBlanks === 'object') {
      var blankKeys = Object.keys(l1.fillInBlanks);
      if (blankKeys.length > 0) {
        html += '<p class="score">Answered: ' + blankKeys.length + ' of 6 blanks</p>';
        html += '<ol>';
        for (var b = 0; b < blankKeys.length; b++) {
          html += '<li>Blank ' + escapeHtml(blankKeys[b]) + ': <strong>' + escapeHtml(l1.fillInBlanks[blankKeys[b]]) + '</strong></li>';
        }
        html += '</ol>';
      } else { html += '<p><em>Not completed</em></p>'; }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';
  }
  html += '</div>';

  // Level 2
  html += '<div class="level-section level-2">';
  html += '<h2>Level 2: Explain & Apply</h2>';

  if (responses.level2) {
    var l2 = responses.level2;

    html += '<div class="activity">';
    html += '<h3>2.1 The Relay System Chain</h3>';
    if (l2.relayChain && l2.relayChain.length > 0) {
      html += '<p class="score">Steps placed: ' + l2.relayChain.length + ' of 6</p>';
      html += '<ol>';
      for (var r = 0; r < l2.relayChain.length; r++) {
        html += '<li>' + escapeHtml(l2.relayChain[r].content || l2.relayChain[r]) + '</li>';
      }
      html += '</ol>';
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';

    html += '<div class="activity">';
    html += '<h3>2.2 Explain It — Written Responses</h3>';
    if (l2.explainIt) {
      var ei = l2.explainIt;

      html += '<div class="response-text">';
      html += '<p class="label">Prompt 1: Why were animals so important for Silk Road trade?</p>';
      var p1text = ei.prompt1 || '';
      var p1words = p1text.trim().length > 0 ? p1text.trim().split(/\s+/).length : 0;
      html += '<p class="label">Response (' + p1words + ' words):</p>';
      html += '<p>' + escapeHtml(p1text || 'No response') + '</p>';
      html += '</div>';

      html += '<div class="response-text">';
      html += '<p class="label">Prompt 2: Why did the price of silk increase between China and Rome?</p>';
      var p2text = ei.prompt2 || '';
      var p2words = p2text.trim().length > 0 ? p2text.trim().split(/\s+/).length : 0;
      html += '<p class="label">Response (' + p2words + ' words):</p>';
      html += '<p>' + escapeHtml(p2text || 'No response') + '</p>';
      html += '</div>';
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';
  }
  html += '</div>';

  // Level 3
  html += '<div class="level-section level-3">';
  html += '<h2>Level 3: Analyze with Evidence</h2>';

  if (responses.level3) {
    var l3 = responses.level3;

    html += '<div class="activity">';
    html += '<h3>3.1 Claim-Evidence-Reasoning (CER)</h3>';
    html += '<p style="font-style:italic; color:#666; margin-bottom:10px;">Was the Silk Road a "long-distance trade route" or a "chain of short-distance trades"?</p>';
    if (l3.cer) {
      html += '<div class="response-text"><p class="label">Claim:</p>';
      html += '<p>' + escapeHtml(l3.cer.claim || 'No response') + '</p></div>';
      html += '<div class="response-text"><p class="label">Evidence:</p>';
      html += '<p>' + escapeHtml(l3.cer.evidence || 'No response') + '</p></div>';
      html += '<div class="response-text"><p class="label">Reasoning:</p>';
      html += '<p>' + escapeHtml(l3.cer.reasoning || 'No response') + '</p></div>';
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';
  }
  html += '</div>';

  // Level 4
  html += '<div class="level-section level-4">';
  html += '<h2>Level 4: Connect & Create</h2>';

  if (responses.level4) {
    var l4 = responses.level4;

    html += '<div class="activity">';
    html += '<h3>4.1 Synectics — "The Silk Road Is Like a ___"</h3>';
    if (l4.synectics && typeof l4.synectics === 'object') {
      var synKeys = Object.keys(l4.synectics);
      if (synKeys.length > 0) {
        for (var sk = 0; sk < synKeys.length; sk++) {
          var synObj = synKeys[sk];
          var synText = l4.synectics[synObj] || '';
          var synWords = synText.trim().length > 0 ? synText.trim().split(/\s+/).length : 0;
          html += '<div class="response-text">';
          html += '<p class="label">"The Silk Road is like ' + escapeHtml(synObj) + ' because..."</p>';
          html += '<p>(' + synWords + ' words): ' + escapeHtml(synText || 'No response') + '</p>';
          html += '</div>';
        }
      } else { html += '<p><em>Not completed</em></p>'; }
    } else { html += '<p><em>Not completed</em></p>'; }
    html += '</div>';
  }
  html += '</div>';

  html += buildEmailFooter();
  return html;
}


// ===========================
// Plain Text Email Builder (fallback — works for both lessons)
// ===========================
function buildEmailPlain(studentName, teacherName, section, lessonName, responses) {
  var text = '';
  text += 'BIG ERA 4 — ' + lessonName.toUpperCase() + ': STUDENT SUBMISSION\n';
  text += '==========================================\n\n';
  text += 'Student: ' + studentName + '\n';
  text += 'Teacher: ' + teacherName + '\n';
  text += 'Section: ' + section + '\n';
  text += 'Lesson: ' + lessonName + '\n';
  text += 'Submitted: ' + new Date().toLocaleString("en-US", {timeZone: "Asia/Dubai"}) + ' (Dubai Time)\n\n';
  text += JSON.stringify(responses, null, 2);
  return text;
}

function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

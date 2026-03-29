// Teacher email mapping
var TEACHER_EMAILS = {
  "Ms. Singh": "psingh@asdubai.org",
  "Mr. Ghassan": "ggammoh@asdubai.org",
  "Ms. Dourley": "cdourley@asdubai.org",
  "Mr. Strootman": "pstrootman@asdubai.org"
};

// Dubai timezone
var DUBAI_TIMEZONE = "Asia/Dubai";

/**
 * Handles GET requests - returns status OK
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "OK",
    message: "Big Era 4 Lesson 2 Script is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles POST requests with student submission data
 */
function doPost(e) {
  try {
    // Parse the JSON payload
    var data = JSON.parse(e.postData.contents);

    // Extract student and submission information
    var studentName = data.studentName || "Unknown Student";
    var teacherName = data.teacherName || "Unknown Teacher";
    var section = data.section || "Unknown Section";
    var lessonName = data.lessonName || "Big Era 4 — Lesson 2: The Hardware (The Mechanics of the Silk Road)";
    var responses = data.responses || {};

    // Get teacher email
    var teacherEmail = TEACHER_EMAILS[teacherName];
    if (!teacherEmail) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "ERROR",
        message: "Teacher email not found for: " + teacherName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Build email subject and content
    var subject = section + " — " + studentName + " — " + teacherName + " — Big Era 4 Lesson 2";
    var htmlBody = buildHtmlEmail(studentName, teacherName, section, lessonName, responses);
    var plainTextBody = buildPlainTextEmail(studentName, teacherName, section, lessonName, responses);

    // Send email
    MailApp.sendEmail({
      to: teacherEmail,
      subject: subject,
      htmlBody: htmlBody,
      textBody: plainTextBody
    });

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: "SUCCESS",
      message: "Email sent successfully to " + teacherEmail,
      studentName: studentName,
      teacherName: teacherName,
      section: section
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Builds the HTML email body
 */
function buildHtmlEmail(studentName, teacherName, section, lessonName, responses) {
  var timestamp = Utilities.formatDate(new Date(), DUBAI_TIMEZONE, "MMMM dd, yyyy 'at' hh:mm a z");

  var html = '<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">';

  // Header
  html += '<div style="background-color: #f5f0e1; padding: 20px; border-bottom: 3px solid #c8a951; margin-bottom: 20px;">';
  html += '<h1 style="color: #1a3a5c; margin: 0 0 10px 0; font-size: 24px;">Big Era 4 — Lesson 2: Student Submission</h1>';
  html += '<table style="width: 100%; margin-top: 10px;">';
  html += '<tr><td style="font-weight: bold; width: 150px;">Student Name:</td><td>' + escapeHtml(studentName) + '</td></tr>';
  html += '<tr><td style="font-weight: bold;">Section:</td><td>' + escapeHtml(section) + '</td></tr>';
  html += '<tr><td style="font-weight: bold;">Teacher:</td><td>' + escapeHtml(teacherName) + '</td></tr>';
  html += '<tr><td style="font-weight: bold;">Submitted:</td><td>' + timestamp + '</td></tr>';
  html += '</table>';
  html += '</div>';

  // Level 1 - Foundational Knowledge
  html += buildLevel1Section(responses.level1 || {});

  // Level 2 - Applied Knowledge
  html += buildLevel2Section(responses.level2 || {});

  // Level 3 - Extended Thinking
  html += buildLevel3Section(responses.level3 || {});

  // Level 4 - Synthesis
  html += buildLevel4Section(responses.level4 || {});

  // Footer
  html += '<div style="background-color: #f5f0e1; padding: 15px; border-top: 1px solid #c8a951; margin-top: 20px; text-align: center; font-size: 12px; color: #666;">';
  html += '<p style="margin: 0;">This submission was generated automatically from the Big Era 4 interactive lesson page.</p>';
  html += '</div>';

  html += '</body></html>';

  return html;
}

/**
 * Builds Level 1 section of the email
 */
function buildLevel1Section(level1Data) {
  var html = '<div style="margin-bottom: 20px; border-left: 5px solid #cd7f32; padding-left: 15px; padding-top: 10px; padding-bottom: 10px; padding-right: 15px; background-color: #fafaf8;">';
  html += '<h2 style="color: #1a3a5c; margin-top: 0; font-size: 18px;">Level 1: Foundational Knowledge</h2>';

  // Vocab Matching
  if (level1Data.vocabMatching) {
    html += '<div style="margin-bottom: 15px;">';
    html += '<h3 style="color: #cd7f32; font-size: 14px; margin-bottom: 8px;">Vocabulary Matching</h3>';
    html += '<div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">';
    html += '<span style="background-color: #2a7d2a; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold; font-size: 12px;">Score: ' + (level1Data.vocabMatching.score || 0) + '</span>';
    html += '</div>';
    html += '</div>';
  }

  // Fill in the Blank
  if (level1Data.fillInBlank) {
    html += '<div style="margin-bottom: 15px;">';
    html += '<h3 style="color: #cd7f32; font-size: 14px; margin-bottom: 8px;">Fill in the Blank</h3>';
    html += '<div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">';
    html += '<span style="background-color: #2a7d2a; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold; font-size: 12px;">Score: ' + (level1Data.fillInBlank.score || 0) + '</span>';
    if (level1Data.fillInBlank.answers && level1Data.fillInBlank.answers.length > 0) {
      html += '<div style="margin-top: 8px; font-size: 12px;">';
      for (var i = 0; i < level1Data.fillInBlank.answers.length; i++) {
        html += '<div style="margin-bottom: 4px;"><strong>Answer ' + (i + 1) + ':</strong> ' + escapeHtml(level1Data.fillInBlank.answers[i]) + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Builds Level 2 section of the email
 */
function buildLevel2Section(level2Data) {
  var html = '<div style="margin-bottom: 20px; border-left: 5px solid #8a9ea7; padding-left: 15px; padding-top: 10px; padding-bottom: 10px; padding-right: 15px; background-color: #fafaf8;">';
  html += '<h2 style="color: #1a3a5c; margin-top: 0; font-size: 18px;">Level 2: Applied Knowledge</h2>';

  // Relay Chain
  if (level2Data.relayChain) {
    html += '<div style="margin-bottom: 15px;">';
    html += '<h3 style="color: #8a9ea7; font-size: 14px; margin-bottom: 8px;">Relay Chain</h3>';
    html += '<div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">';
    html += '<span style="background-color: #2a7d2a; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold; font-size: 12px;">Score: ' + (level2Data.relayChain.score || 0) + '</span>';
    if (level2Data.relayChain.order && level2Data.relayChain.order.length > 0) {
      html += '<div style="margin-top: 8px; font-size: 12px;">';
      html += '<strong>Order:</strong>';
      html += '<ol style="margin: 4px 0; padding-left: 20px;">';
      for (var i = 0; i < level2Data.relayChain.order.length; i++) {
        html += '<li>' + escapeHtml(level2Data.relayChain.order[i]) + '</li>';
      }
      html += '</ol>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  // Explain It
  if (level2Data.explainIt && level2Data.explainIt.length > 0) {
    html += '<div style="margin-bottom: 15px;">';
    html += '<h3 style="color: #8a9ea7; font-size: 14px; margin-bottom: 8px;">Explain It</h3>';
    for (var i = 0; i < level2Data.explainIt.length; i++) {
      var item = level2Data.explainIt[i];
      html += '<div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">';
      html += '<div style="font-weight: bold; color: #1a3a5c; margin-bottom: 6px; font-size: 12px;">Prompt: ' + escapeHtml(item.prompt || '') + '</div>';
      html += '<div style="background-color: #f9f9f9; padding: 8px; border: 1px solid #e0e0e0; border-radius: 3px; margin-bottom: 6px; font-size: 12px; line-height: 1.5;">' + escapeHtml(item.response || '') + '</div>';
      if (item.wordCount) {
        html += '<div style="font-size: 11px; color: #666;">Word count: ' + item.wordCount + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Builds Level 3 section of the email
 */
function buildLevel3Section(level3Data) {
  var html = '<div style="margin-bottom: 20px; border-left: 5px solid #c8a951; padding-left: 15px; padding-top: 10px; padding-bottom: 10px; padding-right: 15px; background-color: #fafaf8;">';
  html += '<h2 style="color: #1a3a5c; margin-top: 0; font-size: 18px;">Level 3: Extended Thinking</h2>';

  // CER (Claim, Evidence, Reasoning)
  if (level3Data.cer) {
    html += '<div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">';
    html += '<h3 style="color: #c8a951; font-size: 13px; margin-top: 0;">Claim, Evidence, Reasoning</h3>';

    if (level3Data.cer.claim) {
      html += '<div style="margin-bottom: 10px;">';
      html += '<div style="font-weight: bold; color: #1a3a5c; font-size: 12px; margin-bottom: 4px;">Claim:</div>';
      html += '<div style="background-color: #f9f9f9; padding: 8px; border: 1px solid #e0e0e0; border-radius: 3px; font-size: 12px; line-height: 1.5;">' + escapeHtml(level3Data.cer.claim) + '</div>';
      html += '</div>';
    }

    if (level3Data.cer.evidence) {
      html += '<div style="margin-bottom: 10px;">';
      html += '<div style="font-weight: bold; color: #1a3a5c; font-size: 12px; margin-bottom: 4px;">Evidence:</div>';
      html += '<div style="background-color: #f9f9f9; padding: 8px; border: 1px solid #e0e0e0; border-radius: 3px; font-size: 12px; line-height: 1.5;">' + escapeHtml(level3Data.cer.evidence) + '</div>';
      html += '</div>';
    }

    if (level3Data.cer.reasoning) {
      html += '<div style="margin-bottom: 10px;">';
      html += '<div style="font-weight: bold; color: #1a3a5c; font-size: 12px; margin-bottom: 4px;">Reasoning:</div>';
      html += '<div style="background-color: #f9f9f9; padding: 8px; border: 1px solid #e0e0e0; border-radius: 3px; font-size: 12px; line-height: 1.5;">' + escapeHtml(level3Data.cer.reasoning) + '</div>';
      html += '</div>';
    }

    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Builds Level 4 section of the email
 */
function buildLevel4Section(level4Data) {
  var html = '<div style="margin-bottom: 20px; border-left: 5px solid #1a3a5c; padding-left: 15px; padding-top: 10px; padding-bottom: 10px; padding-right: 15px; background-color: #fafaf8;">';
  html += '<h2 style="color: #1a3a5c; margin-top: 0; font-size: 18px;">Level 4: Synthesis</h2>';

  // Synectics
  if (level4Data.synectics && level4Data.synectics.length > 0) {
    html += '<h3 style="color: #1a3a5c; font-size: 14px; margin-bottom: 8px;">Synectics</h3>';
    for (var i = 0; i < level4Data.synectics.length; i++) {
      var item = level4Data.synectics[i];
      html += '<div style="background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">';
      html += '<div style="font-weight: bold; color: #1a3a5c; margin-bottom: 6px; font-size: 12px;">Object: ' + escapeHtml(item.object || '') + '</div>';
      html += '<div style="background-color: #f9f9f9; padding: 8px; border: 1px solid #e0e0e0; border-radius: 3px; margin-bottom: 6px; font-size: 12px; line-height: 1.5;">' + escapeHtml(item.response || '') + '</div>';
      if (item.wordCount) {
        html += '<div style="font-size: 11px; color: #666;">Word count: ' + item.wordCount + '</div>';
      }
      html += '</div>';
    }
  }

  html += '</div>';
  return html;
}

/**
 * Builds the plain text email body
 */
function buildPlainTextEmail(studentName, teacherName, section, lessonName, responses) {
  var timestamp = Utilities.formatDate(new Date(), DUBAI_TIMEZONE, "MMMM dd, yyyy 'at' hh:mm a z");

  var text = "BIG ERA 4 — LESSON 2: STUDENT SUBMISSION\n";
  text += "================================================\n\n";

  text += "Student Name: " + studentName + "\n";
  text += "Section: " + section + "\n";
  text += "Teacher: " + teacherName + "\n";
  text += "Submitted: " + timestamp + "\n\n";

  // Level 1
  text += "LEVEL 1: FOUNDATIONAL KNOWLEDGE\n";
  text += "--------------------------------\n";
  if (responses.level1) {
    if (responses.level1.vocabMatching) {
      text += "Vocabulary Matching\n";
      text += "Score: " + (responses.level1.vocabMatching.score || 0) + "\n\n";
    }
    if (responses.level1.fillInBlank) {
      text += "Fill in the Blank\n";
      text += "Score: " + (responses.level1.fillInBlank.score || 0) + "\n";
      if (responses.level1.fillInBlank.answers && responses.level1.fillInBlank.answers.length > 0) {
        for (var i = 0; i < responses.level1.fillInBlank.answers.length; i++) {
          text += "Answer " + (i + 1) + ": " + responses.level1.fillInBlank.answers[i] + "\n";
        }
      }
      text += "\n";
    }
  }

  // Level 2
  text += "LEVEL 2: APPLIED KNOWLEDGE\n";
  text += "------------------------\n";
  if (responses.level2) {
    if (responses.level2.relayChain) {
      text += "Relay Chain\n";
      text += "Score: " + (responses.level2.relayChain.score || 0) + "\n";
      if (responses.level2.relayChain.order && responses.level2.relayChain.order.length > 0) {
        text += "Order:\n";
        for (var i = 0; i < responses.level2.relayChain.order.length; i++) {
          text += (i + 1) + ". " + responses.level2.relayChain.order[i] + "\n";
        }
      }
      text += "\n";
    }
    if (responses.level2.explainIt && responses.level2.explainIt.length > 0) {
      text += "Explain It\n";
      for (var i = 0; i < responses.level2.explainIt.length; i++) {
        var item = responses.level2.explainIt[i];
        text += "Prompt: " + (item.prompt || "") + "\n";
        text += "Response: " + (item.response || "") + "\n";
        if (item.wordCount) {
          text += "Word count: " + item.wordCount + "\n";
        }
        text += "\n";
      }
    }
  }

  // Level 3
  text += "LEVEL 3: EXTENDED THINKING\n";
  text += "-------------------------\n";
  if (responses.level3 && responses.level3.cer) {
    text += "Claim, Evidence, Reasoning\n";
    if (responses.level3.cer.claim) {
      text += "Claim: " + responses.level3.cer.claim + "\n";
    }
    if (responses.level3.cer.evidence) {
      text += "Evidence: " + responses.level3.cer.evidence + "\n";
    }
    if (responses.level3.cer.reasoning) {
      text += "Reasoning: " + responses.level3.cer.reasoning + "\n";
    }
    text += "\n";
  }

  // Level 4
  text += "LEVEL 4: SYNTHESIS\n";
  text += "-----------------\n";
  if (responses.level4 && responses.level4.synectics && responses.level4.synectics.length > 0) {
    text += "Synectics\n";
    for (var i = 0; i < responses.level4.synectics.length; i++) {
      var item = responses.level4.synectics[i];
      text += "Object: " + (item.object || "") + "\n";
      text += "Response: " + (item.response || "") + "\n";
      if (item.wordCount) {
        text += "Word count: " + item.wordCount + "\n";
      }
      text += "\n";
    }
  }

  text += "================================================\n";
  text += "This submission was generated automatically from the Big Era 4 interactive lesson page.\n";

  return text;
}

/**
 * Escapes HTML special characters to prevent injection
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

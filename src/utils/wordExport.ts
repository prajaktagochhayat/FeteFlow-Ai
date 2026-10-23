import { EventPlan } from '../types';
import { formatCurrency } from './formatCurrency';

/**
 * Generates and triggers download of a beautifully formatted Microsoft Word (.doc) document
 * using HTML with Microsoft Office Word XML/MSO namespaces and styling.
 */
export function exportEventsToWord(events: EventPlan[], documentTitle: string = 'FêteFlow AI - Celebration Dossier') {
  if (!events || events.length === 0) {
    alert('No celebration records available to export.');
    return;
  }

  const exportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const eventsHtml = events
    .map((evt, index) => {
      const isLast = index === events.length - 1;
      const currency = evt.budget?.currency || 'INR';
      const totalBudget = evt.budget?.totalBudget || 0;
      const totalSpent = (evt.budget?.allocations || []).reduce((acc, a) => acc + (a.actualCost || 0), 0);
      const remaining = totalBudget - totalSpent;

      const allocationsHtml = (evt.budget?.allocations || [])
        .map(
          a => `
          <tr>
            <td style="font-weight: bold; color: #2e1065;">${escapeHtml(a.category)}</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(a.amount, currency)}</td>
            <td style="text-align: right; color: ${a.actualCost && a.actualCost > a.amount ? '#b91c1c' : '#15803d'};">
              ${a.actualCost ? formatCurrency(a.actualCost, currency) : '₹0'}
            </td>
            <td>${escapeHtml(a.reason || 'Core budget requirement')}</td>
          </tr>
        `
        )
        .join('');

      const timelineHtml = (evt.timeline || [])
        .map(
          t => `
          <tr>
            <td style="white-space: nowrap; font-weight: bold; color: #5535b8;">${escapeHtml(t.dueDate)}</td>
            <td style="font-weight: 600;">${escapeHtml(t.title)}</td>
            <td style="font-size: 10pt; color: #4b5563;">${escapeHtml(t.description || '—')}</td>
            <td>
              <span style="font-weight: bold; color: ${t.priority === 'high' ? '#b91c1c' : t.priority === 'medium' ? '#d97706' : '#15803d'};">
                ${t.priority.toUpperCase()}
              </span>
            </td>
            <td style="text-align: center;">${t.completed ? '✅ Completed' : '⏳ Pending'}</td>
          </tr>
        `
        )
        .join('');

      const vendorsHtml = (evt.vendorChecklist || [])
        .map(
          v => `
          <div style="background-color: #fdfbf7; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #fdba74; padding-bottom: 6px; margin-bottom: 8px;">
              <strong style="font-size: 12pt; color: #c2410c;">${escapeHtml(v.category)}</strong>
              <span style="font-size: 10pt; font-weight: bold; color: #431407;">Status: ${v.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            ${v.quotedAmount ? `<p style="margin: 4px 0;"><strong>Quoted / Estimated:</strong> ${formatCurrency(v.quotedAmount, currency)}</p>` : ''}
            ${v.tasks && v.tasks.length > 0 ? `
              <p style="margin: 6px 0 2px 0; font-weight: bold; font-size: 10pt; color: #374151;">Action Tasks:</p>
              <ul style="margin: 4px 0 8px 20px; font-size: 10pt;">
                ${v.tasks.map(task => `<li>${escapeHtml(task)}</li>`).join('')}
              </ul>
            ` : ''}
            ${v.questionsToAsk && v.questionsToAsk.length > 0 ? `
              <p style="margin: 6px 0 2px 0; font-weight: bold; font-size: 10pt; color: #5535b8;">Vendor Interview Questions:</p>
              <ul style="margin: 4px 0 8px 20px; font-size: 10pt; color: #4b5563;">
                ${v.questionsToAsk.map(q => `<li><em>"${escapeHtml(q)}"</em></li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `
        )
        .join('');

      const ideasHtml = (evt.personalizedIdeas || [])
        .map(
          idea => `
          <tr>
            <td style="font-weight: bold; color: #7655e8;">${escapeHtml(idea.title)}</td>
            <td style="font-size: 10pt;">${escapeHtml(idea.category)}</td>
            <td style="text-align: right; font-weight: bold;">${idea.estimatedCost ? formatCurrency(idea.estimatedCost, currency) : 'Included'}</td>
            <td style="font-size: 10pt; color: #374151;">${escapeHtml(idea.description)} ${idea.reason ? `<br><small style="color: #6b7280;"><em>Rationale: ${escapeHtml(idea.reason)}</em></small>` : ''}</td>
          </tr>
        `
        )
        .join('');

      const risksHtml = (evt.risks || [])
        .map(
          r => `
          <tr>
            <td style="color: #991b1b; font-weight: 600;">⚠️ ${escapeHtml(r.description)}</td>
            <td style="color: #166534; font-weight: 600;">🛡️ ${escapeHtml(r.mitigation)}</td>
          </tr>
        `
        )
        .join('');

      const guestsHtml = (evt.guests || []).length > 0
        ? `
        <h3 style="color: #5535b8; margin-top: 24px;">Guest Attendance Roster (${evt.guests!.length} Registered)</h3>
        <table>
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Status</th>
              <th>Table / Group</th>
              <th>Dietary & Accessibility Notes</th>
            </tr>
          </thead>
          <tbody>
            ${evt.guests!.map(g => `
              <tr>
                <td style="font-weight: bold;">${escapeHtml(g.name)}</td>
                <td><span style="font-weight: bold; color: ${g.rsvpStatus === 'attending' ? '#15803d' : g.rsvpStatus === 'declined' ? '#b91c1c' : '#d97706'};">${g.rsvpStatus.toUpperCase()}</span></td>
                <td>${escapeHtml(g.tableOrGroup || 'Unassigned')}</td>
                <td>${escapeHtml([g.dietaryNotes, g.accessibilityNeeds].filter(Boolean).join(' | ') || 'None')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        `
        : '';

      const colorPaletteHtml = (evt.eventConcept?.colorPalette || [])
        .map(
          hex => `
          <div style="display: inline-block; margin-right: 12px; margin-bottom: 8px; text-align: center;">
            <div style="width: 38px; height: 38px; background-color: ${hex}; border: 1px solid #d1d5db; border-radius: 6px; margin: 0 auto 4px auto;"></div>
            <span style="font-family: monospace; font-size: 9pt; color: #4b5563;">${hex}</span>
          </div>
        `
        )
        .join('');

      return `
        <div class="event-section" style="${!isLast ? 'page-break-after: always; mso-break-type: section-break;' : ''}">
          <!-- Event Header Banner -->
          <div style="background-color: #f5f3ff; border: 2px solid #7655e8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="background-color: #7655e8; color: #ffffff; font-size: 10pt; font-weight: bold; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
                  ${evt.eventType.toUpperCase()} CELEBRATION
                </span>
                <h1 style="color: #2e1065; font-size: 24pt; margin: 10px 0 4px 0; font-family: 'Georgia', serif;">
                  ${escapeHtml(evt.name)}
                </h1>
                <p style="color: #6d28d9; font-size: 13pt; margin: 0; font-style: italic;">
                  "${escapeHtml(evt.eventConcept?.title || 'Bespoke Celebration')}"
                </p>
              </div>
            </div>

            <!-- Key Parameters Summary Table -->
            <table style="margin-top: 16px; border: none; background: transparent;">
              <tr>
                <td style="border: none; padding: 4px 12px 4px 0; font-size: 11pt;"><strong>📅 Date:</strong> ${escapeHtml(evt.date)}</td>
                <td style="border: none; padding: 4px 12px; font-size: 11pt;"><strong>📍 Location:</strong> ${escapeHtml(evt.location || 'Local Venue')}</td>
                <td style="border: none; padding: 4px 12px; font-size: 11pt;"><strong>👥 Guests:</strong> ${evt.guestCount} Attendees</td>
                <td style="border: none; padding: 4px 0 4px 12px; font-size: 11pt;"><strong>🌿 Setting:</strong> ${escapeHtml(evt.setting || 'tailored')}</td>
              </tr>
            </table>
          </div>

          <!-- Creative Vision & Concept -->
          <h2 style="color: #5535b8; font-family: 'Georgia', serif; font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px;">
            1. Aesthetic Direction & Concept
          </h2>
          <p style="font-size: 11pt; line-height: 1.6; color: #374151;">
            ${escapeHtml(evt.eventConcept?.description || 'A thoughtfully designed celebration combining personal touch with elevated design.')}
          </p>
          <div style="background-color: #faf5ff; border-left: 4px solid #9333ea; padding: 12px 16px; margin: 12px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Theme:</strong> ${escapeHtml(evt.eventConcept?.theme || 'Curated Elegance')}</p>
            <p style="margin: 0 0 6px 0;"><strong>Style Expression:</strong> ${escapeHtml(evt.eventConcept?.style || 'Contemporary Chic')}</p>
            <p style="margin: 0;"><strong>Creative Guidelines:</strong> ${escapeHtml(evt.eventConcept?.creativeDirection || 'Focus on experiential lighting and guest comfort.')}</p>
          </div>

          ${colorPaletteHtml ? `
            <div style="margin: 14px 0;">
              <strong style="font-size: 10pt; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;">Curated Color Palette:</strong><br>
              <div style="margin-top: 8px;">${colorPaletteHtml}</div>
            </div>
          ` : ''}

          <!-- Financial Blueprint -->
          <h2 style="color: #5535b8; font-family: 'Georgia', serif; font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 28px;">
            2. Financial Architecture & Allocations
          </h2>
          
          <table style="width: auto; margin-bottom: 16px;">
            <tr>
              <td style="background-color: #ede9fe; padding: 8px 16px; border: 1px solid #c4b5fd;">
                <span style="font-size: 10pt; color: #5b21b6;">Total Target Budget</span><br>
                <strong style="font-size: 14pt; color: #2e1065;">${formatCurrency(totalBudget, currency)}</strong>
              </td>
              <td style="background-color: #ecfdf5; padding: 8px 16px; border: 1px solid #a7f3d0;">
                <span style="font-size: 10pt; color: #065f46;">Actual Logged Spend</span><br>
                <strong style="font-size: 14pt; color: #047857;">${formatCurrency(totalSpent, currency)}</strong>
              </td>
              <td style="background-color: #fff7ed; padding: 8px 16px; border: 1px solid #fed7aa;">
                <span style="font-size: 10pt; color: #9a3412;">Remaining Liquidity</span><br>
                <strong style="font-size: 14pt; color: #c2410c;">${formatCurrency(remaining, currency)}</strong>
              </td>
            </tr>
          </table>

          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Category</th>
                <th style="width: 18%; text-align: right;">Target Allocation</th>
                <th style="width: 18%; text-align: right;">Actual Spend</th>
                <th style="width: 39%;">Strategic Allocation Rationale</th>
              </tr>
            </thead>
            <tbody>
              ${allocationsHtml}
            </tbody>
          </table>

          <!-- Chronological Timeline -->
          <h2 style="color: #5535b8; font-family: 'Georgia', serif; font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 28px;">
            3. Production Schedule & Milestone Timeline
          </h2>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Due Date</th>
                <th style="width: 25%;">Milestone Name</th>
                <th style="width: 35%;">Action Details</th>
                <th style="width: 12%;">Priority</th>
                <th style="width: 13%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${timelineHtml}
            </tbody>
          </table>

          <!-- Vendor Hub & Action Briefs -->
          <h2 style="color: #5535b8; font-family: 'Georgia', serif; font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 28px;">
            4. Vendor Checklists & RFP Inquiries
          </h2>
          <div>
            ${vendorsHtml}
          </div>

          <!-- Bespoke Experiential Ideas -->
          ${evt.personalizedIdeas && evt.personalizedIdeas.length > 0 ? `
            <h2 style="color: #5535b8; font-family: 'Georgia', serif; font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 28px;">
              5. Curated Personal Touches & Activations
            </h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 25%;">Concept Name</th>
                  <th style="width: 15%;">Category</th>
                  <th style="width: 18%; text-align: right;">Estimated Cost</th>
                  <th style="width: 42%;">Description & Experience Fit</th>
                </tr>
              </thead>
              <tbody>
                ${ideasHtml}
              </tbody>
            </table>
          ` : ''}

          <!-- Proactive Risk Mitigation Matrix -->
          ${evt.risks && evt.risks.length > 0 ? `
            <h2 style="color: #5535b8; font-family: 'Georgia', serif; font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 28px;">
              6. Risk Mitigation & Contingency Protocols
            </h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Potential Risk & Vulnerability</th>
                  <th style="width: 50%;">Proactive Contingency & Solution</th>
                </tr>
              </thead>
              <tbody>
                ${risksHtml}
              </tbody>
            </table>
          ` : ''}

          <!-- Guest Roster -->
          ${guestsHtml}

          <div style="margin-top: 30px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 9pt; color: #94a3b8; text-align: center;">
            Generated by FêteFlow AI Celebration Architect · Confidential Event Planning Document
          </div>
        </div>
      `;
    })
    .join('');

  const fullDocHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(documentTitle)}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
          color: #1f2937;
          line-height: 1.5;
          margin: 30px;
        }
        h1, h2, h3 {
          font-family: 'Georgia', serif;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 10.5pt;
        }
        th {
          background-color: #5535b8;
          color: #ffffff;
          padding: 8px 10px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #432896;
        }
        td {
          padding: 7px 10px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        tr:nth-child(even) td {
          background-color: #f8fafc;
        }
      </style>
    </head>
    <body>
      <!-- Document Master Header -->
      <div style="border-bottom: 3px double #7655e8; padding-bottom: 12px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: #5535b8; font-size: 26pt; margin: 0 0 6px 0; font-family: 'Georgia', serif;">
          FÊTEFLOW AI
        </h1>
        <p style="font-size: 13pt; color: #4b5563; margin: 0 0 6px 0; font-weight: 600;">
          ${escapeHtml(documentTitle)}
        </p>
        <p style="font-size: 9.5pt; color: #6b7280; margin: 0;">
          Exported on: ${exportDate} · Curated by FêteFlow Generative AI Engine
        </p>
      </div>

      ${eventsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullDocHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeName = (events.length === 1 ? events[0].name : 'All_Celebrations')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  anchor.download = `FeteFlow_${safeName}_Plan.doc`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

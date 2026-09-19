import { getVisitsByDateRange } from '@/services/storage/visitRepository';

/**
 * Generates a text-based daily/weekly report from visits.
 * Formats the report keeping the original tone and text provided by the user.
 */
export async function generateTextReport(
  repName: string, 
  fromDate: string, 
  toDate: string
): Promise<string> {
  const visits = await getVisitsByDateRange(fromDate, toDate);
  
  if (visits.length === 0) {
    return 'لا توجد زيارات مسجلة في هذه الفترة.';
  }

  // Format date header
  const dateHeader = fromDate === toDate 
    ? formatDate(fromDate)
    : `${formatDate(fromDate)} - ${formatDate(toDate)}`;

  let report = `${repName || 'مندوب المبيعات'}\n${dateHeader}\n\n`;

  // Group visits by date if it's a range, or just list them if single day
  const isMultiDay = fromDate !== toDate;
  
  let currentDate = '';

  for (const visit of visits) {
    if (isMultiDay && visit.date !== currentDate) {
      report += `\n--- ${formatDate(visit.date)} ---\n\n`;
      currentDate = visit.date;
    }

    // Entity name
    let line = `${visit.entityName}: `;
    
    const parts: string[] = [];
    
    // Outcomes
    if (visit.outcomes.length > 0) {
      parts.push(visit.outcomes.join(' و '));
    }
    
    // Feedback
    if (visit.feedback) {
      parts.push(visit.feedback);
    }
    
    // Products
    if (visit.productNames.length > 0) {
      parts.push(`المنتجات: ${visit.productNames.join('، ')}`);
    }
    
    // Combine parts
    if (parts.length > 0) {
      line += parts.join('، ');
    } else {
      line += 'زيارة روتينية.';
    }

    // Finish line with a period if it doesn't have one
    if (!line.endsWith('.') && !line.endsWith('؟') && !line.endsWith('!')) {
      line += '.';
    }

    report += line + '\n\n';
  }

  return report.trim();
}

function formatDate(isoDate: string): string {
  // ISO is YYYY-MM-DD
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

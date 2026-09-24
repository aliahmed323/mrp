import { db } from '@/services/storage/db';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export async function generateTextReport(
  repName: string,
  fromDateStr: string,
  toDateStr: string
): Promise<string> {
  const visits = await db.visits
    .where('date')
    .between(fromDateStr, toDateStr, true, true)
    .toArray();

  if (visits.length === 0) {
    return `لا توجد زيارات مسجلة في هذه الفترة (${fromDateStr}${fromDateStr !== toDateStr ? ' إلى ' + toDateStr : ''})`;
  }

  // Sort visits chronologically
  visits.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const isDaily = fromDateStr === toDateStr;
  const dateObj = new Date(fromDateStr);
  const dayName = format(dateObj, 'EEEE', { locale: ar });

  let report = '';
  
  // Header
  if (isDaily) {
    report += `Daily Report\nName: ${repName || '_________'}\nDate: ${fromDateStr} (${dayName})\n\n`;
  } else {
    report += `Period Report\nName: ${repName || '_________'}\nFrom: ${fromDateStr}\nTo: ${toDateStr}\n\n`;
  }

  // Group visits by date for range reports, or just list them for daily
  if (isDaily) {
    let index = 1;
    for (const v of visits) {
      let line = `${index}. `;
      const typeLabel = v.type === 'doctor' ? 'Dr.' : v.type === 'pharmacy' ? 'Ph.' : 'Clinic ';
      line += `${typeLabel} ${v.entityName}`;
      
      if (v.productNames && v.productNames.length > 0) {
         line += ` (${v.productNames.join(', ')})`;
      }
      
      const outcomes = v.outcomes.filter(o => o !== 'أخرى').join(', ');
      if (outcomes) {
        line += ` - ${outcomes}`;
      }
      
      if (v.feedback) {
        line += ` - ${v.feedback}`;
      }

      report += line + '\n';
      index++;
    }
  } else {
    // Group by date
    const grouped = visits.reduce((acc, visit) => {
      acc[visit.date] = acc[visit.date] || [];
      acc[visit.date].push(visit);
      return acc;
    }, {} as Record<string, typeof visits>);

    const sortedDates = Object.keys(grouped).sort();

    for (const date of sortedDates) {
      const dObj = new Date(date);
      const dName = format(dObj, 'EEEE', { locale: ar });
      report += `--- ${date} (${dName}) ---\n`;
      
      let index = 1;
      for (const v of grouped[date]) {
        let line = `${index}. `;
        const typeLabel = v.type === 'doctor' ? 'Dr.' : v.type === 'pharmacy' ? 'Ph.' : 'Clinic ';
        line += `${typeLabel} ${v.entityName}`;
        
        if (v.productNames && v.productNames.length > 0) {
           line += ` (${v.productNames.join(', ')})`;
        }
        
        const outcomes = v.outcomes.filter(o => o !== 'أخرى').join(', ');
        if (outcomes) {
          line += ` - ${outcomes}`;
        }
        
        if (v.feedback) {
          line += ` - ${v.feedback}`;
        }

        report += line + '\n';
        index++;
      }
      report += '\n';
    }
  }

  // Summary footer
  const totalDoctors = visits.filter(v => v.type === 'doctor').length;
  const totalPharmacies = visits.filter(v => v.type === 'pharmacy').length;
  const totalVisits = visits.length;

  report += `\nTotal Visits: ${totalVisits}`;
  report += `\nDoctors: ${totalDoctors} | Pharmacies: ${totalPharmacies}`;

  return report;
}

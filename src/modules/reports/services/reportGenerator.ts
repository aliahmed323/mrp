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
  
  // Header — Arabic only, NO English titles
  if (isDaily) {
    report += `تقرير يومي\n`;
    report += `الاسم: ${repName || '_________'}\n`;
    report += `التاريخ: ${fromDateStr} (${dayName})\n\n`;
  } else {
    report += `تقرير الفترة\n`;
    report += `الاسم: ${repName || '_________'}\n`;
    report += `من: ${fromDateStr}\n`;
    report += `إلى: ${toDateStr}\n\n`;
  }

  // Build visit lines — NO auto Dr./Ph. prefix
  const buildLine = (index: number, v: any) => {
    let line = `${index}. `;

    // Entity name as-is — do NOT prepend "Dr." or any English title
    line += v.entityName;
    
    if (v.productNames && v.productNames.length > 0) {
       line += ` (${v.productNames.join('، ')})`;
    }
    
    const outcomes = v.outcomes.filter((o: string) => o !== 'أخرى').join('، ');
    if (outcomes) {
      line += ` — ${outcomes}`;
    }
    
    if (v.feedback) {
      line += ` — ${v.feedback}`;
    }

    return line;
  };

  if (isDaily) {
    let index = 1;
    for (const v of visits) {
      report += buildLine(index, v) + '\n';
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
      report += `─── ${date} (${dName}) ───\n`;
      
      let index = 1;
      for (const v of grouped[date]) {
        report += buildLine(index, v) + '\n';
        index++;
      }
      report += '\n';
    }
  }

  // Summary footer — Arabic only
  const totalDoctors = visits.filter(v => v.type === 'doctor').length;
  const totalPharmacies = visits.filter(v => v.type === 'pharmacy').length;
  const totalVisits = visits.length;

  report += `\nإجمالي الزيارات: ${totalVisits}`;
  report += `\nأطباء: ${totalDoctors} | صيدليات: ${totalPharmacies}`;

  return report;
}

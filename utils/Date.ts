import { parseISO, isValid, parse } from 'date-fns';

export function parseDueDate(dueDate: string | Date | null | undefined): Date | null {
    if (!dueDate) return null;
  
    if (dueDate instanceof Date) {
      return isValid(dueDate) ? dueDate : null;
    }
  
    // Try parsing as ISO string
    let parsedDate = parseISO(dueDate);
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  
    // Try parsing common formats
    const formats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'yyyy/MM/dd',
      'MMMM d, yyyy',
      'd MMMM yyyy',
    ];
  
    for (const formatString of formats) {
      parsedDate = parse(dueDate, formatString, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
  
    // If all parsing attempts fail, return null
    return null;
  }
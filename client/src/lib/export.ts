/**
 * Data Export Utilities
 * 
 * Functions to export user data in CSV and JSON formats
 */

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download data as JSON file
 */
export function downloadJSON(filename: string, data: any) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format slider history for export
 */
export function formatSliderHistoryForExport(history: any[]) {
  return history.map(entry => ({
    date: new Date(entry.calibrationDate).toISOString(),
    axis: `${entry.axis?.leftLabel} ↔ ${entry.axis?.rightLabel}`,
    value: entry.value,
    context: entry.contextTag || '',
    notes: entry.notes || '',
  }));
}

/**
 * Format daily cycles for export
 */
export function formatDailyCyclesForExport(cycles: any[]) {
  return cycles.map(cycle => ({
    date: new Date(cycle.cycleDate).toISOString(),
    morningCompleted: cycle.morningCompleted,
    middayCompleted: cycle.middayCompleted,
    eveningCompleted: cycle.eveningCompleted,
    intention: cycle.intention || '',
    decisiveAction: cycle.decisiveAction || '',
    eveningReflection: cycle.eveningReflection || '',
  }));
}

/**
 * Format insights for export
 */
export function formatInsightsForExport(insights: any[]) {
  return insights.map(insight => ({
    date: new Date(insight.generatedAt).toISOString(),
    type: insight.insightType,
    content: insight.content,
    rating: insight.userRating || '',
    implemented: insight.implemented || false,
  }));
}

/**
 * Format complete user data for JSON export
 */
export function formatCompleteDataForExport(data: {
  sliderHistory?: any[];
  dailyCycles?: any[];
  insights?: any[];
  modules?: any[];
  sowingReaping?: any[];
  weeklyReviews?: any[];
  prayers?: any[];
}) {
  return {
    exportDate: new Date().toISOString(),
    version: '1.0',
    data: {
      sliderHistory: data.sliderHistory ? formatSliderHistoryForExport(data.sliderHistory) : [],
      dailyCycles: data.dailyCycles ? formatDailyCyclesForExport(data.dailyCycles) : [],
      insights: data.insights ? formatInsightsForExport(data.insights) : [],
      moduleProgress: data.modules || [],
      sowingReapingEntries: data.sowingReaping || [],
      weeklyReviews: data.weeklyReviews || [],
      prayerJournal: data.prayers || [],
    },
  };
}

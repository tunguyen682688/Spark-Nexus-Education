/**
 * CSV Parser Utility
 * Parses CSV file content into structured data
 */
export class CsvParserUtil {
  /**
   * Parse CSV string into array of rows
   */
  static parse(csvContent: string, hasHeaders = true): string[][] {
    const lines = csvContent
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (hasHeaders && lines.length > 0) {
      lines.shift(); // Remove header row
    }

    return lines.map((line) => {
      // Handle quoted fields
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            current += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      // Add last field
      result.push(current.trim());

      return result;
    });
  }

  /**
   * Parse CSV into vocabulary entries format
   * Expected format: word,definition,example (or word only)
   */
  static parseToEntries(
    csvContent: string,
    options?: {
      hasHeaders?: boolean;
      wordColumn?: number; // Default: 0
      definitionColumn?: number; // Default: 1 (optional)
      exampleColumn?: number; // Default: 2 (optional)
      notesColumn?: number; // Default: 3 (optional)
    }
  ): Array<{
    word: string;
    definition?: string;
    example?: string;
    notes?: string;
  }> {
    const rows = this.parse(csvContent, options?.hasHeaders);
    const wordCol = options?.wordColumn ?? 0;
    const defCol = options?.definitionColumn ?? 1;
    const exCol = options?.exampleColumn ?? 2;
    const notesCol = options?.notesColumn ?? 3;

    return rows
      .filter((row) => row[wordCol]?.trim()) // Only rows with word
      .map((row) => ({
        word: row[wordCol]?.trim() || '',
        definition: row[defCol]?.trim() || undefined,
        example: row[exCol]?.trim() || undefined,
        notes: row[notesCol]?.trim() || undefined,
      }));
  }

  /**
   * Parse simple text (one word per line)
   */
  static parseSimpleText(textContent: string): string[] {
    return textContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}

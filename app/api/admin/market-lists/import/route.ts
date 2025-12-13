import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import MarketList from '@/models/MarketList';
import { z } from 'zod';

const marketListSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  filters: z.any().optional(),
  static_items: z.array(z.string()).optional(),
  computed_type: z.enum(['static', 'dynamic']),
  refresh_seconds: z.number().min(0),
  visibility: z.enum(['public', 'private']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.trim().split('\n');

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
    }

    // Simple CSV parser that handles quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
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

      // Add the last field
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const expectedHeaders = ['slug', 'title', 'description', 'filters', 'static_items', 'computed_type', 'refresh_seconds', 'visibility'];

    if (!expectedHeaders.every(h => headers.includes(h))) {
      return NextResponse.json({
        error: `Invalid CSV headers. Expected: ${expectedHeaders.join(', ')}`
      }, { status: 400 });
    }

    const marketLists = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Invalid number of columns`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      try {
        // Parse filters JSON
        if (rowData.filters && rowData.filters.trim() !== '{}') {
          try {
            rowData.filters = JSON.parse(rowData.filters);
          } catch (e) {
            throw new Error(`Invalid filters JSON: ${rowData.filters}`);
          }
        } else {
          rowData.filters = {};
        }

        // Parse static_items
        if (rowData.static_items) {
          rowData.static_items = rowData.static_items.split(';').map((s: string) => s.trim()).filter((s: string) => s);
        } else {
          rowData.static_items = [];
        }

        // Parse refresh_seconds
        rowData.refresh_seconds = parseInt(rowData.refresh_seconds);
        if (isNaN(rowData.refresh_seconds)) {
          throw new Error(`Invalid refresh_seconds: ${rowData.refresh_seconds}`);
        }

        // Validate the data
        const validatedData = marketListSchema.parse(rowData);

        marketLists.push({
          ...validatedData,
          computed: {
            type: validatedData.computed_type,
            refresh_seconds: validatedData.refresh_seconds,
          },
          meta: {},
        });
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Validation errors found',
        details: errors
      }, { status: 400 });
    }

    // Insert market lists
    const inserted = await MarketList.insertMany(marketLists, { ordered: false });

    return NextResponse.json({
      message: `Successfully imported ${inserted.length} market lists`,
      insertedCount: inserted.length
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

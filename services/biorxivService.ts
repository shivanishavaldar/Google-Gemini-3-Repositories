import { BioRxivPaper, BioRxivResponse } from "../types";

// BioRxiv API base URL
const BASE_URL = "https://api.biorxiv.org/details/biorxiv";

/**
 * Fetches papers for a given date range.
 * Recursively fetches all pages (100 items per page) to ensure complete data for the month.
 */
export const fetchPapersByMonth = async (year: number, month: number): Promise<BioRxivPaper[]> => {
  // Construct start and end date strings (YYYY-MM-DD)
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  let allPapers: BioRxivPaper[] = [];
  let cursor = 0;
  let total = 0;
  const MAX_PAPERS = 2000; // Safety limit to prevent infinite loops or massive payloads

  try {
    // First request to get data and total count
    // Loop to fetch remaining pages
    do {
      const url = `${BASE_URL}/${startStr}/${endStr}/${cursor}/json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`BioRxiv API error at cursor ${cursor}: ${response.statusText}`);
        break;
      }

      const data: BioRxivResponse = await response.json();

      if (!data.collection || !Array.isArray(data.collection)) {
        break;
      }

      const messages = data.messages[0];
      total = messages.total;
      
      // Add new papers
      allPapers = [...allPapers, ...data.collection];
      
      // Update cursor based on returned items count
      cursor += data.collection.length;

      // Safety break
      if (allPapers.length >= MAX_PAPERS) {
        console.warn("Reached maximum paper limit for safety.");
        break;
      }

    } while (cursor < total);

    return allPapers;
  } catch (error) {
    console.error("Failed to fetch BioRxiv papers:", error);
    // Return whatever we managed to fetch so far, rather than empty array if one page fails
    return allPapers;
  }
};
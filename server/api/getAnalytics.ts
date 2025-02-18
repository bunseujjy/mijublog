import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient();
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const propertyId = config.public.propertyId; // GA4 property ID from runtime config

  if (!propertyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Google Analytics property ID is not set',
    });
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    });

    // Safely access the response to avoid potential errors
    const monthlyVisitors = response.rows?.[0]?.metricValues?.[0]?.value;

    if (!monthlyVisitors) {
      throw new Error('Monthly visitors data is not available');
    }
    return { monthlyVisitors };
  } catch (error: any) {
    // Log more details if available
    console.error('Error fetching Google Analytics data:', error.message, error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch monthly visitors from Google Analytics',
    });
  }
});

import { withCORS } from '../../../../lib/cors';
import clientPromise from '../../../../lib/mongodb';

async function searchListings(request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Build MongoDB query from search parameters
    const query = {};
    
    // Location search (case-insensitive partial match)
    const location = params.get('location');
    if (location) {
      query.$or = [
        { address: { $regex: location, $options: 'i' } },
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { zipCode: { $regex: location, $options: 'i' } },
      ];
    }

    // Property type
    const type = params.get('type');
    if (type && type !== 'all') {
      query.type = type;
    }

    // Price range
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    if (minPrice || maxPrice) {
      query.$and = query.$and || [];
      const priceQuery = {};
      if (minPrice) {
        priceQuery.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceQuery.$lte = parseFloat(maxPrice);
      }
      query.$and.push({
        $or: [
          { regularPrice: priceQuery },
          { discountedPrice: priceQuery }
        ]
      });
    }

    // Bedrooms (minimum)
    const bedrooms = params.get('bedrooms');
    if (bedrooms) {
      query.bedrooms = { $gte: parseInt(bedrooms) };
    }

    // Bathrooms (minimum)
    const bathrooms = params.get('bathrooms');
    if (bathrooms) {
      query.bathrooms = { $gte: parseInt(bathrooms) };
    }

    // Sorting
    let sortOption = { timestamp: -1 }; // Default: newest first
    const sortBy = params.get('sortBy');
    
    switch (sortBy) {
      case 'date-asc':
        sortOption = { timestamp: 1 };
        break;
      case 'price-asc':
        sortOption = { regularPrice: 1 };
        break;
      case 'price-desc':
        sortOption = { regularPrice: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 }; // Assuming you track views
        break;
      default:
        sortOption = { timestamp: -1 };
    }

    // Execute query
    const client = await clientPromise;
    const db = client.db();
    
    const listings = await db.collection('listings')
      .find(query)
      .sort(sortOption)
      .limit(50) // Limit results
      .toArray();

    const total = await db.collection('listings').countDocuments(query);

    console.log('Search query:', query);
    console.log('Found listings:', listings.length);

    return new Response(
      JSON.stringify({
        listings,
        total,
        query: Object.fromEntries(params.entries())
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to search listings', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const GET = withCORS(searchListings);

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

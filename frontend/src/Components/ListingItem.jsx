import React from "react";

export default function ListingItem({ listing, onEdit, onDelete, onShow }) {
  return (
    <li className="border p-4 rounded mb-4 flex flex-col">
      <div className="flex-1">
        {listing.images && listing.images.length > 0 && (
          <img
            src={listing.images[0]}
            alt={listing.name || 'Listing'}
            className="w-full h-40 object-cover rounded mb-2"
          />
        )}
        <h3 className="text-lg font-bold">{listing.name || listing.title || 'No Title'}</h3>
        <p className="text-gray-700">Price: ${listing.regularPrice || listing.price || 'N/A'}</p>
        {listing.address && <p className="text-gray-500 text-sm">Address: {listing.address}</p>}
        <div className="flex gap-2 text-sm text-gray-600 mt-1">
          <span>Beds: {listing.bedrooms ?? '-'}</span>
          <span>Baths: {listing.bathrooms ?? '-'}</span>
        </div>
      </div>
      <div className="flex mt-2 space-x-2">
        <button onClick={onShow} className="bg-green-500 text-white px-3 py-1 rounded">Show</button>
        <button onClick={onEdit} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
        <button onClick={onDelete} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
      </div>
    </li>
  );
} 
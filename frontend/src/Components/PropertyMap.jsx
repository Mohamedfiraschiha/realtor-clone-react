import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { FaBed, FaBath, FaMapMarkerAlt, FaStreetView } from "react-icons/fa";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom marker icons for different property types
const createCustomIcon = (type, price) => {
  const color = type === "rent" ? "#3b82f6" : "#10b981";
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        $${price?.toLocaleString()}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Component to handle map view updates
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Component to draw search radius
function SearchRadius({ center, radius, onRadiusChange }) {
  const map = useMap();

  useEffect(() => {
    if (!center || !radius) return;

    const circle = L.circle(center, {
      radius: radius * 1609.34, // Convert miles to meters
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      weight: 2,
      dashArray: "5, 10",
    }).addTo(map);

    return () => {
      map.removeLayer(circle);
    };
  }, [center, radius, map]);

  return null;
}

export default function PropertyMap({
  listings = [],
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 12,
  height = "500px",
  enableClustering = true,
  enableSearchRadius = false,
  searchRadius = 5,
  onMapClick,
}) {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom] = useState(zoom);
  const mapRef = useRef(null);

  // Update map center when listings change
  useEffect(() => {
    if (listings.length > 0 && listings[0].geolocation) {
      const firstListing = listings[0].geolocation;
      setMapCenter([firstListing.lat, firstListing.lng]);
    }
  }, [listings]);

  // Handle marker click
  const handleMarkerClick = (listing) => {
    navigate(`/show-listing/${listing._id}`);
  };

  // Open Street View
  const openStreetView = (lat, lng) => {
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(streetViewUrl, "_blank");
  };

  // Render markers with or without clustering
  const renderMarkers = () => {
    const markers = listings
      .filter((listing) => listing.geolocation?.lat && listing.geolocation?.lng)
      .map((listing) => {
        const position = [listing.geolocation.lat, listing.geolocation.lng];
        const price = listing.discountedPrice || listing.regularPrice;

        return (
          <Marker
            key={listing._id}
            position={position}
            icon={createCustomIcon(listing.type, price)}
            eventHandlers={{
              click: () => handleMarkerClick(listing),
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                {/* Property Image */}
                {listing.images && listing.images[0] && (
                  <img
                    src={listing.images[0]}
                    alt={listing.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}

                {/* Property Details */}
                <h3 className="font-bold text-lg mb-1 line-clamp-1">
                  {listing.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  <FaMapMarkerAlt className="inline mr-1" />
                  {listing.address}
                </p>

                {/* Price */}
                <p className="text-xl font-bold text-blue-600 mb-2">
                  ${price?.toLocaleString()}
                  {listing.type === "rent" && (
                    <span className="text-sm"> /month</span>
                  )}
                </p>

                {/* Beds & Baths */}
                <div className="flex gap-4 text-sm text-gray-700 mb-2">
                  <span>
                    <FaBed className="inline mr-1" />
                    {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
                  </span>
                  <span>
                    <FaBath className="inline mr-1" />
                    {listing.bathrooms}{" "}
                    {listing.bathrooms === 1 ? "Bath" : "Baths"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleMarkerClick(listing)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-blue-700"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() =>
                      openStreetView(
                        listing.geolocation.lat,
                        listing.geolocation.lng
                      )
                    }
                    className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    title="Street View"
                  >
                    <FaStreetView />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      });

    if (enableClustering) {
      return <MarkerClusterGroup>{markers}</MarkerClusterGroup>;
    }
    return markers;
  };

  return (
    <div
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden shadow-lg"
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Alternative tile options - uncomment to use */}
        {/* CartoDB Positron (clean, light theme) */}
        {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        /> */}

        <ChangeView center={mapCenter} zoom={mapZoom} />

        {/* Search Radius Circle */}
        {enableSearchRadius && searchRadius && (
          <SearchRadius center={mapCenter} radius={searchRadius} />
        )}

        {/* Property Markers */}
        {renderMarkers()}
      </MapContainer>
    </div>
  );
}

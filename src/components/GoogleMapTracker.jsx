import React, { useEffect, useRef, useState } from 'react';

// Haversine formula to calculate approximate straight-line distance in kilometers
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const GoogleMapTracker = ({
  destinationLatitude,
  destinationLongitude,
  destinationAddress,
  agentLatitude,
  agentLongitude,
  agentName = 'Delivery Partner',
  agentAccuracy = null,
  lastUpdatedTimestamp = null,
  isLiveTrackingActive = false,
  onRefresh,
  refreshing = false,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const destMarkerRef = useRef(null);
  const agentMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const polylineRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && apiKey.trim().length > 10;

  // ── 1. Google Maps Script Loader ───────────────────────────────────────────
  useEffect(() => {
    if (!isKeyConfigured) return;

    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-api-script';
    let script = document.getElementById(scriptId);

    const onScriptLoad = () => setMapLoaded(true);
    const onScriptError = () => setLoadError('Failed to load Google Maps script. Check network or key permissions.');

    window.gm_authFailure = () => {
      setLoadError('Google Maps API Authentication Failed: Verify your API key restrictions and billing in Google Cloud Console.');
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = onScriptLoad;
      script.onerror = onScriptError;
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', onScriptLoad);
      script.addEventListener('error', onScriptError);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', onScriptLoad);
        script.removeEventListener('error', onScriptError);
      }
    };
  }, [apiKey, isKeyConfigured]);

  // ── 2. Initialize Map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.google?.maps) return;

    const defaultCenter = {
      lat: destinationLatitude || 17.3850,
      lng: destinationLongitude || 78.4867,
    };

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
        ],
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Destination Marker
    if (destinationLatitude && destinationLongitude) {
      const destPos = { lat: destinationLatitude, lng: destinationLongitude };

      if (!destMarkerRef.current) {
        destMarkerRef.current = new window.google.maps.Marker({
          position: destPos,
          map,
          title: 'Delivery Destination',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });

        const destInfo = new window.google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:4px">
            <strong style="color:#0f172a">Delivery Destination</strong><br/>
            <span style="font-size:12px;color:#64748b">${destinationAddress || 'Customer Address'}</span>
          </div>`,
        });
        destMarkerRef.current.addListener('click', () => destInfo.open(map, destMarkerRef.current));
      } else {
        destMarkerRef.current.setPosition(destPos);
      }
    }

    // Delivery Agent Marker
    if (agentLatitude && agentLongitude) {
      const agentPos = { lat: agentLatitude, lng: agentLongitude };

      if (!agentMarkerRef.current) {
        agentMarkerRef.current = new window.google.maps.Marker({
          position: agentPos,
          map,
          title: `Delivery Agent: ${agentName}`,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#ea580c',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.6,
            anchor: new window.google.maps.Point(12, 22),
          },
        });

        const agentInfo = new window.google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:4px">
            <strong style="color:#ea580c">🚚 ${agentName}</strong><br/>
            <span style="font-size:12px;color:#64748b">Active Delivery Agent</span>
          </div>`,
        });
        agentMarkerRef.current.addListener('click', () => agentInfo.open(map, agentMarkerRef.current));
      } else {
        agentMarkerRef.current.setPosition(agentPos);
      }
    }

    // Directions & Route Rendering
    if (agentLatitude && agentLongitude && destinationLatitude && destinationLongitude) {
      const origin = new window.google.maps.LatLng(agentLatitude, agentLongitude);
      const dest = new window.google.maps.LatLng(destinationLatitude, destinationLongitude);

      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(dest);
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

      // Calculate driving route using DirectionsService
      const directionsService = new window.google.maps.DirectionsService();

      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#2563eb',
            strokeWeight: 5,
            strokeOpacity: 0.85,
          },
        });
      }

      directionsService.route(
        {
          origin,
          destination: dest,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRendererRef.current.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setRouteInfo({
                distance: leg.distance.text,
                duration: leg.duration.text,
              });
            }
          } else {
            // Fallback: draw straight polyline between agent and customer if directions API is disabled
            if (polylineRef.current) polylineRef.current.setMap(null);
            polylineRef.current = new window.google.maps.Polyline({
              path: [origin, dest],
              geodesic: true,
              strokeColor: '#2563eb',
              strokeOpacity: 0.7,
              strokeWeight: 4,
            });
            polylineRef.current.setMap(map);
          }
        }
      );
    }
  }, [mapLoaded, destinationLatitude, destinationLongitude, agentLatitude, agentLongitude, agentName, destinationAddress]);

  const straightLineDistance = calculateDistanceKm(agentLatitude, agentLongitude, destinationLatitude, destinationLongitude);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Map Header Toolbar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🗺️</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
              Live Delivery Route & Map
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {isLiveTrackingActive ? (
                <span style={{ color: '#16a34a', fontWeight: 700 }}>
                  ● Real-time GPS Tracking Active
                </span>
              ) : agentLatitude ? (
                'Last known location reported'
              ) : (
                'Awaiting delivery agent dispatch'
              )}
            </span>
          </div>
        </div>

        {/* Right Status Badges & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastUpdatedTimestamp && (
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Updated: {new Date(lastUpdatedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              🔄 {refreshing ? 'Updating...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      {isKeyConfigured && !loadError ? (
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '420px',
            backgroundColor: '#f1f5f9',
          }}
        />
      ) : (
        /* Configuration Guide or Setup Card */
        <div
          style={{
            padding: '2rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                📍
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Google Maps API Configuration
                </h4>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                  {loadError
                    ? loadError
                    : 'To view live interactive vector maps and turn-by-turn driving routes on this screen, provide your Google Maps JavaScript API Key.'}
                </p>

                <div
                  style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    color: '#334155',
                    marginBottom: '0.75rem',
                  }}
                >
                  # In frontend/.env.local:<br />
                  VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <strong>Required Google Cloud APIs:</strong> Maps JavaScript API • Directions API • Geocoding API
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Coordinates & Telemetry Monitor Strip */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          fontSize: '0.85rem',
        }}
      >
        {/* Customer Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem', color: '#2563eb' }}>🏠</span>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              CUSTOMER DESTINATION
            </span>
            <strong style={{ color: '#0f172a' }}>
              {destinationLatitude && destinationLongitude
                ? `${destinationLatitude.toFixed(4)}° N, ${destinationLongitude.toFixed(4)}° E`
                : 'Address Registered'}
            </strong>
          </div>
        </div>

        {/* Agent Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem', color: '#ea580c' }}>🚚</span>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              DELIVERY AGENT (LATEST GPS)
            </span>
            <strong style={{ color: agentLatitude ? '#0f172a' : '#94a3b8' }}>
              {agentLatitude && agentLongitude
                ? `${agentLatitude.toFixed(4)}° N, ${agentLongitude.toFixed(4)}° E`
                : 'Not Yet Reported'}
            </strong>
          </div>
        </div>

        {/* Route / Distance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem', color: '#16a34a' }}>📏</span>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              DISTANCE TO DESTINATION
            </span>
            <strong style={{ color: '#16a34a' }}>
              {routeInfo
                ? `${routeInfo.distance} (Est. ${routeInfo.duration})`
                : straightLineDistance
                ? `~${straightLineDistance} km away`
                : 'Calculating...'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapTracker;

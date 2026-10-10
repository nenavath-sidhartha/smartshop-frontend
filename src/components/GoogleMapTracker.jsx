import React, { useEffect, useRef, useState } from 'react';

// Haversine formula to calculate approximate straight-line distance in kilometers
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lat1 === undefined || lon1 === null || lon1 === undefined ||
      lat2 === null || lat2 === undefined || lon2 === null || lon2 === undefined) {
    return null;
  }
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

  const rawKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = Boolean(
    rawKey &&
    rawKey !== 'YOUR_GOOGLE_MAPS_API_KEY' &&
    rawKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' &&
    rawKey.trim().length > 15
  );

  // Check if reported location is outdated (older than 5 minutes)
  const isLocationOutdated = Boolean(
    lastUpdatedTimestamp &&
    (Date.now() - new Date(lastUpdatedTimestamp).getTime()) > 5 * 60 * 1000
  );

  // ── 1. Google Maps Script Loader ───────────────────────────────────────────
  useEffect(() => {
    if (!isKeyConfigured) {
      return;
    }

    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-api-script';
    let script = document.getElementById(scriptId);

    const onScriptLoad = () => {
      setMapLoaded(true);
      setLoadError(null);
    };

    const onScriptError = (err) => {
      const msg = 'Failed to load Google Maps script. Check network connectivity and API key restrictions.';
      console.error('[Google Maps]', msg, err);
      setLoadError(msg);
    };

    // Google Maps API Global Authentication Failure Hook
    window.gm_authFailure = () => {
      const authErrMsg =
        'Google Maps API Authentication Failed. Please verify in Google Cloud Console: 1) Billing is active, 2) Maps JavaScript API is enabled, 3) Allowed HTTP referrer includes http://localhost:5173/*';
      console.error('[Google Maps Auth Error]', authErrMsg);
      setLoadError(authErrMsg);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(rawKey)}&libraries=geometry`;
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
  }, [rawKey, isKeyConfigured]);

  // ── 2. Initialize Map & Render Markers/Route ────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || loadError || !mapContainerRef.current || !window.google?.maps) return;

    // Use actual destination coordinates if available, else standard center
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

    // Destination Marker - appears only when valid coordinates exist
    if (typeof destinationLatitude === 'number' && typeof destinationLongitude === 'number') {
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
          content: `<div style="font-family:sans-serif;padding:6px">
            <strong style="color:#0f172a;font-size:13px">📍 Customer Destination</strong><br/>
            <span style="font-size:12px;color:#64748b">${destinationAddress || 'Delivery Address'}</span>
          </div>`,
        });
        destMarkerRef.current.addListener('click', () => destInfo.open(map, destMarkerRef.current));
      } else {
        destMarkerRef.current.setPosition(destPos);
      }
    }

    // Delivery Agent Marker - appears only when actual real GPS coordinates exist
    if (typeof agentLatitude === 'number' && typeof agentLongitude === 'number') {
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
          content: `<div style="font-family:sans-serif;padding:6px">
            <strong style="color:#ea580c;font-size:13px">🛵 ${agentName}</strong><br/>
            <span style="font-size:12px;color:#64748b">Active GPS Position</span>
            ${agentAccuracy ? `<br/><span style="font-size:11px;color:#94a3b8">Accuracy: ±${Math.round(agentAccuracy)}m</span>` : ''}
          </div>`,
        });
        agentMarkerRef.current.addListener('click', () => agentInfo.open(map, agentMarkerRef.current));
      } else {
        agentMarkerRef.current.setPosition(agentPos);
      }
    }

    // Adjust Map Bounds & Driving Route
    if (
      typeof agentLatitude === 'number' &&
      typeof agentLongitude === 'number' &&
      typeof destinationLatitude === 'number' &&
      typeof destinationLongitude === 'number'
    ) {
      const origin = new window.google.maps.LatLng(agentLatitude, agentLongitude);
      const dest = new window.google.maps.LatLng(destinationLatitude, destinationLongitude);

      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(dest);
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

      // Calculate driving route using Google DirectionsService
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
            console.warn('[Google DirectionsService]', `Driving directions query status: ${status}.`);
            // Fallback straight line polyline if Directions API is not enabled on the API key
            if (polylineRef.current) polylineRef.current.setMap(null);
            polylineRef.current = new window.google.maps.Polyline({
              path: [origin, dest],
              geodesic: true,
              strokeColor: '#2563eb',
              strokeOpacity: 0.75,
              strokeWeight: 4,
            });
            polylineRef.current.setMap(map);
          }
        }
      );
    } else if (typeof destinationLatitude === 'number' && typeof destinationLongitude === 'number') {
      map.setCenter({ lat: destinationLatitude, lng: destinationLongitude });
      map.setZoom(14);
    }
  }, [mapLoaded, loadError, destinationLatitude, destinationLongitude, agentLatitude, agentLongitude, agentName, destinationAddress, agentAccuracy]);

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
              {isLiveTrackingActive && agentLatitude && !isLocationOutdated ? (
                <span style={{ color: '#16a34a', fontWeight: 700 }}>
                  ● Real-time GPS Tracking Active
                </span>
              ) : isLocationOutdated ? (
                <span style={{ color: '#d97706', fontWeight: 600 }}>
                  ⚠️ Location may be outdated. Last updated: {new Date(lastUpdatedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              ) : agentLatitude ? (
                'Last known location reported'
              ) : (
                'Waiting for the delivery agent to share their location.'
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
            height: '440px',
            minHeight: '380px',
            backgroundColor: '#f1f5f9',
            position: 'relative',
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
              borderRadius: '14px',
              border: `1.5px solid ${loadError ? '#fecaca' : '#fed7aa'}`,
              padding: '1.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: loadError ? '#fef2f2' : '#fff7ed',
                  color: loadError ? '#dc2626' : '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0,
                  border: `1.5px solid ${loadError ? '#fecaca' : '#fed7aa'}`,
                }}
              >
                {loadError ? '⚠️' : '📍'}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 800, color: loadError ? '#b91c1c' : '#0f172a' }}>
                  {loadError ? 'Google Maps Configuration Error' : 'Google Maps API key is not configured.'}
                </h4>
                <p style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.55 }}>
                  {loadError
                    ? loadError
                    : 'Interactive Google Maps delivery tracking requires a Google Maps JavaScript API key. To view live vector maps and driving directions on this screen, add your key to frontend/.env.local.'}
                </p>

                <div
                  style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.84rem',
                    fontFamily: 'monospace',
                    color: '#334155',
                    marginBottom: '0.85rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  # In frontend/.env.local:<br />
                  VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  <strong>Required Google Cloud Setup:</strong><br />
                  1. Enable <strong>Maps JavaScript API</strong> & <strong>Directions API</strong> in Google Cloud Console.<br />
                  2. Add HTTP Referrer restrictions for local development: <code>http://localhost:5173/*</code>.<br />
                  3. Restart the Vite development server after adding your key to <code>.env.local</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Coordinates & Telemetry Monitor Strip */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          fontSize: '0.85rem',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        {/* Customer Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem', color: '#2563eb' }}>🏠</span>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              CUSTOMER DESTINATION
            </span>
            <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
              {typeof destinationLatitude === 'number' && typeof destinationLongitude === 'number'
                ? `${destinationLatitude.toFixed(4)}° N, ${destinationLongitude.toFixed(4)}° E`
                : 'Address Registered'}
            </strong>
          </div>
        </div>

        {/* Agent Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem', color: '#ea580c' }}>🛵</span>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              DELIVERY AGENT (LATEST GPS)
            </span>
            <strong style={{ color: agentLatitude ? '#0f172a' : '#94a3b8', fontSize: '0.92rem' }}>
              {typeof agentLatitude === 'number' && typeof agentLongitude === 'number'
                ? `${agentLatitude.toFixed(4)}° N, ${agentLongitude.toFixed(4)}° E`
                : 'Waiting for the delivery agent to share their location.'}
            </strong>
          </div>
        </div>

        {/* Route / Distance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem', color: '#16a34a' }}>📏</span>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              DISTANCE TO DESTINATION
            </span>
            <strong style={{ color: '#16a34a', fontSize: '0.92rem' }}>
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

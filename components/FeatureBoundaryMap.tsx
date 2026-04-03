import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as L from 'leaflet';
import { ProjectFeature } from '../types';
import { Layers, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const CSDI_SLOPE_API = 'https://portal.csdi.gov.hk/server/rest/services/cedd/cedd_rcd_1636517655915_91216/MapServer/0/query';

interface BoundaryData {
  rings: L.LatLngExpression[][];
  attributes: Record<string, any>;
}

async function fetchSlopeBoundary(featureNo: string): Promise<BoundaryData | null> {
  try {
    const params = new URLSearchParams({
      where: `SLOPE_NO='${featureNo}'`,
      outFields: '*',
      f: 'json',
      returnGeometry: 'true',
      outSR: '4326',
    });
    const res = await fetch(`${CSDI_SLOPE_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;
    const feat = data.features[0];
    const geom = feat.geometry;
    if (geom.rings) {
      return {
        rings: geom.rings.map((ring: number[][]) =>
          ring.map(([lng, lat]: number[]) => [lat, lng] as L.LatLngExpression)
        ),
        attributes: feat.attributes || {},
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Extract MR from CSDI attributes (try common field names), fallback to remarks
function getMR(attrs: Record<string, any>, remarks?: string): string {
  // CSDI common field names for maintenance responsibility
  const mrFields = ['MAINT_AGENT', 'MR', 'MAINT_RESP', 'MAINTENANCE_AGENT', 'MR_CODE'];
  for (const field of mrFields) {
    if (attrs[field]) return String(attrs[field]).trim();
  }
  // Fallback: parse from remarks
  if (!remarks) return 'Unknown';
  const match = remarks.match(/MR:\s*([^;]+)/i);
  return match ? match[1].trim() : 'Unknown';
}

// Extract land status from CSDI attributes, fallback to remarks
function getLandStatus(attrs: Record<string, any>, remarks?: string): string {
  // CSDI common field names for land ownership / status
  const landFields = ['LAND_STATUS', 'OWNERSHIP', 'LAND_TYPE', 'LOT_TYPE'];
  for (const field of landFields) {
    if (attrs[field]) {
      const val = String(attrs[field]).toLowerCase();
      if (val.includes('private')) return 'Private';
      if (val.includes('government') || val.includes('govt')) return 'Government';
      return String(attrs[field]).trim();
    }
  }
  // Fallback: parse from remarks
  if (!remarks) return 'Government';
  const lower = remarks.toLowerCase();
  if (lower.includes('private lot') || lower.includes('private land')) return 'Private';
  if (lower.includes('private')) return 'Partly Private';
  return 'Government';
}

// Extract height from CSDI attributes, fallback to remarks
function getHeight(attrs: Record<string, any>, remarks?: string): string {
  const heightFields = ['MAX_HEIGHT', 'HEIGHT', 'SLOPE_HEIGHT'];
  for (const field of heightFields) {
    if (attrs[field] != null) return `${attrs[field]}m`;
  }
  if (!remarks) return '-';
  const match = remarks.match(/Height:\s*([^;]+)/i);
  return match ? match[1].trim() : '-';
}

// Extract length from CSDI attributes, fallback to remarks
function getLength(attrs: Record<string, any>, remarks?: string): string {
  const lenFields = ['LENGTH', 'SLOPE_LENGTH', 'CREST_LENGTH'];
  for (const field of lenFields) {
    if (attrs[field] != null) return `${attrs[field]}m`;
  }
  if (!remarks) return '-';
  const match = remarks.match(/Length:\s*([^;]+)/i);
  return match ? match[1].trim() : '-';
}

// Extract additional slope info from CSDI attributes
function getSlopeType(attrs: Record<string, any>): string {
  return attrs['SLOPE_TYPE'] || attrs['FEATURE_TYPE'] || attrs['TYPE'] || '-';
}

function getDistrict(attrs: Record<string, any>): string {
  return attrs['DISTRICT'] || attrs['DISTRICT_NAME'] || '';
}

function getGradient(attrs: Record<string, any>): string {
  if (attrs['GRADIENT'] != null) return String(attrs['GRADIENT']);
  if (attrs['SLOPE_ANGLE'] != null) return `${attrs['SLOPE_ANGLE']}°`;
  return '-';
}

const MR_COLORS: Record<string, string> = {
  'LandsD': '#3b82f6',
  'HyD': '#f59e0b',
  'WSD': '#06b6d4',
  'ArchSD': '#8b5cf6',
  'DSD': '#ec4899',
  'AFCD': '#22c55e',
  'LCSD': '#14b8a6',
  'Unknown': '#6b7280',
};

function getMRColor(mr: string): string {
  for (const [key, color] of Object.entries(MR_COLORS)) {
    if (mr.includes(key)) return color;
  }
  return MR_COLORS['Unknown'];
}

const LAND_COLORS: Record<string, string> = {
  'Private': '#ef4444',
  'Partly Private': '#f97316',
  'Government': '#22c55e',
};

interface FeatureBoundaryMapProps {
  data: ProjectFeature[];
}

const FeatureBoundaryMap: React.FC<FeatureBoundaryMapProps> = ({ data }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const polygonsRef = useRef<{ [id: string]: L.Polygon }>({});
  const labelsRef = useRef<{ [id: string]: L.Marker }>({});
  const mrTooltipsRef = useRef<{ [id: string]: L.Marker }>({});
  const landTooltipsRef = useRef<{ [id: string]: L.Marker }>({});
  const topoLayerRef = useRef<L.TileLayer | null>(null);
  const orthoLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryCache = useRef<{ [featureNo: string]: BoundaryData | null }>({});
  const featureInfoRef = useRef<{ [id: string]: { mr: string; landStatus: string; mrColor: string; landColor: string } }>({});

  const [showOrtho, setShowOrtho] = useState(false);
  const [showMR, setShowMR] = useState(false);
  const [showLandStatus, setShowLandStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState<ProjectFeature | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([22.38, 114.05], 11);

    L.control.zoom({ position: 'topleft' }).addTo(map);

    const attr = '&copy; <a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank">Map from Lands Department</a>';

    topoLayerRef.current = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/wgs84/{z}/{x}/{y}.png', {
      attribution: attr, maxZoom: 19,
    });
    orthoLayerRef.current = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/imagery/wgs84/{z}/{x}/{y}.png', {
      attribution: attr, maxZoom: 19,
    });
    labelLayerRef.current = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/en/wgs84/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });

    topoLayerRef.current.addTo(map);
    labelLayerRef.current.addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Basemap toggle
  useEffect(() => {
    if (!mapRef.current || !topoLayerRef.current || !orthoLayerRef.current || !labelLayerRef.current) return;
    const map = mapRef.current;
    if (showOrtho) {
      if (map.hasLayer(topoLayerRef.current)) map.removeLayer(topoLayerRef.current);
      orthoLayerRef.current.addTo(map);
    } else {
      if (map.hasLayer(orthoLayerRef.current)) map.removeLayer(orthoLayerRef.current);
      topoLayerRef.current.addTo(map);
    }
    if (!map.hasLayer(labelLayerRef.current)) labelLayerRef.current.addTo(map);
  }, [showOrtho]);

  // Fetch and render boundaries
  const loadBoundaries = useCallback(async () => {
    if (!mapRef.current || data.length === 0) return;
    const map = mapRef.current;

    setLoading(true);
    setLoadedCount(0);
    setFailedCount(0);

    // Clear existing
    Object.values(polygonsRef.current).forEach(p => p.remove());
    Object.values(labelsRef.current).forEach(l => l.remove());
    Object.values(mrTooltipsRef.current).forEach(t => t.remove());
    Object.values(landTooltipsRef.current).forEach(t => t.remove());
    polygonsRef.current = {};
    labelsRef.current = {};
    mrTooltipsRef.current = {};
    landTooltipsRef.current = {};

    let loaded = 0;
    let failed = 0;
    const allBounds: L.LatLngBounds[] = [];

    // Batch fetch with concurrency limit
    const batchSize = 5;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (feature) => {
          if (boundaryCache.current[feature.featureNo] !== undefined) {
            return { feature, boundary: boundaryCache.current[feature.featureNo] };
          }
          const boundary = await fetchSlopeBoundary(feature.featureNo);
          boundaryCache.current[feature.featureNo] = boundary;
          return { feature, boundary };
        })
      );

      for (const { feature, boundary } of results) {
        const attrs = boundary?.attributes || {};
        const mr = getMR(attrs, feature.remarks);
        const landStatus = getLandStatus(attrs, feature.remarks);
        const mrColor = getMRColor(mr);
        const landColor = LAND_COLORS[landStatus] || LAND_COLORS['Government'];
        const height = getHeight(attrs, feature.remarks);
        const length = getLength(attrs, feature.remarks);
        const slopeType = getSlopeType(attrs);
        const district = getDistrict(attrs);
        const gradient = getGradient(attrs);

        // Store resolved info for toggle effects
        featureInfoRef.current[feature.id] = { mr, landStatus, mrColor, landColor };

        if (boundary) {
          loaded++;

          const polygon = L.polygon(boundary.rings, {
            color: '#4f46e5',
            weight: 2,
            fillColor: '#4f46e5',
            fillOpacity: 0.15,
          }).addTo(map);

          const extraRows = [
            slopeType !== '-' ? `<div><strong class="text-gray-900">Type:</strong> ${slopeType}</div>` : '',
            district ? `<div><strong class="text-gray-900">District:</strong> ${district}</div>` : '',
            gradient !== '-' ? `<div><strong class="text-gray-900">Gradient:</strong> ${gradient}</div>` : '',
          ].filter(Boolean).join('\n');

          polygon.bindPopup(`
            <div class="font-sans min-w-[260px]">
              <h3 class="font-bold text-sm text-gray-800 border-b pb-2 mb-2">${feature.featureNo}</h3>
              <div class="space-y-1.5 text-xs text-gray-600">
                <div><strong class="text-gray-900">Location:</strong> ${feature.location}</div>
                <div class="grid grid-cols-2 gap-2">
                  <div><strong class="text-gray-900">MR:</strong> <span style="color:${mrColor};font-weight:600">${mr}</span></div>
                  <div><strong class="text-gray-900">Land:</strong> <span style="color:${landColor};font-weight:600">${landStatus}</span></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div><strong class="text-gray-900">Height:</strong> ${height}</div>
                  <div><strong class="text-gray-900">Length:</strong> ${length}</div>
                </div>
                ${extraRows}
                ${feature.remarks ? `<div class="mt-1 pt-1 border-t text-[10px] text-gray-500">${feature.remarks}</div>` : ''}
              </div>
            </div>
          `);

          polygon.on('click', () => setSelectedFeature(feature));

          polygonsRef.current[feature.id] = polygon;
          allBounds.push(polygon.getBounds());

          // Feature number label at polygon center
          const center = polygon.getBounds().getCenter();
          const label = L.marker(center, {
            icon: L.divIcon({
              className: 'feature-label',
              html: `<div style="
                background: rgba(79,70,229,0.9);
                color: white;
                padding: 1px 5px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 600;
                white-space: nowrap;
                border: 1px solid rgba(255,255,255,0.5);
                text-shadow: 0 1px 1px rgba(0,0,0,0.3);
              ">${feature.featureNo}</div>`,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            }),
            interactive: false,
          }).addTo(map);
          labelsRef.current[feature.id] = label;

          // MR tooltip (hidden by default)
          const mrMarker = L.marker(center, {
            icon: L.divIcon({
              className: 'mr-label',
              html: `<div style="
                background: ${mrColor};
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                white-space: nowrap;
                margin-top: 16px;
                border: 1px solid rgba(255,255,255,0.6);
              ">MR: ${mr}</div>`,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            }),
            interactive: false,
          });
          mrTooltipsRef.current[feature.id] = mrMarker;

          // Land status tooltip (hidden by default)
          const landMarker = L.marker(center, {
            icon: L.divIcon({
              className: 'land-label',
              html: `<div style="
                background: ${landColor};
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                white-space: nowrap;
                margin-top: 32px;
                border: 1px solid rgba(255,255,255,0.6);
              ">${landStatus}</div>`,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            }),
            interactive: false,
          });
          landTooltipsRef.current[feature.id] = landMarker;
        } else {
          failed++;
          // Show marker at coordinates for features without CSDI boundary
          const marker = L.marker([feature.coordinates.lat, feature.coordinates.lng], {
            icon: L.divIcon({
              className: 'feature-label-fallback',
              html: `<div style="
                background: rgba(107,114,128,0.85);
                color: white;
                padding: 1px 5px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 600;
                white-space: nowrap;
                border: 1px solid rgba(255,255,255,0.4);
              ">${feature.featureNo}</div>`,
              iconSize: [0, 0],
              iconAnchor: [0, -10],
            }),
          }).addTo(map);

          marker.bindPopup(`
            <div class="font-sans min-w-[220px]">
              <h3 class="font-bold text-sm text-gray-800 border-b pb-2 mb-2">${feature.featureNo}</h3>
              <div class="text-xs text-amber-600 mb-2">Boundary not available from CSDI</div>
              <div class="space-y-1.5 text-xs text-gray-600">
                <div><strong class="text-gray-900">Location:</strong> ${feature.location}</div>
                <div><strong class="text-gray-900">MR:</strong> ${mr}</div>
                <div><strong class="text-gray-900">Land:</strong> ${landStatus}</div>
              </div>
            </div>
          `);
          marker.on('click', () => setSelectedFeature(feature));
          labelsRef.current[feature.id] = marker;
        }
      }

      setLoadedCount(loaded);
      setFailedCount(failed);
    }

    // Fit bounds if we have polygons
    if (allBounds.length > 0) {
      const combined = allBounds.reduce((acc, b) => acc.extend(b), L.latLngBounds(allBounds[0].getSouthWest(), allBounds[0].getNorthEast()));
      map.fitBounds(combined, { padding: [40, 40] });
    }

    setLoading(false);
  }, [data]);

  useEffect(() => {
    loadBoundaries();
  }, [loadBoundaries]);

  // Toggle MR labels
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    Object.entries(mrTooltipsRef.current).forEach(([id, marker]) => {
      if (showMR) {
        marker.addTo(map);
      } else {
        marker.remove();
      }
    });

    // Update polygon colors based on MR when toggled
    if (showMR) {
      Object.entries(polygonsRef.current).forEach(([id, polygon]) => {
        const info = featureInfoRef.current[id];
        if (info) {
          polygon.setStyle({ color: info.mrColor, fillColor: info.mrColor, fillOpacity: 0.25, weight: 2.5 });
        }
      });
    } else if (!showLandStatus) {
      Object.values(polygonsRef.current).forEach(polygon => {
        polygon.setStyle({ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.15, weight: 2 });
      });
    }
  }, [showMR, showLandStatus]);

  // Toggle land status labels
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    Object.entries(landTooltipsRef.current).forEach(([id, marker]) => {
      if (showLandStatus) {
        marker.addTo(map);
      } else {
        marker.remove();
      }
    });

    // Update polygon colors based on land status when toggled
    if (showLandStatus && !showMR) {
      Object.entries(polygonsRef.current).forEach(([id, polygon]) => {
        const info = featureInfoRef.current[id];
        if (info) {
          polygon.setStyle({ color: info.landColor, fillColor: info.landColor, fillOpacity: 0.25, weight: 2.5 });
        }
      });
    } else if (!showMR) {
      Object.values(polygonsRef.current).forEach(polygon => {
        polygon.setStyle({ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.15, weight: 2 });
      });
    }
  }, [showLandStatus, showMR]);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Map container */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Loading boundaries... {loadedCount}/{data.length}
            </span>
          </div>
        )}

        {/* Controls panel - top right */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          {/* Basemap toggle */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-1 flex items-center">
            <button
              onClick={() => setShowOrtho(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${!showOrtho ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Map
            </button>
            <button
              onClick={() => setShowOrtho(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${showOrtho ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              Satellite
            </button>
          </div>

          {/* Layer toggles */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-2.5 space-y-2 min-w-[180px]">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Overlay Layers</p>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showMR}
                onChange={(e) => setShowMR(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">MR Info</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showLandStatus}
                onChange={(e) => setShowLandStatus(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">Land Status</span>
            </label>
          </div>

          {/* Legend */}
          {showMR && (
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-2.5 space-y-1.5 min-w-[180px]">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">MR Legend</p>
              {Object.entries(MR_COLORS).filter(([k]) => k !== 'Unknown').map(([name, color]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                  <span className="text-[11px] text-gray-600">{name}</span>
                </div>
              ))}
            </div>
          )}

          {showLandStatus && (
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-2.5 space-y-1.5 min-w-[180px]">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Land Status Legend</p>
              {Object.entries(LAND_COLORS).map(([name, color]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                  <span className="text-[11px] text-gray-600">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats bar - bottom */}
        {!loading && loadedCount > 0 && (
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 px-3 py-2 flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              <span className="font-semibold text-indigo-600">{loadedCount}</span> boundaries loaded
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                {failedCount} not found
              </span>
            )}
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">{data.length} total features</span>
          </div>
        )}
      </div>

      {/* Selected feature detail panel */}
      {selectedFeature && (
        <div className="absolute bottom-4 right-4 z-[500] bg-white rounded-xl shadow-xl border border-gray-200 w-[320px] max-h-[300px] overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-800">{selectedFeature.featureNo}</h3>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              {(() => {
                const info = featureInfoRef.current[selectedFeature.id];
                const mr = info?.mr || 'Unknown';
                const landStatus = info?.landStatus || 'Government';
                const mrColor = info?.mrColor || '#6b7280';
                const landColor = info?.landColor || '#22c55e';
                return (
                  <>
                    <div><strong className="text-gray-900">Location:</strong> {selectedFeature.location}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <strong className="text-gray-900">MR:</strong>{' '}
                        <span style={{ color: mrColor, fontWeight: 600 }}>{mr}</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">Land:</strong>{' '}
                        <span style={{ color: landColor, fontWeight: 600 }}>{landStatus}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
              <div className="grid grid-cols-2 gap-2">
                <div><strong className="text-gray-900">S3R:</strong> {selectedFeature.s3rStatus}</div>
                <div><strong className="text-gray-900">STLA:</strong> {selectedFeature.stlaXpStatus}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><strong className="text-gray-900">Access:</strong> {selectedFeature.accessPermission}</div>
                <div><strong className="text-gray-900">HSSP:</strong> {selectedFeature.hsspStatus}</div>
              </div>
              {selectedFeature.remarks && (
                <div className="mt-1 pt-2 border-t">
                  <strong className="text-gray-900">Remarks:</strong> {selectedFeature.remarks}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureBoundaryMap;

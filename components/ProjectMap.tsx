import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { ProjectFeature } from '../types';

interface ProjectMapProps {
  data: ProjectFeature[];
  selectedId: string | null;
  onSelectFeature: (id: string) => void;
}

const ProjectMap: React.FC<ProjectMapProps> = ({ data, selectedId, onSelectFeature }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([22.38, 114.05], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const selectedIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const getStatusClass = (status: string) => {
      switch (status) {
        case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
        case 'draft': return 'bg-stone-100 text-stone-600 border-stone-200';
        default: return 'bg-gray-100 text-gray-500 border-gray-200';
      }
    };

    data.forEach(feature => {
      const isSelected = feature.id === selectedId;

      if (markersRef.current[feature.id]) {
        const marker = markersRef.current[feature.id];
        marker.setIcon(isSelected ? selectedIcon : defaultIcon);
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      } else {
        const marker = L.marker(
          [feature.coordinates.lat, feature.coordinates.lng],
          {
            icon: isSelected ? selectedIcon : defaultIcon,
            zIndexOffset: isSelected ? 1000 : 0,
          }
        )
          .addTo(mapRef.current!)
          .bindPopup(`
          <div class="font-sans min-w-[280px] max-w-[320px]">
            <h3 class="font-bold text-sm text-gray-800 border-b pb-2 mb-2">${feature.featureNo}</h3>

            <div class="space-y-2 text-xs text-gray-600 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
              <div>
                <strong class="text-gray-900 block mb-0.5">Location:</strong>
                ${feature.location}
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <strong class="text-gray-900 block mb-0.5">S3R:</strong>
                  <span class="inline-block px-1.5 py-0.5 rounded-full text-[10px] border mb-1 ${getStatusClass(feature.s3rCategory)}">${feature.s3rCategory}</span>
                  <div class="text-[10px] leading-tight">${feature.s3rStatus}</div>
                </div>
                <div>
                  <strong class="text-gray-900 block mb-0.5">STLA/XP:</strong>
                  <span class="inline-block px-1.5 py-0.5 rounded-full text-[10px] border mb-1 ${getStatusClass(feature.stlaCategory)}">${feature.stlaCategory}</span>
                  <div class="text-[10px] leading-tight">${feature.stlaXpStatus}</div>
                </div>
              </div>

              <div>
                <strong class="text-gray-900">Access:</strong> ${feature.accessPermission}
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <strong class="text-gray-900">Eng. Plan:</strong><br/>${feature.engineeringPlan}
                </div>
                <div>
                  <strong class="text-gray-900">TPRP TWVP:</strong><br/>${feature.tprpTwvp}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <strong class="text-gray-900">TPRP MR:</strong> ${feature.tprpMr}
                </div>
                <div>
                  <strong class="text-gray-900">HSSP:</strong> ${feature.hsspStatus}
                </div>
              </div>

              ${feature.remarks ? `<div><strong class="text-gray-900">Remarks:</strong> ${feature.remarks}</div>` : ''}
            </div>

            <div class="mt-3 pt-2 border-t flex flex-col gap-2">
              <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${feature.coordinates.lat},${feature.coordinates.lng}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors no-underline">
                Open Street View
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=${feature.coordinates.lat},${feature.coordinates.lng}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded transition-colors no-underline">
                View on Google Maps
              </a>
            </div>
          </div>
        `);

        marker.on('click', () => {
          onSelectFeature(feature.id);
        });

        markersRef.current[feature.id] = marker;
      }
    });

    Object.keys(markersRef.current).forEach(id => {
      if (!data.find(d => d.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [data, selectedId, onSelectFeature]);

  useEffect(() => {
    if (selectedId && mapRef.current && markersRef.current[selectedId]) {
      const marker = markersRef.current[selectedId];
      mapRef.current.setView(marker.getLatLng(), 15, { animate: true });
      marker.openPopup();
    }
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default ProjectMap;

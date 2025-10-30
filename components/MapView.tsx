import React, { useState, useMemo } from 'react';
import { Station, StationStatus, QueueLength } from '../types';
import { MapPinIcon, ClockIcon, CrosshairsIcon, SearchIcon, PlusIcon, MinusIcon } from './icons';

interface MapViewProps {
    stations: Station[];
    highlightedStationId: number | null;
    onFindNearby: () => void;
}

interface Cluster {
  id: string;
  stations: Station[];
  center: { lat: number; lon: number };
}

// Bounding box for Bamako for coordinate normalization
const BBOX = {
    minLat: 12.55,
    maxLat: 12.70,
    minLon: -8.10,
    maxLon: -7.90,
};

const normalizeCoords = (lat: number, lon: number) => {
    const y = ((lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * 100;
    const x = ((lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * 100;
    return { top: `${100 - y}%`, left: `${x}%` };
};

const getPinColor = (status: StationStatus) => {
    switch (status) {
        case StationStatus.AVAILABLE: return 'text-mali-green';
        case StationStatus.UNAVAILABLE: return 'text-mali-red';
        case StationStatus.CLOSED: return 'text-gray-600';
    }
}

const getQueueColor = (queue: QueueLength) => {
    switch (queue) {
        case QueueLength.SHORT: return 'bg-mali-green text-white';
        case QueueLength.MEDIUM: return 'bg-yellow-500 text-white';
        case QueueLength.LONG: return 'bg-mali-red text-white';
        default: return 'bg-gray-200 text-gray-600';
    }
};

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
};

const StationPin: React.FC<{ station: Station; onSelect: (station: Station) => void; isHighlighted: boolean }> = ({ station, onSelect, isHighlighted }) => {
    const { top, left } = normalizeCoords(station.location.lat, station.location.lon);
    
    return (
        <button
            onClick={() => onSelect(station)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none z-10"
            style={{ top, left }}
            title={station.name}
        >
            <MapPinIcon className={`w-8 h-8 drop-shadow-lg transition-all duration-300 ${getPinColor(station.status)} ${isHighlighted ? 'scale-150' : 'hover:scale-125'}`} />
            {isHighlighted && <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-mali-yellow/30 rounded-full -z-10 animate-ping"></div>}
        </button>
    )
};

const ClusterPin: React.FC<{ cluster: Cluster, onZoomIn: () => void }> = ({ cluster, onZoomIn }) => {
    const { top, left } = normalizeCoords(cluster.center.lat, cluster.center.lon);
    const size = 36 + Math.log2(cluster.stations.length) * 4;
    return (
        <button
            onClick={onZoomIn}
            className="absolute transform -translate-x-1/2 -translatey-1/2 rounded-full bg-gradient-to-br from-mali-yellow to-mali-red text-white font-bold flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 z-10"
            style={{ top, left, width: `${size}px`, height: `${size}px`, fontSize: `${12 + Math.log2(cluster.stations.length)}px` }}
            title={`${cluster.stations.length} stations`}
        >
            {cluster.stations.length}
        </button>
    );
};


const InfoPopup: React.FC<{ station: Station; onClose: () => void }> = ({ station, onClose }) => (
    <div className="absolute top-4 left-4 right-4 sm:left-auto sm:top-28 sm:right-4 bg-white p-4 rounded-2xl shadow-2xl w-auto sm:w-80 z-20 border animate-fade-in-up">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 pr-4">{station.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mt-1">{station.address}</p>
        <div className="mt-3 space-y-2 text-sm">
             <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">Statut:</span>
                <span className={`font-bold ${station.status === StationStatus.AVAILABLE ? 'text-mali-green' : station.status === StationStatus.UNAVAILABLE ? 'text-mali-red' : 'text-gray-500'}`}>{station.status}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">File:</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getQueueColor(station.queue)}`}>
                    {station.queue}
                    {station.queueSize != null && station.queueSize > 0 && ` (~${station.queueSize} pers.)`}
                </span>
            </div>
        </div>
        <div className="mt-3 pt-2 border-t flex items-center text-xs text-gray-400">
            <ClockIcon className="w-3.5 h-3.5 mr-1.5"/>
            <span>MàJ: {formatTimeAgo(station.lastUpdate)}</span>
        </div>
        <div className="mt-4">
            <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-mali-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                aria-label={`Itinéraire vers ${station.name}`}
            >
                Itinéraire
            </a>
        </div>
    </div>
);

const FilterButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            active ? 'bg-white text-gray-900 shadow-md' : 'bg-transparent text-gray-600 hover:bg-white/60'
        }`}
    >
        {children}
    </button>
);


export const MapView: React.FC<MapViewProps> = ({ stations, highlightedStationId, onFindNearby }) => {
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [zoomLevel, setZoomLevel] = useState(3); // Zoom scale 1 (out) to 5 (in)
    const [availabilityFilter, setAvailabilityFilter] = useState<'all' | StationStatus.AVAILABLE>('all');
    const [queueFilter, setQueueFilter] = useState<'all' | QueueLength.SHORT | QueueLength.MEDIUM>('all');

    const handleZoomIn = () => setZoomLevel(z => Math.min(z + 1, 5));
    const handleZoomOut = () => setZoomLevel(z => Math.max(z - 1, 1));
    const handleSelectStation = (station: Station) => setSelectedStation(station);

    const filteredStations = useMemo(() =>
        stations.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.address.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesAvailability = availabilityFilter === 'all' || s.status === availabilityFilter;
            
            const matchesQueue = queueFilter === 'all' || s.queue === queueFilter;
            
            return matchesSearch && matchesAvailability && matchesQueue;
        }),
    [stations, searchTerm, availabilityFilter, queueFilter]);

    const clusteredData = useMemo(() => {
        const ZOOM_LEVEL_DISTANCE_MAP: { [key: number]: number } = { 1: 15, 2: 10, 3: 7, 4: 4, 5: 0 };
        const clusterDistance = ZOOM_LEVEL_DISTANCE_MAP[zoomLevel];

        if (clusterDistance === 0) return filteredStations;

        const points = filteredStations.map(s => ({ ...s, pos: normalizeCoords(s.location.lat, s.location.lon) }));
        const clusteredIds = new Set<number>();
        const finalData: (Station | Cluster)[] = [];

        for (const point of points) {
            if (clusteredIds.has(point.id)) continue;

            const clusterMembers = [point];
            
            for (const otherPoint of points) {
                if (point.id === otherPoint.id || clusteredIds.has(otherPoint.id)) continue;
                
                const p1 = { x: parseFloat(point.pos.left), y: parseFloat(point.pos.top) };
                const p2 = { x: parseFloat(otherPoint.pos.left), y: parseFloat(otherPoint.pos.top) };
                const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

                if (distance < clusterDistance) {
                    clusterMembers.push(otherPoint);
                }
            }
            
            if (clusterMembers.length > 1) {
                clusterMembers.forEach(m => clusteredIds.add(m.id));
                const centerLat = clusterMembers.reduce((sum, s) => sum + s.location.lat, 0) / clusterMembers.length;
                const centerLon = clusterMembers.reduce((sum, s) => sum + s.location.lon, 0) / clusterMembers.length;
                finalData.push({
                    id: `cluster-${centerLat}-${centerLon}`,
                    stations: clusterMembers.map(({pos, ...rest}) => rest),
                    center: { lat: centerLat, lon: centerLon }
                });
            } else {
                finalData.push(point);
            }
        }
        return finalData;
    }, [filteredStations, zoomLevel]);

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] bg-gray-200 rounded-2xl shadow-lg overflow-hidden border-4 border-white">
            {/* Map Controls */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou adresse..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-transparent focus:border-mali-green focus:ring-0 transition"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg h-12">
                         <button onClick={handleZoomOut} disabled={zoomLevel === 1} className="p-3 text-gray-600 disabled:text-gray-300 hover:text-black transition"><MinusIcon className="w-5 h-5"/></button>
                         <div className="w-px h-6 bg-gray-200"></div>
                         <button onClick={handleZoomIn} disabled={zoomLevel === 5} className="p-3 text-gray-600 disabled:text-gray-300 hover:text-black transition"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 flex flex-col sm:flex-row flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-700 shrink-0">Statut:</span>
                        <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-xl">
                            <FilterButton active={availabilityFilter === 'all'} onClick={() => setAvailabilityFilter('all')}>Toutes</FilterButton>
                            <FilterButton active={availabilityFilter === StationStatus.AVAILABLE} onClick={() => setAvailabilityFilter(StationStatus.AVAILABLE)}>Disponible</FilterButton>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-700 shrink-0">File d'attente:</span>
                         <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-xl">
                            <FilterButton active={queueFilter === 'all'} onClick={() => setQueueFilter('all')}>Toutes</FilterButton>
                            <FilterButton active={queueFilter === QueueLength.SHORT} onClick={() => setQueueFilter(QueueLength.SHORT)}>Courte</FilterButton>
                            <FilterButton active={queueFilter === QueueLength.MEDIUM} onClick={() => setQueueFilter(QueueLength.MEDIUM)}>Moyenne</FilterButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulated map background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{backgroundImage: "url('https://www.liberation.fr/resizer/dMbsk0p49h27jAEPB_6Yw52-pT4=/1200x630/filters:format(jpg):quality(70)/cloudfront-eu-central-1.images.arcpublishing.com/liberation/4QKY42WJLZBEDHBRG2LQJGPM2U.jpg')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-200 to-transparent"></div>

            {clusteredData.map(item => {
                if ('stations' in item) { // Type guard for Cluster
                    return <ClusterPin key={item.id} cluster={item} onZoomIn={handleZoomIn} />;
                }
                const station = item as Station; // Type assertion for Station
                return <StationPin key={station.id} station={station} onSelect={handleSelectStation} isHighlighted={station.id === highlightedStationId} />;
            })}

            {selectedStation && <InfoPopup station={selectedStation} onClose={() => setSelectedStation(null)} />}
            
            <button
                onClick={onFindNearby}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-gray-800 font-bold py-2 px-4 rounded-full shadow-2xl border-2 border-transparent hover:border-mali-green transition-all transform hover:scale-105 z-10"
            >
                <CrosshairsIcon className="w-5 h-5"/>
                Près de moi
            </button>
        </div>
    );
};
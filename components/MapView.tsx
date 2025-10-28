import React, { useState } from 'react';
import { Station, StationStatus, QueueLength } from '../types';
import { MapPinIcon, ClockIcon, CrosshairsIcon } from './icons';

interface MapViewProps {
    stations: Station[];
    highlightedStationId: number | null;
    onFindNearby: () => void;
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
            className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            style={{ top, left }}
            title={station.name}
        >
            <MapPinIcon className={`w-8 h-8 drop-shadow-lg transition-all duration-300 ${getPinColor(station.status)} ${isHighlighted ? 'scale-150' : 'hover:scale-125'}`} />
            {isHighlighted && <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-mali-yellow/30 rounded-full -z-10 animate-ping"></div>}
        </button>
    )
};

const InfoPopup: React.FC<{ station: Station; onClose: () => void }> = ({ station, onClose }) => (
    <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 bg-white p-4 rounded-2xl shadow-2xl w-auto sm:w-80 z-20 border animate-fade-in-up">
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


export const MapView: React.FC<MapViewProps> = ({ stations, highlightedStationId, onFindNearby }) => {
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);

    const handleSelectStation = (station: Station) => {
        setSelectedStation(station);
    };
    
    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] bg-gray-200 rounded-2xl shadow-lg overflow-hidden border-4 border-white">
            {/* Simulated map background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{backgroundImage: "url('https://www.liberation.fr/resizer/dMbsk0p49h27jAEPB_6Yw52-pT4=/1200x630/filters:format(jpg):quality(70)/cloudfront-eu-central-1.images.arcpublishing.com/liberation/4QKY42WJLZBEDHBRG2LQJGPM2U.jpg')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-200 to-transparent"></div>

            {stations.map(station => (
                <StationPin key={station.id} station={station} onSelect={handleSelectStation} isHighlighted={station.id === highlightedStationId} />
            ))}

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

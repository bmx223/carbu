import React, { useState, useEffect, useCallback } from 'react';
import { Station, StationStatus, QueueLength, FuelType, Report, Commune, IncidentType, IncidentReport } from './types';
import { analyzeFuelTrends } from './services/geminiService';
import { LogoIcon, MapPinIcon, ClockIcon, PlusCircleIcon, CheckBadgeIcon, ListIcon, MapIcon, CrosshairsIcon, FlagIcon, AlertIcon } from './components/icons';
import { Dashboard } from './components/Dashboard';
import { MapView } from './components/MapView';

// Mock Data
const communes: Commune[] = [
    { id: 1, name: 'Commune I' }, { id: 2, name: 'Commune II' }, { id: 3, name: 'Commune III' },
    { id: 4, name: 'Commune IV' }, { id: 5, name: 'Commune V' }, { id: 6, name: 'Commune VI' },
    { id: 7, name: 'Kalaban Coro' }, { id: 8, name: 'Kati' },
];
const initialStations: Station[] = [
  { id: 1, name: 'TotalEnergies ACI 2000', address: 'ACI 2000, Bamako', communeId: 4, communeName: 'Commune IV', location: { lat: 12.63, lon: -8.03 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 10, lastUpdate: new Date(Date.now() - 15 * 60 * 1000), verified: true },
  { id: 2, name: 'Shell Badalabougou', address: 'Badalabougou, Bamako', communeId: 5, communeName: 'Commune V', location: { lat: 12.62, lon: -7.99 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: false }, queue: QueueLength.LONG, queueSize: 75, lastUpdate: new Date(Date.now() - 5 * 60 * 1000) },
  { id: 3, name: 'Oryx Hippodrome', address: 'Hippodrome, Bamako', communeId: 2, communeName: 'Commune II', location: { lat: 12.64, lon: -8.01 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, queueSize: 0, lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: 4, name: 'Star Oil Sotuba', address: 'Sotuba, Bamako', communeId: 1, communeName: 'Commune I', location: { lat: 12.65, lon: -7.95 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true, [FuelType.KEROSENE]: true }, queue: QueueLength.MEDIUM, queueSize: 30, lastUpdate: new Date(Date.now() - 7 * 60 * 60 * 1000), verified: false },
  { id: 5, name: 'BNDA Station Cité du Niger', address: 'Cité du Niger, Bamako', communeId: 1, communeName: 'Commune I', location: { lat: 12.66, lon: -8.02 }, status: StationStatus.CLOSED, fuelAvailability: {}, queue: QueueLength.NONE, queueSize: 0, lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { id: 6, name: 'Total Médina Coura', address: 'Médina Coura, Bamako', communeId: 2, communeName: 'Commune II', location: { lat: 12.6398, lon: -8.0021 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 25, lastUpdate: new Date(Date.now() - 25 * 60 * 1000) },
  { id: 7, name: 'Shell Faladié', address: 'Faladié, Bamako', communeId: 6, communeName: 'Commune VI', location: { lat: 12.59, lon: -7.95 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 8, name: 'Total Niamakoro', address: 'Niamakoro, Bamako', communeId: 6, communeName: 'Commune VI', location: { lat: 12.58, lon: -7.97 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 5, lastUpdate: new Date(Date.now() - 45 * 60 * 1000) },
  { id: 9, name: 'Oryx Magnambougou', address: 'Magnambougou, Bamako', communeId: 6, communeName: 'Commune VI', location: { lat: 12.61, lon: -7.93 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 40, lastUpdate: new Date(Date.now() - 10 * 60 * 1000) },
  { id: 10, name: 'Star Oil Lafiabougou', address: 'Lafiabougou, Bamako', communeId: 4, communeName: 'Commune IV', location: { lat: 12.62, lon: -8.04 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  // --- NOUVELLES STATIONS ---
  // COMMUNE I
  { id: 11, name: 'Sygim énergie Boulkassoumbougou', address: 'Face à l\'hôtel montana', communeId: 1, communeName: 'Commune I', location: { lat: 12.65, lon: -7.98 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 60, lastUpdate: new Date() },
  { id: 12, name: 'Sygim énergie Sotuba', address: 'Près de Sotelco', communeId: 1, communeName: 'Commune I', location: { lat: 12.66, lon: -7.94 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 80, lastUpdate: new Date() },
  { id: 13, name: 'NDC Sotuba', address: 'Face cimetière', communeId: 1, communeName: 'Commune I', location: { lat: 12.655, lon: -7.955 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.MEDIUM, queueSize: 20, lastUpdate: new Date() },
  // COMMUNE II
  { id: 14, name: 'Pretromali Hippodrome II', address: 'Hippodrome II', communeId: 2, communeName: 'Commune II', location: { lat: 12.645, lon: -8.015 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 15, lastUpdate: new Date() },
  { id: 15, name: 'Somayaf Zone Industrielle', address: 'Zone Industrielle et Bougouba', communeId: 2, communeName: 'Commune II', location: { lat: 12.63, lon: -8.00 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.LONG, queueSize: 55, lastUpdate: new Date() },
  // COMMUNE IV
  { id: 16, name: 'Holding Service Sebenicoro', address: 'Sebenicoro', communeId: 4, communeName: 'Commune IV', location: { lat: 12.66, lon: -8.04 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 70, lastUpdate: new Date() },
  { id: 17, name: 'Station Baraka Hamdallaye ACI', address: 'Hamdallaye ACI', communeId: 4, communeName: 'Commune IV', location: { lat: 12.64, lon: -8.03 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, lastUpdate: new Date() },
  // COMMUNE V
  { id: 18, name: 'Nietao Bacodjicoroni', address: 'Bacodjicoroni', communeId: 5, communeName: 'Commune V', location: { lat: 12.61, lon: -7.98 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.MEDIUM, queueSize: 35, lastUpdate: new Date() },
  { id: 19, name: 'Corridor vers lycée Kankou Moussa', address: 'Près du lycée Kankou Moussa', communeId: 5, communeName: 'Commune V', location: { lat: 12.615, lon: -7.985 }, status: StationStatus.CLOSED, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date() },
  { id: 20, name: 'Holdings services Badalabougou', address: 'Badalabougou', communeId: 5, communeName: 'Commune V', location: { lat: 12.625, lon: -7.995 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 8, lastUpdate: new Date() },
  { id: 21, name: 'Stations GYF Golf', address: 'Dernier sapeur pompier Golf', communeId: 5, communeName: 'Commune V', location: { lat: 12.60, lon: -7.99 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date() },
  // COMMUNE VI
  { id: 22, name: 'Yara service Sogoniko', address: 'Sogoniko', communeId: 6, communeName: 'Commune VI', location: { lat: 12.59, lon: -7.96 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.MEDIUM, queueSize: 28, lastUpdate: new Date() },
  { id: 23, name: 'Corridor 1008 logement', address: '1008 logement', communeId: 6, communeName: 'Commune VI', location: { lat: 12.585, lon: -7.955 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 90, lastUpdate: new Date() },
  { id: 24, name: 'Corridor Missabougou', address: 'Missabougou', communeId: 6, communeName: 'Commune VI', location: { lat: 12.60, lon: -7.94 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, lastUpdate: new Date() },
  { id: 25, name: 'Somacif Sirakoro', address: 'Sirakoro', communeId: 6, communeName: 'Commune VI', location: { lat: 12.57, lon: -7.93 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 33, lastUpdate: new Date() },
  { id: 26, name: 'Somacif Senou', address: 'Senou', communeId: 6, communeName: 'Commune VI', location: { lat: 12.55, lon: -7.92 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.SHORT, queueSize: 12, lastUpdate: new Date() },
  { id: 27, name: 'NDC Sirakoro', address: 'Sirakoro', communeId: 6, communeName: 'Commune VI', location: { lat: 12.575, lon: -7.935 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date() },
  { id: 28, name: 'KDF Niamakoro', address: 'Niamakoro', communeId: 6, communeName: 'Commune VI', location: { lat: 12.58, lon: -7.98 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.LONG, queueSize: 65, lastUpdate: new Date() },
  { id: 29, name: 'Holding service Sogoniko', address: 'Sogoniko', communeId: 6, communeName: 'Commune VI', location: { lat: 12.595, lon: -7.965 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 45, lastUpdate: new Date() },
  { id: 30, name: 'Sotraka 1008 logements', address: '1008 logements', communeId: 6, communeName: 'Commune VI', location: { lat: 12.58, lon: -7.95 }, status: StationStatus.UNAVAILABLE, fuelAvailability: {}, queue: QueueLength.LONG, queueSize: 100, lastUpdate: new Date() },
  { id: 31, name: 'Baraka petroleum Missabougou', address: 'À côté de l\'hôpital du Mali', communeId: 6, communeName: 'Commune VI', location: { lat: 12.605, lon: -7.945 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.SHORT, queueSize: 18, lastUpdate: new Date() },
  // KALABAN CORO
  { id: 32, name: 'Shell Kalaban-Coro', address: 'Rentrée de Kalaban-Coro', communeId: 7, communeName: 'Kalaban Coro', location: { lat: 12.58, lon: -7.92 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 22, lastUpdate: new Date() },
  { id: 33, name: 'NDC de Tiebani', address: 'Tiebani', communeId: 7, communeName: 'Kalaban Coro', location: { lat: 12.57, lon: -7.91 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true }, queue: QueueLength.SHORT, lastUpdate: new Date() },
  // KATI
  { id: 34, name: 'NDC Koko Tombo', address: 'Koko Tombo', communeId: 8, communeName: 'Kati', location: { lat: 12.74, lon: -8.07 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.DIESEL]: true }, queue: QueueLength.MEDIUM, queueSize: 38, lastUpdate: new Date() },
  { id: 35, name: 'Holding Service Fouga', address: 'Fouga', communeId: 8, communeName: 'Kati', location: { lat: 12.75, lon: -8.08 }, status: StationStatus.CLOSED, fuelAvailability: {}, queue: QueueLength.NONE, lastUpdate: new Date() },
];
const initialIncidents: IncidentReport[] = [
    { id: 1, stationId: 2, incidentType: IncidentType.ABUSE, description: 'Le pompiste refuse de servir les motos.', reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { id: 2, stationId: 2, incidentType: IncidentType.BLACK_MARKET, description: 'Vente de carburant dans des bidons à prix élevé.', reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 3, stationId: 2, incidentType: IncidentType.ABUSE, description: 'Favoritisme pour les voitures de luxe.', reportedAt: new Date(Date.now() - 30 * 60 * 1000) },
    { id: 4, stationId: 2, incidentType: IncidentType.DISPUTE, description: 'Altercation violente dans la file.', reportedAt: new Date(Date.now() - 10 * 60 * 1000) },
    { id: 5, stationId: 30, incidentType: IncidentType.ABUSE, description: 'Prix non conforme affiché.', reportedAt: new Date(Date.now() - 26 * 60 * 60 * 1000) },
    { id: 6, stationId: 23, incidentType: IncidentType.ABUSE, description: 'Test', reportedAt: new Date(Date.now() - 1 * 60 * 1000) },
    { id: 7, stationId: 23, incidentType: IncidentType.ABUSE, description: 'Test', reportedAt: new Date(Date.now() - 2 * 60 * 1000) },
    { id: 8, stationId: 23, incidentType: IncidentType.ABUSE, description: 'Test', reportedAt: new Date(Date.now() - 3 * 60 * 1000) },
    { id: 9, stationId: 23, incidentType: IncidentType.ABUSE, description: 'Test', reportedAt: new Date(Date.now() - 4 * 60 * 1000) },
];


// Helper functions for styling
const getStatusColor = (status: StationStatus) => {
    switch (status) {
        case StationStatus.AVAILABLE: return 'text-mali-green';
        case StationStatus.UNAVAILABLE: return 'text-mali-red';
        case StationStatus.CLOSED: return 'text-gray-500';
    }
};
const getQueueColor = (queue: QueueLength) => {
    switch (queue) {
        case QueueLength.SHORT: return 'bg-mali-green/20 text-mali-green';
        case QueueLength.MEDIUM: return 'bg-mali-yellow/20 text-yellow-600';
        case QueueLength.LONG: return 'bg-mali-red/20 text-mali-red';
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

const Header: React.FC<{ isAuthenticated: boolean; onLogin: () => void; onLogout: () => void; }> = ({ isAuthenticated, onLogin, onLogout }) => (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <LogoIcon className="w-12 h-12" />
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Faso Carburant</h1>
                    <p className="text-xs md:text-sm text-gray-500">Équité Mali</p>
                </div>
            </div>
            <button onClick={isAuthenticated ? onLogout : onLogin} className="bg-gradient-to-r from-gray-800 to-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-px text-sm">
                {isAuthenticated ? 'Se déconnecter' : 'Espace Propriétaire'}
            </button>
        </div>
    </header>
);

const StationCard: React.FC<{ station: Station; onReport: (station: Station) => void; incidentCount: number; }> = ({ station, onReport, incidentCount }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
        {incidentCount > 3 && (
            <div className="p-2 bg-mali-red/10 text-mali-red text-sm font-semibold flex items-center gap-2 border-b-2 border-mali-red/20">
                <AlertIcon className="w-5 h-5 shrink-0" />
                <span>Zone à Problèmes ({incidentCount} signalements)</span>
            </div>
        )}
        <div className={`p-5 border-l-8 ${station.status === StationStatus.AVAILABLE ? 'border-mali-green' : station.status === StationStatus.UNAVAILABLE ? 'border-mali-red' : 'border-gray-400'} flex-grow`}>
            {station.verified && (
                <div className="flex items-center gap-1.5 text-xs text-mali-green font-semibold mb-2 bg-mali-green/10 px-2 py-1 rounded-full w-fit">
                    <CheckBadgeIcon className="w-4 h-4" />
                    <span>Vérifié par le propriétaire</span>
                </div>
            )}
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 pr-2">{station.name}</h3>
                <span className={`font-semibold text-sm ${getStatusColor(station.status)}`}>{station.status}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPinIcon className="w-4 h-4 mr-2" /> <span>{station.address}</span>
            </div>
            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">File d'attente:</span>
                    <span className={`px-3 py-1 rounded-full font-semibold text-xs ${getQueueColor(station.queue)}`}>
                        {station.queue}
                        {station.queueSize != null && station.queueSize > 0 && ` (~${station.queueSize} pers.)`}
                    </span>
                </div>
                <div className="text-sm">
                    <span className="text-gray-600 font-medium">Carburants disponibles:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {Object.values(FuelType).map(fuel => (<span key={fuel} className={`px-2 py-0.5 text-xs rounded-md ${station.fuelAvailability[fuel] ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-400 line-through'}`}>{fuel}</span>))}
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1.5" /> <span>Dernière MàJ: {formatTimeAgo(station.lastUpdate)}</span>
                </div>
                <button onClick={() => onReport(station)} className="flex items-center gap-1.5 font-semibold text-mali-red hover:text-red-700 transition-colors">
                    <FlagIcon className="w-4 h-4" />
                    Signaler
                </button>
            </div>
        </div>
    </div>
);

const EditStationModal: React.FC<{ station: Station | null; isOpen: boolean; onClose: () => void; onSubmit: (report: Report) => void; }> = ({ station, isOpen, onClose, onSubmit }) => {
    const [status, setStatus] = useState<StationStatus>(StationStatus.AVAILABLE);
    const [queue, setQueue] = useState<QueueLength>(QueueLength.NONE);
    const [queueSize, setQueueSize] = useState<string>('');
    const [fuels, setFuels] = useState<{[key in FuelType]?: boolean}>({});

    useEffect(() => { 
        if (station) { 
            setStatus(station.status); 
            setQueue(station.queue); 
            setFuels(station.fuelAvailability);
            setQueueSize(station.queueSize?.toString() ?? '');
        } 
    }, [station]);
    
    if (!isOpen || !station) return null;

    const handleFuelChange = (fuel: FuelType) => setFuels(prev => ({ ...prev, [fuel]: !prev[fuel] }));
    const handleSubmit = () => { 
        onSubmit({ 
            stationId: station.id, 
            status, 
            queue, 
            queueSize: queueSize ? parseInt(queueSize, 10) : null,
            fuelAvailability: fuels 
        }); 
        onClose(); 
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-800">Modifier la station</h2>
                <p className="text-gray-600 mt-1">{station.name}</p>
                <div className="space-y-6 mt-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <label className="font-semibold text-gray-700">Statut</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as StationStatus)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow">{Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">File d'attente</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">{Object.values(QueueLength).map(q => (<button key={q} onClick={() => setQueue(q)} className={`p-3 rounded-lg text-sm font-medium transition-colors ${queue === q ? 'bg-mali-green text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{q}</button>))}</div>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Nombre de personnes (estimation)</label>
                        <input type="number" value={queueSize} onChange={(e) => setQueueSize(e.target.value)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow" placeholder="Ex: 50" />
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Carburants</label>
                        <div className="space-y-2 mt-2">{Object.values(FuelType).map(f => (<label key={f} className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer"><input type="checkbox" checked={!!fuels[f]} onChange={() => handleFuelChange(f)} className="h-5 w-5 rounded border-gray-300 text-mali-green focus:ring-mali-green"/><span className="ml-3 text-gray-800">{f}</span></label>))}</div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Annuler</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 bg-mali-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">Enregistrer</button>
                </div>
            </div>
        </div>
    );
};

// --- Espace Propriétaire ---
const UpdateStatusIndicator: React.FC<{ lastUpdate: Date }> = ({ lastUpdate }) => {
    const now = new Date();
    const hoursAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    let status: {
        message: string;
        color: string;
        progress: number;
    };

    if (hoursAgo < 2) {
        status = { message: 'Information à jour', color: 'bg-mali-green', progress: 100 };
    } else if (hoursAgo < 6) {
        status = { message: 'Mise à jour recommandée', color: 'bg-mali-yellow', progress: 40 };
    } else {
        status = { message: 'Mise à jour requise', color: 'bg-mali-red', progress: 10 };
    }

    return (
        <div className="w-full sm:w-56 text-sm">
            <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold ${status.color.replace('bg-', 'text-')}`}>{status.message}</span>
                <span className="text-gray-500">{formatTimeAgo(lastUpdate)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${status.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${status.progress}%` }}></div>
            </div>
        </div>
    );
};

const OwnerDashboard: React.FC<{ stations: Station[]; onEdit: (station: Station) => void; onAddStation: () => void; onVerify: (stationId: number) => void; }> = ({ stations, onEdit, onAddStation, onVerify }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestion de mes stations</h2>
                    <p className="text-gray-600 mt-1">Mettez à jour vos stations pour informer la communauté en temps réel.</p>
                </div>
                <button onClick={onAddStation} className="flex items-center justify-center gap-2 text-sm bg-mali-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto shrink-0">
                    <PlusCircleIcon className="w-5 h-5" />
                    Ajouter une station
                </button>
            </div>
            <div className="space-y-4">
                {stations.length > 0 ? stations.map(station => (
                    <div key={station.id} className="p-4 border border-gray-200 rounded-xl flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                        <div className="flex-grow">
                           <h3 className="font-bold text-lg text-gray-900">{station.name}</h3>
                           <p className="text-sm text-gray-500">{station.address}</p>
                           <div className="flex items-center gap-4 mt-2">
                             <span className={`text-sm font-semibold ${getStatusColor(station.status)}`}>{station.status}</span>
                             <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${getQueueColor(station.queue)}`}>
                                {station.queue}
                                {station.queueSize != null && station.queueSize > 0 && ` (~${station.queueSize} pers.)`}
                             </span>
                           </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                           <UpdateStatusIndicator lastUpdate={station.lastUpdate} />
                           {!station.verified && (
                                <button onClick={() => onVerify(station.id)} className="flex items-center justify-center gap-2 bg-mali-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto shrink-0">
                                    <CheckBadgeIcon className="w-5 h-5"/>
                                    Vérifier
                                </button>
                           )}
                           <button onClick={() => onEdit(station)} className="bg-mali-yellow text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors w-full sm:w-auto shrink-0">
                              Modifier
                           </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500">Vous n'avez pas encore de station.</p>
                        <p className="text-gray-500 text-sm">Ajoutez votre première station pour commencer.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

interface NewStationData {
    name: string;
    address: string;
    communeId: number;
    communeName: string;
    status: StationStatus;
    queue: QueueLength;
    queueSize?: number | null;
    fuelAvailability: { [key in FuelType]?: boolean };
}

const AddStationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NewStationData) => void;
    communes: Commune[];
}> = ({ isOpen, onClose, onSubmit, communes }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [communeId, setCommuneId] = useState<number>(communes[0]?.id || 1);
    const [status, setStatus] = useState<StationStatus>(StationStatus.AVAILABLE);
    const [queue, setQueue] = useState<QueueLength>(QueueLength.NONE);
    const [queueSize, setQueueSize] = useState<string>('');
    const [fuels, setFuels] = useState<{[key in FuelType]?: boolean}>({});
    
    if (!isOpen) return null;

    const handleFuelChange = (fuel: FuelType) => setFuels(prev => ({ ...prev, [fuel]: !prev[fuel] }));
    
    const handleSubmit = () => {
        if (!name || !address) {
            alert("Veuillez remplir le nom et l'adresse de la station.");
            return;
        }
        const commune = communes.find(c => c.id === Number(communeId));
        if (!commune) return;

        onSubmit({
            name,
            address,
            communeId: Number(communeId),
            communeName: commune.name,
            status,
            queue,
            queueSize: queueSize ? parseInt(queueSize, 10) : null,
            fuelAvailability: fuels,
        });
        // Reset form
        setName('');
        setAddress('');
        setCommuneId(communes[0]?.id || 1);
        setStatus(StationStatus.AVAILABLE);
        setQueue(QueueLength.NONE);
        setQueueSize('');
        setFuels({});
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-800">Ajouter une Station</h2>
                <p className="text-gray-600 mt-1">Fournissez les informations sur la nouvelle station.</p>
                <div className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <label className="font-semibold text-gray-700">Nom de la station</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow" placeholder="Ex: TotalEnergies ACI 2000" />
                    </div>
                     <div>
                        <label className="font-semibold text-gray-700">Adresse</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow" placeholder="Ex: ACI 2000, Bamako" />
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Commune</label>
                        <select value={communeId} onChange={(e) => setCommuneId(Number(e.target.value))} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow">
                            {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Statut</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as StationStatus)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow">{Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">File d'attente</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">{Object.values(QueueLength).map(q => (<button key={q} onClick={() => setQueue(q)} className={`p-3 rounded-lg text-sm font-medium transition-colors ${queue === q ? 'bg-mali-green text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{q}</button>))}</div>
                    </div>
                     <div>
                        <label className="font-semibold text-gray-700">Nombre de personnes (estimation)</label>
                        <input type="number" value={queueSize} onChange={(e) => setQueueSize(e.target.value)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow" placeholder="Ex: 50" />
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Carburants</label>
                        <div className="space-y-2 mt-2">{Object.values(FuelType).map(f => (<label key={f} className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer"><input type="checkbox" checked={!!fuels[f]} onChange={() => handleFuelChange(f)} className="h-5 w-5 rounded border-gray-300 text-mali-green focus:ring-mali-green"/><span className="ml-3 text-gray-800">{f}</span></label>))}</div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Annuler</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 bg-mali-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">Ajouter la station</button>
                </div>
            </div>
        </div>
    );
};

interface ReportIncidentData {
    stationId: number;
    incidentType: IncidentType;
    description: string;
}

const ReportIncidentModal: React.FC<{
    station: Station | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ReportIncidentData) => void;
}> = ({ station, isOpen, onClose, onSubmit }) => {
    const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.ABUSE);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIncidentType(IncidentType.ABUSE);
            setDescription('');
        }
    }, [isOpen]);

    if (!isOpen || !station) return null;

    const handleSubmit = () => {
        if (!description) {
            alert("Veuillez fournir une description de l'incident.");
            return;
        }
        onSubmit({
            stationId: station.id,
            incidentType,
            description,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-800">Signaler un incident</h2>
                <p className="text-gray-600 mt-1">Station: {station.name}</p>
                <div className="space-y-6 mt-6">
                    <div>
                        <label className="font-semibold text-gray-700">Type d'incident</label>
                        <select value={incidentType} onChange={(e) => setIncidentType(e.target.value as IncidentType)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow">
                            {Object.values(IncidentType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow"
                            rows={4}
                            placeholder="Décrivez ce que vous avez observé..."
                        ></textarea>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Annuler</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 bg-mali-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Envoyer le rapport</button>
                </div>
            </div>
        </div>
    );
};

const GlobalReportIncidentModal: React.FC<{
    stations: Station[];
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ReportIncidentData) => void;
}> = ({ stations, isOpen, onClose, onSubmit }) => {
    const [stationId, setStationId] = useState<number | ''>('');
    const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.ABUSE);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStationId('');
            setIncidentType(IncidentType.ABUSE);
            setDescription('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!stationId) {
            alert("Veuillez sélectionner une station.");
            return;
        }
        if (!description) {
            alert("Veuillez fournir une description de l'incident.");
            return;
        }
        onSubmit({
            stationId: Number(stationId),
            incidentType,
            description,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-800">Signaler un incident</h2>
                <p className="text-gray-600 mt-1">Aidez-nous à maintenir l'équité pour tous.</p>
                <div className="space-y-6 mt-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <label className="font-semibold text-gray-700">Station concernée</label>
                        <select value={stationId} onChange={(e) => setStationId(Number(e.target.value))} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow">
                            <option value="" disabled>-- Sélectionnez une station --</option>
                            {stations.sort((a, b) => a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name} - {s.communeName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Type d'incident</label>
                        <select value={incidentType} onChange={(e) => setIncidentType(e.target.value as IncidentType)} className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow">
                            {Object.values(IncidentType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 block w-full p-3 bg-gray-100 border-transparent rounded-lg focus:ring-mali-yellow focus:border-mali-yellow"
                            rows={4}
                            placeholder="Décrivez ce que vous avez observé..."
                        ></textarea>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Annuler</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 bg-mali-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Envoyer le rapport</button>
                </div>
            </div>
        </div>
    );
};


const ViewSwitcher: React.FC<{ view: 'list' | 'map', setView: (view: 'list' | 'map') => void }> = ({ view, setView }) => (
    <div className="p-1 bg-gray-200 rounded-xl flex w-fit">
        <button onClick={() => setView('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${view === 'list' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'}`}>
            <ListIcon className="w-5 h-5"/> Liste
        </button>
        <button onClick={() => setView('map')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${view === 'map' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'}`}>
            <MapIcon className="w-5 h-5"/> Carte
        </button>
    </div>
);

const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-mali-red text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110 z-30 flex items-center gap-2 animate-fade-in-up"
      aria-label="Signaler un abus"
    >
      <span className="text-2xl" role="img" aria-label="Police car light emoji">🚨</span>
      <span className="font-semibold hidden sm:block">Signaler un Abus</span>
    </button>
);


export default function App() {
    const [stations, setStations] = useState<Station[]>(initialStations);
    const [view, setView] = useState<'dashboard' | 'list' | 'map' | 'owner'>('dashboard');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddStationModalOpen, setAddStationModalOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [trendAnalysis, setTrendAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedCommune, setSelectedCommune] = useState<number | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [ownerStationIds, setOwnerStationIds] = useState([1, 4]); // IDs des stations appartenant au propriétaire
    const [highlightedStationId, setHighlightedStationId] = useState<number | null>(null);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [stationToReport, setStationToReport] = useState<Station | null>(null);
    const [isGlobalReportModalOpen, setGlobalReportModalOpen] = useState(false);
    const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(initialIncidents);

    const handleLogin = () => { setIsAuthenticated(true); setView('owner'); };
    const handleLogout = () => { setIsAuthenticated(false); setView('dashboard'); };

    const handleOpenEditModal = (station: Station) => { setSelectedStation(station); setEditModalOpen(true); };
    const handleCloseEditModal = () => { setSelectedStation(null); setEditModalOpen(false); };
    
    const handleOpenAddStationModal = () => setAddStationModalOpen(true);
    const handleCloseAddStationModal = () => setAddStationModalOpen(false);

    const handleOpenReportModal = (station: Station) => {
        setStationToReport(station);
        setReportModalOpen(true);
    };
    const handleCloseReportModal = () => {
        setStationToReport(null);
        setReportModalOpen(false);
    };

    const handleOpenGlobalReportModal = () => setGlobalReportModalOpen(true);
    const handleCloseGlobalReportModal = () => setGlobalReportModalOpen(false);

    const handleEditSubmit = (report: Report) => {
        setStations(prev => prev.map(s => s.id === report.stationId ? { ...s, ...report, lastUpdate: new Date(), verified: isAuthenticated } : s));
    };
    
    const handleReportSubmit = (data: ReportIncidentData) => {
        const newReport: IncidentReport = {
            id: Date.now(),
            reportedAt: new Date(),
            ...data,
        };
        setIncidentReports(prev => [...prev, newReport]);
        alert("Votre rapport a été envoyé. Merci pour votre contribution à l'équité !");
        handleCloseReportModal();
        handleCloseGlobalReportModal();
    };

    const handleAddStationSubmit = (newStationData: NewStationData) => {
        const newStation: Station = {
            ...newStationData,
            id: Date.now(), // Unique ID based on timestamp
            location: { lat: 12.639, lon: -8.002 }, // Mock location for now
            lastUpdate: new Date(),
            verified: isAuthenticated, // Stations added by owners are automatically verified
        };
        if (isAuthenticated) {
            setOwnerStationIds(prev => [...prev, newStation.id]);
        }
        setStations(prev => [newStation, ...prev]);
        handleCloseAddStationModal();
    };
    
    const handleVerifyStation = (stationId: number) => {
        setStations(prev => prev.map(s => 
            s.id === stationId ? { ...s, verified: true, lastUpdate: new Date() } : s
        ));
    };

    const handleAnalyze = useCallback(async () => {
        setIsAnalyzing(true); setTrendAnalysis(null);
        try {
            const result = await analyzeFuelTrends(stations);
            setTrendAnalysis(result);
        } catch (error) { setTrendAnalysis("Erreur lors de l'analyse."); } 
        finally { setIsAnalyzing(false); }
    }, [stations]);

    const getActiveIncidentCount = useCallback((stationId: number) => {
        const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
        return incidentReports.filter(r => r.stationId === stationId && r.reportedAt.getTime() > fourHoursAgo).length;
    }, [incidentReports]);
    
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const dx = lat2 - lat1;
      const dy = (lon2 - lon1) * Math.cos((lat1 * Math.PI) / 180);
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleFindNearby = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                let closestStation: Station | null = null;
                let minDistance = Infinity;

                stations.forEach(station => {
                    const distance = getDistance(latitude, longitude, station.location.lat, station.location.lon);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestStation = station;
                    }
                });

                if (closestStation) {
                    setHighlightedStationId(closestStation.id);
                    setView('map');
                     setTimeout(() => setHighlightedStationId(null), 3000); // Remove highlight after 3s
                } else {
                    alert("Aucune station trouvée.");
                }
            },
            () => { alert("Impossible de récupérer votre position."); }
        );
    };
    
    const filteredStations = selectedCommune ? stations.filter(s => s.communeId === selectedCommune) : stations;
    const ownerStations = stations.filter(s => ownerStationIds.includes(s.id));

    return (
        <div className="min-h-screen font-sans">
            <Header isAuthenticated={isAuthenticated} onLogin={handleLogin} onLogout={handleLogout} />
            <main className="container mx-auto p-4 md:p-6">
                {view === 'dashboard' && <Dashboard stations={stations} communes={communes} onNavigateToList={() => setView('list')} onNavigateToMap={() => setView('map')} onFindNearby={handleFindNearby} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} trendAnalysis={trendAnalysis} incidentReports={incidentReports} />}
                
                {(view === 'list' || view === 'map') && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            <button onClick={() => setView('dashboard')} className="text-mali-green font-semibold hover:underline flex items-center gap-1 w-fit">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Retour au tableau de bord
                            </button>
                            <ViewSwitcher view={view} setView={(v) => setView(v as 'list' | 'map')} />
                        </div>
                        
                        {view === 'map' && <MapView stations={stations} highlightedStationId={highlightedStationId} onFindNearby={handleFindNearby} />}

                        {view === 'list' && (
                            <div>
                                 <div className="mb-6 bg-white p-4 rounded-2xl shadow-lg">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                        <h3 className="text-lg font-semibold text-gray-700">Stations à Bamako</h3>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="text-base font-semibold text-gray-600 mb-3">Filtrer par commune</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setSelectedCommune(null)} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${!selectedCommune ? 'bg-mali-green text-white border-mali-green' : 'bg-white text-gray-700 border-gray-200 hover:border-mali-green hover:text-mali-green'}`}>Toutes</button>
                                            {communes.map(c => (<button key={c.id} onClick={() => setSelectedCommune(c.id)} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${selectedCommune === c.id ? 'bg-mali-green text-white border-mali-green' : 'bg-white text-gray-700 border-gray-200 hover:border-mali-green hover:text-mali-green'}`}>{c.name}</button>))}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredStations.length > 0 ? (filteredStations.map(s => (<StationCard key={s.id} station={s} onReport={handleOpenReportModal} incidentCount={getActiveIncidentCount(s.id)} />))) : (<div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg"><p className="text-gray-500">Aucune station ne correspond à votre filtre.</p></div>)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {view === 'owner' && <OwnerDashboard stations={ownerStations} onEdit={handleOpenEditModal} onAddStation={handleOpenAddStationModal} onVerify={handleVerifyStation} />}
            </main>
            {(view === 'dashboard' || view === 'list' || view === 'map') && <FloatingActionButton onClick={handleOpenGlobalReportModal} />}
            <EditStationModal station={selectedStation} isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSubmit={handleEditSubmit} />
            <AddStationModal isOpen={isAddStationModalOpen} onClose={handleCloseAddStationModal} onSubmit={handleAddStationSubmit} communes={communes} />
            <ReportIncidentModal station={stationToReport} isOpen={isReportModalOpen} onClose={handleCloseReportModal} onSubmit={handleReportSubmit} />
            <GlobalReportIncidentModal stations={stations} isOpen={isGlobalReportModalOpen} onClose={handleCloseGlobalReportModal} onSubmit={handleReportSubmit} />
        </div>
    );
}
import React, { useState, useMemo } from 'react';
import { Station, Commune, StationStatus, FuelType, QueueLength } from '../types';
import { SearchIcon, MapPinIcon, ClockIcon, CheckBadgeIcon } from './icons';

// Helper functions
const getStatusColor = (status: StationStatus) => {
    switch (status) {
        case StationStatus.AVAILABLE: return 'bg-mali-green';
        case StationStatus.UNAVAILABLE: return 'bg-mali-red';
        case StationStatus.CLOSED: return 'bg-gray-500';
        default: return 'bg-yellow-500';
    }
};

const getQueueColor = (queue: QueueLength) => {
    switch (queue) {
        case QueueLength.SHORT: return 'bg-mali-green text-white';
        case QueueLength.MEDIUM: return 'bg-yellow-500 text-white';
        case QueueLength.LONG: return 'bg-mali-red text-white';
        default: return 'bg-gray-200 text-gray-700';
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

interface StationCardProps {
    station: Station;
    onViewOnMap: (stationId: number) => void;
}

const StationCard: React.FC<StationCardProps> = ({ station, onViewOnMap }) => {
    const isPending = station.status === StationStatus.PENDING_VALIDATION;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative">
            {isPending && (
                <div className="absolute inset-0 bg-yellow-100/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4 rounded-2xl">
                    <ClockIcon className="w-10 h-10 text-yellow-600 mb-2" />
                    <h4 className="text-lg font-bold text-yellow-800">En attente de validation</h4>
                    <p className="text-sm text-yellow-700 mt-1">Sera visible publiquement après examen.</p>
                </div>
            )}
            <img 
                src={station.imageUrl || `https://ui-avatars.com/api/?name=${station.name.replace(/\s/g, "+")}&background=random&color=fff&size=200`}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${station.name.replace(/\s/g, "+")}&background=random&color=fff&size=200`}}
                alt={`Photo de la station ${station.name}`}
                className="w-full h-48 md:w-48 md:h-auto object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                           <span>{station.name}</span>
                           {station.verified && <CheckBadgeIcon className="w-5 h-5 text-mali-green shrink-0" title="Station vérifiée"/>}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                           <div className={`w-3 h-3 rounded-full ${getStatusColor(station.status)}`}></div>
                           <span className="text-sm font-semibold text-gray-600">{station.status}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{station.address}, {station.communeName}</p>
                </div>
                
                <div className="my-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-700 w-24">File d'attente:</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getQueueColor(station.queue)}`}>
                            {station.queue}
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="font-semibold text-sm text-gray-700 w-24 shrink-0">Carburants:</span>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(FuelType).map(fuel => (
                                station.fuelAvailability?.[fuel] && (
                                    <span key={fuel} className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">{fuel}</span>
                                )
                            ))}
                             {Object.values(station.fuelAvailability || {}).every(v => !v) && <span className="text-sm text-gray-500">Aucun</span>}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1.5"/>
                        MàJ: {formatTimeAgo(station.lastUpdate)}
                    </div>
                    <button onClick={() => onViewOnMap(station.id)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-1.5 px-3 rounded-lg transition-colors">
                        <MapPinIcon className="w-4 h-4"/>
                        Carte
                    </button>
                </div>
            </div>
        </div>
    );
};


interface StationListProps {
    stations: Station[];
    communes: Commune[];
    onSelectStationOnMap: (stationId: number) => void;
}

export const StationList: React.FC<StationListProps> = ({ stations, communes, onSelectStationOnMap }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedFuel, setSelectedFuel] = useState('all');
    const [selectedQueue, setSelectedQueue] = useState('all');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const filteredStations = useMemo(() => {
        return stations.filter(station => {
            const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  station.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCommune = selectedCommune === 'all' || station.communeId === parseInt(selectedCommune);
            const matchesStatus = selectedStatus === 'all' || station.status === selectedStatus;
            const matchesFuel = selectedFuel === 'all' || (station.fuelAvailability && station.fuelAvailability[selectedFuel as FuelType]);
            const matchesQueue = selectedQueue === 'all' || station.queue === selectedQueue;
            const matchesVerified = !verifiedOnly || station.verified;
            
            return matchesSearch && matchesCommune && matchesStatus && matchesFuel && matchesQueue && matchesVerified;
        });
    }, [stations, searchTerm, selectedCommune, selectedStatus, selectedFuel, selectedQueue, verifiedOnly]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800">Liste des stations</h2>
                <p className="text-gray-600 mt-1">Recherchez et filtrez pour trouver la station qu'il vous faut.</p>
                
                <div className="mt-4 relative">
                    <input 
                        type="text"
                        placeholder="Rechercher une station par nom ou adresse..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mali-green focus:border-transparent transition-colors"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                </div>
                
                <div className="mt-4 border-t pt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Commune</label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
                        <button
                            onClick={() => setSelectedCommune('all')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedCommune === 'all' ? 'bg-mali-green text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Toutes
                        </button>
                        {communes.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCommune(String(c.id))}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedCommune === String(c.id) ? 'bg-mali-green text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <label htmlFor="verified-toggle" className="flex items-center cursor-pointer select-none">
                        <span className={`mr-3 text-sm font-semibold transition-colors ${verifiedOnly ? 'text-mali-green' : 'text-gray-700'}`}>
                            Stations vérifiées seulement
                        </span>
                        <div className="relative">
                            <input 
                                id="verified-toggle" 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={verifiedOnly} 
                                onChange={() => setVerifiedOnly(!verifiedOnly)} 
                            />
                            <div className="w-12 h-6 bg-gray-200 rounded-full peer-checked:bg-mali-green transition-colors"></div>
                            <div className="absolute left-0 top-0 m-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-6"></div>
                        </div>
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-green focus:border-mali-green">
                        <option value="all">Tous les statuts</option>
                        {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <select value={selectedFuel} onChange={e => setSelectedFuel(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-green focus:border-mali-green">
                        <option value="all">Tous les carburants</option>
                        {Object.values(FuelType).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select value={selectedQueue} onChange={e => setSelectedQueue(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-mali-green focus:border-mali-green">
                        <option value="all">Toutes les files</option>
                        {Object.values(QueueLength).map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>
            </div>

            {filteredStations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredStations.map(station => (
                        <StationCard key={station.id} station={station} onViewOnMap={onSelectStationOnMap} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-700">Aucune station trouvée</h3>
                    <p className="mt-2 text-gray-500">Essayez d'ajuster vos filtres de recherche.</p>
                </div>
            )}
        </div>
    );
};
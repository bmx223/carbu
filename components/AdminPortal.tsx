
import React from 'react';
import { Station, StationStatus } from '../types';
import { CheckIcon, ClockIcon, MapPinIcon, UserShieldIcon, XMarkIcon } from './icons';

interface AdminPortalProps {
    stations: Station[];
    onClose: () => void;
    onApprove: (stationId: number) => void;
    onReject: (stationId: number) => void;
}

const PendingStationCard: React.FC<{ station: Station; onApprove: (id: number) => void; onReject: (id: number) => void; }> = ({ station, onApprove, onReject }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row border-2 border-yellow-300">
            <img 
                src={station.imageUrl || `https://ui-avatars.com/api/?name=${station.name.replace(/\s/g, "+")}&background=random&color=fff&size=200`}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${station.name.replace(/\s/g, "+")}&background=random&color=fff&size=200`}}
                alt={`Photo de la station ${station.name}`}
                className="w-full h-48 md:w-48 md:h-full object-cover flex-shrink-0"
            />
            <div className="p-4 flex flex-col flex-grow">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{station.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{station.address}, {station.communeName}</p>
                    <p className="text-xs text-gray-500 mt-1">Coordonnées: {station.location.lat.toFixed(4)}, {station.location.lon.toFixed(4)}</p>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-end items-center gap-3">
                    <button 
                        onClick={() => onReject(station.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-2 px-4 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5"/>
                        Rejeter
                    </button>
                    <button 
                        onClick={() => onApprove(station.id)}
                        className="flex items-center gap-2 bg-mali-green hover:bg-green-700 text-white font-bold text-sm py-2 px-4 rounded-lg transition-colors"
                    >
                        <CheckIcon className="w-5 h-5"/>
                        Approuver
                    </button>
                </div>
            </div>
        </div>
    );
};


export const AdminPortal: React.FC<AdminPortalProps> = ({ stations, onClose, onApprove, onReject }) => {
    const pendingStations = stations.filter(s => s.status === StationStatus.PENDING_VALIDATION);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300" onMouseDown={onClose}>
            <div className="bg-gray-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up" onMouseDown={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <UserShieldIcon className="w-6 h-6 text-blue-600"/>
                            <span>Portail Administrateur</span>
                        </h2>
                        <p className="text-sm text-gray-500">Valider les nouvelles soumissions de stations.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </header>
                
                <main className="overflow-y-auto p-6 space-y-4">
                    {pendingStations.length > 0 ? (
                        pendingStations.map(station => (
                            <PendingStationCard 
                                key={station.id}
                                station={station}
                                onApprove={onApprove}
                                onReject={onReject}
                            />
                        ))
                    ) : (
                        <div className="text-center p-12 bg-white rounded-lg">
                            <h3 className="text-xl font-bold text-gray-700">Aucune soumission en attente</h3>
                            <p className="mt-2 text-gray-500">Toutes les stations ont été examinées.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

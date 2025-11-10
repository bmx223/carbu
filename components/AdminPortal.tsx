
import React, { useState, useMemo } from 'react';
import { Station, IncidentReport, IntegrityReport, IncidentType, FraudType } from '../types';
import { CheckIcon, ClockIcon, UserShieldIcon, XMarkIcon, ShieldCheckIcon, FlagIcon, DocumentTextIcon, BuildingStorefrontIcon } from './icons';

interface AdminPortalProps {
    allStations: Station[];
    pendingStations: Station[];
    integrityReports: IntegrityReport[];
    incidentReports: IncidentReport[];
    onApprove: (stationId: number) => void;
    onReject: (stationId: number) => void;
}

const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; count: number; children: React.ReactNode }> = ({ active, onClick, count, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm md:text-base transition-all duration-300 w-full md:w-auto flex-1 md:flex-none ${
            active
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
        {children}
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'}`}>{count}</span>
    </button>
);


const PendingStationCard: React.FC<{ station: Station; onApprove: (id: number) => void; onReject: (id: number) => void; }> = ({ station, onApprove, onReject }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row border-2 border-yellow-300 animate-fade-in-up">
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
                <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3">
                    <button 
                        onClick={() => onReject(station.id)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-2 px-4 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5"/>
                        Rejeter
                    </button>
                    <button 
                        onClick={() => onApprove(station.id)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-mali-green hover:bg-green-700 text-white font-bold text-sm py-2 px-4 rounded-lg transition-colors"
                    >
                        <CheckIcon className="w-5 h-5"/>
                        Approuver
                    </button>
                </div>
            </div>
        </div>
    );
};

const IntegrityReportCard: React.FC<{ report: IntegrityReport, stationName: string }> = ({ report, stationName }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-red-200 animate-fade-in-up">
        <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-800">{stationName}</h3>
            <p className="text-sm text-gray-500">Observé le: {formatDateTime(report.observationDateTime)}</p>
        </div>
        <div className="p-4 space-y-3">
            <div>
                <h4 className="text-sm font-bold text-gray-600">Type(s) de fraude</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(report.fraudTypes).filter(([, val]) => val).map(([key]) => (
                        <span key={key} className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">{key}</span>
                    ))}
                    {report.fraudTypes[FraudType.OTHER] && <p className="text-sm text-gray-700 w-full">Précision: {report.otherFraudDescription}</p>}
                </div>
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-600">Description</h4>
                <p className="text-sm text-gray-700 mt-1">{report.description || "Aucune description fournie."}</p>
            </div>
             <div>
                <h4 className="text-sm font-bold text-gray-600">Confidentialité</h4>
                {report.isAnonymous ? (
                    <p className="text-sm text-gray-700 mt-1">Signalement anonyme</p>
                ) : (
                    <p className="text-sm text-gray-700 mt-1">A accepté d'être contacté : <span className="font-semibold">{report.contactInfo}</span></p>
                )}
            </div>
        </div>
    </div>
);


const IncidentReportCard: React.FC<{ report: IncidentReport, stationName: string }> = ({ report, stationName }) => (
     <div className="bg-white rounded-2xl shadow-lg border border-yellow-300 animate-fade-in-up">
        <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-800">{stationName}</h3>
            <p className="text-sm text-gray-500">Signalé le: {formatDateTime(report.reportedAt)}</p>
        </div>
        <div className="p-4 space-y-3">
            <div>
                <h4 className="text-sm font-bold text-gray-600">Type d'incident</h4>
                <p className="text-sm text-gray-700 mt-1">{report.incidentType}</p>
            </div>
             <div>
                <h4 className="text-sm font-bold text-gray-600">Description</h4>
                <p className="text-sm text-gray-700 mt-1">{report.description || "Aucune description fournie."}</p>
            </div>
        </div>
    </div>
);


export const AdminPortal: React.FC<AdminPortalProps> = ({ allStations, pendingStations, integrityReports, incidentReports, onApprove, onReject }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'integrity' | 'incidents'>('pending');

    const stationsMap = useMemo(() => new Map(allStations.map(s => [s.id, s])), [allStations]);
    
    const sortedIntegrityReports = useMemo(() => [...integrityReports].sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()), [integrityReports]);
    const sortedIncidentReports = useMemo(() => [...incidentReports].sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()), [incidentReports]);

    const renderContent = () => {
        switch(activeTab) {
            case 'pending':
                return (
                    <div className="space-y-4">
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
                    </div>
                );
            case 'integrity':
                return (
                    <div className="space-y-4">
                         {sortedIntegrityReports.length > 0 ? (
                            sortedIntegrityReports.map(report => (
                                <IntegrityReportCard 
                                    key={report.id}
                                    report={report}
                                    stationName={stationsMap.get(report.stationId)?.name || 'Station Inconnue'}
                                />
                            ))
                        ) : (
                            <div className="text-center p-12 bg-white rounded-lg">
                                <h3 className="text-xl font-bold text-gray-700">Aucune alerte d'intégrité</h3>
                                <p className="mt-2 text-gray-500">Aucun signalement de fraude reçu.</p>
                            </div>
                        )}
                    </div>
                );
            case 'incidents':
                 return (
                    <div className="space-y-4">
                         {sortedIncidentReports.length > 0 ? (
                            sortedIncidentReports.map(report => (
                                <IncidentReportCard
                                    key={report.id}
                                    report={report}
                                    stationName={stationsMap.get(report.stationId)?.name || 'Station Inconnue'}
                                />
                            ))
                        ) : (
                            <div className="text-center p-12 bg-white rounded-lg">
                                <h3 className="text-xl font-bold text-gray-700">Aucun incident signalé</h3>
                                <p className="mt-2 text-gray-500">La situation est calme.</p>
                            </div>
                        )}
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="bg-gray-100 rounded-2xl shadow-xl w-full flex flex-col animate-fade-in-up">
            <header className="p-4 border-b flex flex-col sm:flex-row justify-between sm:items-center bg-white rounded-t-2xl sticky top-0 z-10 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <UserShieldIcon className="w-6 h-6 text-blue-600"/>
                        <span>Portail Administrateur</span>
                    </h2>
                    <p className="text-sm text-gray-500">Gestion des soumissions et signalements.</p>
                </div>
            </header>
            
            <div className="p-4 border-b border-gray-200">
                <div className="bg-white p-2 rounded-xl flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2">
                    <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} count={pendingStations.length}>
                        <BuildingStorefrontIcon className="w-5 h-5"/> Stations en attente
                    </TabButton>
                    <TabButton active={activeTab === 'integrity'} onClick={() => setActiveTab('integrity')} count={integrityReports.length}>
                        <ShieldCheckIcon className="w-5 h-5"/> Alertes Intégrité
                    </TabButton>
                    <TabButton active={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')} count={incidentReports.length}>
                       <FlagIcon className="w-5 h-5"/> Incidents
                    </TabButton>
                </div>
            </div>

            <main className="overflow-y-auto p-6 space-y-4">
                {renderContent()}
            </main>
        </div>
    );
};

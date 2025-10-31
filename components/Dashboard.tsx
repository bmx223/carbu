
import React, { useState } from 'react';
import { Station, Commune, StationStatus, IncidentReport, IncidentType } from '../types';
import { ListIcon, MapIcon, SparklesIcon, AlertIcon, ChartBarIcon, CrosshairsIcon, FlagIcon, ClockIcon, InformationCircleIcon, LightBulbIcon, MapPinIcon } from './icons';

interface DashboardProps {
    stations: Station[];
    communes: Commune[];
    onNavigateToList: () => void;
    onNavigateToMap: () => void;
    onFindNearby: () => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
    trendAnalysis: string | null;
    incidentReports: IncidentReport[];
}

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

const getCommuneStatus = (percentage: number) => {
    if (percentage > 66) return { text: 'Bonne disponibilité', color: 'bg-mali-green', textColor: 'text-mali-green' };
    if (percentage > 33) return { text: 'Disponibilité limitée', color: 'bg-mali-yellow', textColor: 'text-yellow-600' };
    return { text: 'Pénurie critique', color: 'bg-mali-red', textColor: 'text-mali-red' };
};

const GlobalStatusCard: React.FC<{ percentage: number; stationCount: number; totalStations: number }> = ({ percentage, stationCount, totalStations }) => {
    const status = getCommuneStatus(percentage);
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div>
                <h3 className="text-lg font-bold text-gray-800">Disponibilité Globale</h3>
                <p className="text-sm text-gray-500">Aperçu du réseau de stations</p>
                <div className="flex items-baseline gap-3 mt-4">
                    <p className="text-5xl font-bold text-gray-900">{Math.round(percentage)}<span className="text-3xl">%</span></p>
                    <p className={`font-bold text-lg ${status.textColor}`}>{status.text}</p>
                </div>
                <p className="text-gray-600 mt-1">{stationCount} sur {totalStations} stations sont disponibles.</p>
            </div>
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`${status.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const QuickActionsCard: React.FC<{ onNavigateToList: () => void; onNavigateToMap: () => void; onFindNearby: () => void; }> = ({ onNavigateToList, onNavigateToMap, onFindNearby }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col justify-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Accès Rapide</h3>
        <div className="space-y-3">
             <button onClick={onFindNearby} className="w-full flex items-center justify-center gap-3 bg-mali-green text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-green-700 transition-all transform hover:scale-105 animate-gentle-pulse">
                <CrosshairsIcon className="w-5 h-5" />
                La station la plus proche
            </button>
            <div className="grid grid-cols-2 gap-3">
                 <button onClick={onNavigateToList} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all">
                    <ListIcon className="w-5 h-5" />
                    Liste
                </button>
                <button onClick={onNavigateToMap} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all">
                    <MapIcon className="w-5 h-5" />
                    Carte
                </button>
            </div>
        </div>
    </div>
);

const CommuneCard: React.FC<{ commune: Commune; stations: Station[] }> = ({ commune, stations }) => {
    const communeStations = stations.filter(s => s.communeId === commune.id);
    const availableCount = communeStations.filter(s => s.status === StationStatus.AVAILABLE).length;
    const totalCount = communeStations.length;
    const percentage = totalCount > 0 ? (availableCount / totalCount) * 100 : 0;
    const status = getCommuneStatus(percentage);

    return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{commune.name}</h3>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.color}`}></div>
                        <span className={`text-xs font-semibold ${status.textColor}`}>{status.text}</span>
                    </div>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                    <p className="text-3xl font-bold text-gray-900">{availableCount}</p>
                    <p className="text-gray-500 font-medium">/ {totalCount} stations</p>
                </div>
            </div>
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${status.color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    )
};

const IncidentListItem: React.FC<{ incident: IncidentReport, station?: Station }> = ({ incident, station }) => {
    const getIncidentIcon = (type: IncidentType) => {
        switch(type) {
            case IncidentType.ABUSE: return <FlagIcon className="w-5 h-5 text-yellow-600" />;
            case IncidentType.BLACK_MARKET: return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>;
            case IncidentType.DISPUTE: return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
            default: return <AlertIcon className="w-5 h-5 text-gray-500" />;
        }
    };
    return (
        <div className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">{getIncidentIcon(incident.incidentType)}</div>
                <div>
                    <p className="font-semibold text-gray-800">{incident.incidentType}</p>
                    <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                    {station && (
                        <div className="flex items-center text-xs text-gray-500 mt-2 gap-4">
                            <span>Station: <span className="font-medium text-gray-700">{station.name}</span></span>
                            <div className="flex items-center">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {formatTimeAgo(incident.reportedAt)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2.5 rounded-lg font-bold text-sm md:text-base transition-all duration-300 w-full md:w-auto flex-1 md:flex-none ${
            active
                ? 'bg-mali-green text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
    >
        {children}
    </button>
);

// Fix: Updated TrendAnalysisDisplay to correctly parse and render all sections from the Gemini API response.
const TrendAnalysisDisplay: React.FC<{ analysis: string }> = ({ analysis }) => {
    const parseSection = (regex: RegExp) => {
        const match = analysis.match(regex);
        return match ? match[1].trim() : null;
    };

    const parseList = (text: string | null) => {
        if (!text) return [];
        return text.split(/\s*\n\s*\*\s*/).map(item => item.trim().replace(/^\*\s*/, '')).filter(Boolean);
    };

    const sections = {
        resume: parseSection(/\*\*Résumé Global:\*\*\s*([\s\S]*?)(?=\*\*|$)/i),
        zones_privilegier: parseList(parseSection(/\*\*Zones à Privilégier \(Meilleure Disponibilité\):\*\*\s*([\s\S]*?)(?=\*\*|$)/i)),
        zones_tension: parseList(parseSection(/\*\*Zones sous Tension \(Disponibilité Faible\):\*\*\s*([\s\S]*?)(?=\*\*|$)/i)),
        conseils: parseList(parseSection(/\*\*Conseils Stratégiques pour les Citoyens:\*\*\s*([\s\S]*?)(?=\*\*|$)/i)),
        predictions: parseList(parseSection(/\*\*Prédictions à Court Terme \(Prochaines 24h\):\*\*\s*([\s\S]*?)(?=\*\*|$)/i)),
        tendance: parseSection(/\*\*Tendance Générale:\*\*\s*([\s\S]*?)(?=\*\*|$)/i),
    };

    const hasContent = Object.values(sections).some(val => (Array.isArray(val) ? val.length > 0 : val !== null));

    if (!hasContent) {
        // Fallback for unexpected format
        return <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />;
    }

    return (
        <div className="space-y-6">
            {sections.resume && (
                <div>
                    <h4 className="flex items-center gap-2 text-md font-bold text-gray-800 mb-2">
                        <InformationCircleIcon className="w-6 h-6 text-mali-green" />
                        <span>Résumé Global</span>
                    </h4>
                    <p className="text-gray-600 pl-8">{sections.resume}</p>
                </div>
            )}
            {sections.zones_privilegier.length > 0 && (
                <div>
                    <h4 className="flex items-center gap-2 text-md font-bold text-gray-800 mb-2">
                        <MapPinIcon className="w-6 h-6 text-mali-green" />
                        <span>Zones à Privilégier</span>
                    </h4>
                    <ul className="list-none space-y-1.5 pl-8">
                        {sections.zones_privilegier.map((zone, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <span className="mr-3 mt-1.5 text-mali-green shrink-0 text-lg">✓</span>
                                <span>{zone}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {sections.zones_tension.length > 0 && (
                 <div>
                    <h4 className="flex items-center gap-2 text-md font-bold text-gray-800 mb-2">
                        <MapPinIcon className="w-6 h-6 text-mali-red" />
                        <span>Zones sous Tension</span>
                    </h4>
                    <ul className="list-none space-y-1.5 pl-8">
                        {sections.zones_tension.map((zone, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <span className="mr-3 mt-1.5 text-mali-red shrink-0 text-lg">✗</span>
                                <span>{zone}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {sections.conseils.length > 0 && (
                <div>
                    <h4 className="flex items-center gap-2 text-md font-bold text-gray-800 mb-2">
                        <LightBulbIcon className="w-6 h-6 text-blue-500" />
                        <span>Conseils Stratégiques</span>
                    </h4>
                    <ul className="list-none space-y-1.5 pl-8">
                        {sections.conseils.map((conseil, index) => (
                           <li key={index} className="flex items-start text-gray-600">
                                <span className="mr-3 mt-1 text-blue-500 shrink-0">💡</span>
                                <span>{conseil}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            )}
            {sections.predictions.length > 0 && (
                <div>
                    <h4 className="flex items-center gap-2 text-md font-bold text-gray-800 mb-2">
                        <ClockIcon className="w-6 h-6 text-gray-600" />
                        <span>Prédictions (Prochaines 24h)</span>
                    </h4>
                    <ul className="list-none space-y-1.5 pl-8">
                        {sections.predictions.map((prediction, index) => (
                           <li key={index} className="flex items-start text-gray-600">
                                <span className="mr-3 mt-1 text-gray-600 shrink-0">→</span>
                                <span>{prediction}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            )}
            {sections.tendance && (
                <div>
                     <h4 className="flex items-center gap-2 text-md font-bold text-gray-800 mb-2">
                        <ChartBarIcon className="w-6 h-6 text-purple-500" />
                        <span>Tendance Générale</span>
                    </h4>
                    <p className="text-gray-600 font-semibold pl-8">{sections.tendance}</p>
                </div>
            )}
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ stations, communes, onNavigateToList, onNavigateToMap, onFindNearby, onAnalyze, isAnalyzing, trendAnalysis, incidentReports }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'communes' | 'incidents'>('overview');
    
    const availableStationsCount = stations.filter(s => s.status === StationStatus.AVAILABLE).length;
    const totalStationsCount = stations.length;
    const availablePercentage = totalStationsCount > 0 ? (availableStationsCount / totalStationsCount) * 100 : 0;
    
    const incidentsLast24h = incidentReports.filter(r => (Date.now() - r.reportedAt.getTime()) < 24 * 60 * 60 * 1000);
    const stationsMap = new Map(stations.map(s => [s.id, s]));

    const communeStats = communes.map(commune => {
        const communeStations = stations.filter(s => s.communeId === commune.id);
        const availableCount = communeStations.filter(s => s.status === StationStatus.AVAILABLE).length;
        const totalCount = communeStations.length;
        const percentage = totalCount > 0 ? (availableCount / totalCount) * 100 : 0;
        return { ...commune, availableCount, totalCount, percentage };
    }).sort((a, b) => b.percentage - a.percentage); // Sort from best to worst

    return (
        <div className="space-y-6">
            <section>
                 <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Tableau de Bord</h2>
                        <p className="text-gray-600 mt-1">Situation en temps réel à Bamako.</p>
                    </div>
                 </div>
            </section>

            <div className="bg-white p-2 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Vue d'ensemble</TabButton>
                <TabButton active={activeTab === 'communes'} onClick={() => setActiveTab('communes')}>État par Commune</TabButton>
                <TabButton active={activeTab === 'incidents'} onClick={() => setActiveTab('incidents')}>Incidents Récents</TabButton>
            </div>

            <div className="animate-fade-in-up">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <section className="grid md:grid-cols-2 gap-6">
                            <GlobalStatusCard percentage={availablePercentage} stationCount={availableStationsCount} totalStations={totalStationsCount}/>
                            <QuickActionsCard onNavigateToList={onNavigateToList} onNavigateToMap={onNavigateToMap} onFindNearby={onFindNearby} />
                        </section>

                        <section className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                 <div>
                                    <div className="flex items-center gap-3">
                                       <SparklesIcon className="w-7 h-7 text-mali-green"/>
                                       <h3 className="text-xl font-bold text-gray-800">Analyse des Tendances par IA</h3>
                                    </div>
                                    <p className="text-gray-600 mt-1">Obtenez une vue d'ensemble de la situation grâce à l'IA.</p>
                                 </div>
                                 <button onClick={onAnalyze} disabled={isAnalyzing} className="flex items-center justify-center gap-2 mt-2 md:mt-0 bg-gray-800 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors shrink-0">
                                       <ChartBarIcon className="w-5 h-5" />
                                       {isAnalyzing ? 'Analyse en cours...' : 'Analyser les tendances'}
                                 </button>
                            </div>
                            {isAnalyzing && (
                                <div className="mt-4 text-center text-gray-600">
                                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-mali-green mx-auto"></div>
                                    <p className="mt-3">Analyse des données en cours...</p>
                                </div>
                            )}
                            {trendAnalysis && !isAnalyzing && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <TrendAnalysisDisplay analysis={trendAnalysis} />
                                </div>
                            )}
                        </section>
                    </div>
                )}
                 {activeTab === 'communes' && (
                    <section className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800">Disponibilité par Commune</h3>
                        <p className="text-gray-600 mt-1">Aperçu de la situation dans chaque zone de Bamako.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {communeStats.map(commune => (
                                <CommuneCard key={commune.id} commune={commune} stations={stations} />
                            ))}
                        </div>
                    </section>
                )}
                 {activeTab === 'incidents' && (
                     <section className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3">
                            <AlertIcon className="w-7 h-7 text-mali-red" />
                            <h3 className="text-xl font-bold text-gray-800">Incidents Récents (24h)</h3>
                        </div>
                         <p className="text-gray-600 mt-1">
                             {incidentsLast24h.length > 0 ? `${incidentsLast24h.length} signalement(s) de la communauté.` : "Aucun incident signalé récemment."}
                         </p>
                         <div className="mt-4 -mx-6 border-t border-gray-200">
                            {incidentsLast24h.length > 0 ? (
                                incidentsLast24h
                                    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())
                                    .map(incident => (
                                        <IncidentListItem key={incident.id} incident={incident} station={stationsMap.get(incident.stationId)} />
                                    ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">Tout est calme pour le moment.</p>
                            )}
                         </div>
                    </section>
                )}
            </div>
        </div>
    );
};

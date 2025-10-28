import React from 'react';
import { Station, Commune, StationStatus } from '../types';
import { ListIcon, MapIcon, SparklesIcon, AlertIcon, ChartBarIcon, CrosshairsIcon } from './icons';

interface DashboardProps {
    stations: Station[];
    communes: Commune[];
    onNavigateToList: () => void;
    onNavigateToMap: () => void;
    onFindNearby: () => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
    trendAnalysis: string | null;
}

const getCommuneStatus = (percentage: number) => {
    if (percentage > 66) return { text: 'Bonne disponibilité', color: 'bg-mali-green', textColor: 'text-mali-green' };
    if (percentage > 33) return { text: 'Disponibilité limitée', color: 'bg-mali-yellow', textColor: 'text-yellow-600' };
    return { text: 'Pénurie critique', color: 'bg-mali-red', textColor: 'text-mali-red' };
};

const GlobalStatusCard: React.FC<{ percentage: number; stationCount: number; totalStations: number }> = ({ percentage, stationCount, totalStations }) => {
    const status = getCommuneStatus(percentage);
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col justify-between">
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
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col justify-center">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Accès Rapide</h3>
        <div className="space-y-3">
             <button onClick={onFindNearby} className="w-full flex items-center justify-center gap-3 bg-mali-green text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-green-700 transition-all transform hover:scale-105">
                <CrosshairsIcon className="w-5 h-5" />
                Trouver la plus proche
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
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col justify-between">
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
}

export const Dashboard: React.FC<DashboardProps> = ({ stations, communes, onNavigateToList, onNavigateToMap, onFindNearby, onAnalyze, isAnalyzing, trendAnalysis }) => {
    const availableStationsCount = stations.filter(s => s.status === StationStatus.AVAILABLE).length;
    const totalStationsCount = stations.length;
    const availablePercentage = totalStationsCount > 0 ? (availableStationsCount / totalStationsCount) * 100 : 0;

    const communeStats = communes.map(commune => {
        const communeStations = stations.filter(s => s.communeId === commune.id);
        const availableCount = communeStations.filter(s => s.status === StationStatus.AVAILABLE).length;
        const totalCount = communeStations.length;
        const percentage = totalCount > 0 ? (availableCount / totalCount) * 100 : 0;
        return { ...commune, availableCount, totalCount, percentage };
    }).sort((a, b) => a.percentage - b.percentage);

    const criticalCommunes = communeStats.filter(c => c.percentage <= 33 && c.totalCount > 0).slice(0, 2);

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

            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    <GlobalStatusCard percentage={availablePercentage} stationCount={availableStationsCount} totalStations={totalStationsCount}/>
                 </div>
                 <div>
                    <QuickActionsCard onNavigateToList={onNavigateToList} onNavigateToMap={onNavigateToMap} onFindNearby={onFindNearby} />
                 </div>
            </section>
            
            {criticalCommunes.length > 0 && (
                <section className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertIcon className="w-7 h-7 text-mali-red"/>
                        <h3 className="text-xl font-bold text-gray-800">Zones à surveiller</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {criticalCommunes.map(commune => {
                            const status = getCommuneStatus(commune.percentage);
                            return (
                                <div key={commune.id} className="bg-red-50 border-l-4 border-mali-red p-4 rounded-r-lg">
                                    <h4 className="font-bold text-gray-800">{commune.name}</h4>
                                    <p className={`text-sm font-semibold ${status.textColor}`}>{status.text}</p>
                                    <p className="text-sm text-gray-600 mt-1">{commune.availableCount} / {commune.totalCount} stations disponibles.</p>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

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
                        <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: trendAnalysis.replace(/\n/g, '<br />') }}></div>
                    </div>
                )}
            </section>
        </div>
    );
};

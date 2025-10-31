
import React, { useState, useEffect, useCallback } from 'react';
import { Station, StationStatus, QueueLength, FuelType, Report, Commune, IncidentType, IncidentReport } from './types';
import { analyzeFuelTrends } from './services/geminiService';
import { LogoIcon, MapPinIcon, ClockIcon, PlusCircleIcon, CheckBadgeIcon, ListIcon, MapIcon, CrosshairsIcon, FlagIcon, AlertIcon, DocumentTextIcon, ShieldCheckIcon, KeyIcon } from './components/icons';
import { Dashboard } from './components/Dashboard';
import { MapView } from './components/MapView';
// Fix: Corrected import to use a named import for OwnerPortal as it is not a default export.
import { OwnerPortal } from "./OwnerPortal";

// Mock Data
const communes: Commune[] = [
    { id: 1, name: 'Commune I' }, { id: 2, name: 'Commune II' }, { id: 3, name: 'Commune III' },
    { id: 4, name: 'Commune IV' }, { id: 5, name: 'Commune V' }, { id: 6, name: 'Commune VI' },
    { id: 7, name: 'Kalaban Coro' }, { id: 8, name: 'Kati' },
];
const initialStations: Station[] = [
  { id: 1, name: 'TotalEnergies ACI 2000', address: 'ACI 2000, Bamako', communeId: 4, communeName: 'Commune IV', location: { lat: 12.63, lon: -8.03 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: true }, queue: QueueLength.SHORT, queueSize: 10, lastUpdate: new Date(Date.now() - 15 * 60 * 1000), verified: true, imageUrl: 'https://pbs.twimg.com/media/FGo9n26XEAQiybC.jpg' },
  { id: 2, name: 'Shell Badalabougou', address: 'Badalabougou, Bamako', communeId: 5, communeName: 'Commune V', location: { lat: 12.62, lon: -7.99 }, status: StationStatus.AVAILABLE, fuelAvailability: { [FuelType.GASOLINE]: true, [FuelType.DIESEL]: false }, queue: QueueLength.LONG, queueSize: 75, lastUpdate: new Date(Date.now() - 5 * 60 * 1000), imageUrl: 'https://fastly.4sqi.net/img/general/600x600/39369904_Jz7r13i2iO90J3b62l2c-4DV92YODEn-hs-NVT6rqiA.jpg' },
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
];

const mockIncidents: IncidentReport[] = [
    { id: 1, stationId: 2, incidentType: IncidentType.ABUSE, description: "Le pompiste sert ses amis en priorité.", reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 2, stationId: 7, incidentType: IncidentType.BLACK_MARKET, description: "Vente d'essence dans des bidons à prix d'or juste à côté.", reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 3, stationId: 15, incidentType: IncidentType.DISPUTE, description: "Altercation entre plusieurs automobilistes.", reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }
];

type View = 'dashboard' | 'map' | 'list';

const MobileMenu: React.FC<{
    onClose: () => void;
    onNavigate: (view: View) => void;
    onOpenOwnerPortal: () => void;
}> = ({ onClose, onNavigate, onOpenOwnerPortal }) => {
    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
            <div className="fixed top-0 right-0 bottom-0 bg-white w-full max-w-xs p-6 shadow-xl animate-fade-in-right">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>
                <nav className="flex flex-col space-y-4">
                    <button onClick={() => onNavigate('dashboard')} className="text-left text-lg font-semibold text-gray-700 hover:text-mali-green p-2 rounded-lg transition-colors">Tableau de Bord</button>
                    <button onClick={() => onNavigate('map')} className="text-left text-lg font-semibold text-gray-700 hover:text-mali-green p-2 rounded-lg transition-colors">Carte</button>
                    <button onClick={() => onNavigate('list')} className="text-left text-lg font-semibold text-gray-700 hover:text-mali-green p-2 rounded-lg transition-colors">Liste des Stations</button>
                    <div className="pt-4 border-t border-gray-200"></div>
                    <button 
                        onClick={onOpenOwnerPortal}
                        className="flex items-center gap-3 text-left text-lg font-semibold text-yellow-800 bg-yellow-300 p-3 rounded-lg transition-colors hover:bg-yellow-400"
                    >
                        <KeyIcon className="w-6 h-6"/>
                        Espace Propriétaire
                    </button>
                </nav>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [stations, setStations] = useState<Station[]>(initialStations);
    const [view, setView] = useState<View>('dashboard');
    const [trendAnalysis, setTrendAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
    const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(mockIncidents);
    const [isOwnerFlowActive, setIsOwnerFlowActive] = useState(false);
    const [managedStation, setManagedStation] = useState<Station | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setTrendAnalysis(null);
        try {
            const result = await analyzeFuelTrends(stations);
            setTrendAnalysis(result);
        } catch (error) {
            console.error("Analysis failed:", error);
            setTrendAnalysis("L'analyse a échoué. Veuillez réessayer.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFindNearby = () => {
        // This is a mock function. In a real app, you'd use navigator.geolocation
        console.log("Recherche des stations à proximité...");
        const availableStations = stations.filter(s => s.status === StationStatus.AVAILABLE);
        if (availableStations.length > 0) {
            const randomStation = availableStations[Math.floor(Math.random() * availableStations.length)];
            setSelectedStationId(randomStation.id);
            setView('map');
        } else {
            alert("Désolé, aucune station disponible n'a été trouvée.");
        }
    };

    const handleUpdateStationStatus = (stationId: number, newStatus: Partial<Station>) => {
        setStations(prevStations =>
            prevStations.map(station =>
                station.id === stationId
                    ? { ...station, ...newStatus, lastUpdate: new Date() }
                    : station
            )
        );
        alert('Statut mis à jour en direct !');
    };

    const handleSubmitForReview = (stationId: number, changes: any) => {
        console.log("Changes submitted for review for station", stationId, changes);
        alert("Vos modifications ont été soumises pour validation. Elles seront appliquées après vérification par nos équipes.");
        // In a real app, this would send data to a backend.
        handleClosePortal();
    };
    
    const handleClosePortal = () => {
        setManagedStation(null);
        setIsOwnerFlowActive(false);
    };

    const handleMobileNavigate = (targetView: View) => {
        setView(targetView);
        setIsMobileMenuOpen(false);
    };

    const handleOpenOwnerPortalFromMobile = () => {
        setIsOwnerFlowActive(true);
        setIsMobileMenuOpen(false);
    };

    const StationSelectorModal: React.FC = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col animate-fade-in-up">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">Sélectionnez votre station</h2>
                    <button onClick={() => setIsOwnerFlowActive(false)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>
                <div className="overflow-y-auto p-4">
                    <ul className="space-y-2">
                        {stations.map(station => (
                            <li key={station.id}>
                                <button 
                                    onClick={() => setManagedStation(station)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-4"
                                >
                                    <img src={station.imageUrl || `https://ui-avatars.com/api/?name=${station.name.charAt(0)}&background=random`} alt={station.name} className="w-12 h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{station.name}</p>
                                        <p className="text-sm text-gray-500">{station.address}, {station.communeName}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
    
    // Simple Header
    const Header = () => (
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
            <LogoIcon className="w-10 h-10" />
            <div>
                <h1 className="text-xl font-bold text-gray-800">Faso Carburant</h1>
                <p className="text-sm text-gray-500">Info carburant en temps réel</p>
            </div>
        </div>
        <nav className="hidden md:flex items-center gap-2">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'dashboard' ? 'bg-mali-green text-white' : 'hover:bg-gray-100'}`}>Tableau de Bord</button>
            <button onClick={() => setView('map')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'map' ? 'bg-mali-green text-white' : 'hover:bg-gray-100'}`}>Carte</button>
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'list' ? 'bg-mali-green text-white' : 'hover:bg-gray-100'}`}>Liste des Stations</button>
            <button 
                onClick={() => setIsOwnerFlowActive(true)}
                className="flex items-center gap-2 ml-4 px-4 py-2 rounded-lg font-semibold transition-colors bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
            >
                <KeyIcon className="w-5 h-5"/>
                Espace Propriétaire
            </button>
        </nav>
        <button 
            className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
            {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
        </button>
      </header>
    );

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard 
                            stations={stations}
                            communes={communes}
                            onNavigateToList={() => setView('list')}
                            onNavigateToMap={() => setView('map')}
                            onFindNearby={handleFindNearby}
                            onAnalyze={handleAnalyze}
                            isAnalyzing={isAnalyzing}
                            trendAnalysis={trendAnalysis}
                            incidentReports={incidentReports}
                        />;
            case 'map':
                return <MapView 
                            stations={stations} 
                            selectedStationId={selectedStationId}
                            onSelectStation={setSelectedStationId}
                            onFindNearby={handleFindNearby}
                        />;
            case 'list':
                // The StationList component doesn't exist. We'll show a placeholder.
                return (
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold">Liste des stations</h2>
                        <p className="mt-2 text-gray-600">Cette fonctionnalité est en cours de développement.</p>
                        <button onClick={() => setView('dashboard')} className="mt-4 px-6 py-2 bg-mali-green text-white font-semibold rounded-lg">Retour</button>
                    </div>
                );
            default:
                return <div>Vue non trouvée</div>;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header />
            <main className="p-4 md:p-8">
                {renderView()}
            </main>
            <footer className="text-center py-6 text-sm text-gray-500 border-t mt-8">
                <p>&copy; {new Date().getFullYear()} Faso Carburant. Tous droits réservés.</p>
                <p className="mt-1">Une initiative citoyenne pour la communauté.</p>
            </footer>

            {isMobileMenuOpen && (
                <MobileMenu
                    onClose={() => setIsMobileMenuOpen(false)}
                    onNavigate={handleMobileNavigate}
                    onOpenOwnerPortal={handleOpenOwnerPortalFromMobile}
                />
            )}

            {isOwnerFlowActive && !managedStation && <StationSelectorModal />}
            {managedStation && (
                <OwnerPortal
                    station={managedStation}
                    communes={communes}
                    onClose={handleClosePortal}
                    onUpdateStatus={handleUpdateStationStatus}
                    onSubmitForReview={handleSubmitForReview}
                />
            )}
        </div>
    );
};

export default App;
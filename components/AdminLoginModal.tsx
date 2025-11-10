
import React, { useState } from 'react';
import { KeyIcon, UserShieldIcon } from './icons';

interface AdminLoginModalProps {
    onClose: () => void;
    onLogin: (password: string) => boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Simulate network delay
        setTimeout(() => {
            const success = onLogin(password);
            if (!success) {
                setError('Mot de passe incorrect. Veuillez réessayer.');
                setIsSubmitting(false);
            }
        }, 500);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300" 
            onMouseDown={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-title"
        >
            <form 
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up"
                onMouseDown={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <UserShieldIcon className="w-8 h-8 text-blue-600" />
                        <div>
                            <h2 id="admin-login-title" className="text-xl font-bold text-gray-800">Accès Administrateur</h2>
                            <p className="text-sm text-gray-500">Veuillez vous authentifier pour continuer.</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <label htmlFor="admin-password" className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
                        <div className="relative">
                            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            <input 
                                type="password"
                                id="admin-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-600 font-semibold">{error}</p>}
                </div>
                <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Connexion...' : 'Se connecter'}
                    </button>
                </div>
            </form>
        </div>
    );
};

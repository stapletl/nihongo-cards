import { createContext, useContext } from 'react';

export type NavigationGuard = {
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
};

type NavigationGuardContextType = {
    requestNavigation: (request: string | (() => void)) => boolean;
    setNavigationGuard: (guard: NavigationGuard | null) => void;
};

export const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(
    undefined
);

export function useNavigationGuard() {
    const context = useContext(NavigationGuardContext);

    if (context === undefined) {
        throw new Error('useNavigationGuard must be used within a NavigationGuardProvider');
    }

    return context;
}

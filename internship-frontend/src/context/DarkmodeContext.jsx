import {createContext, useState, useContext, useEffect} from 'react';

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({children}) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode')
        return saved ? JSON.parse(saved) : false
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    };

    return (
        <DarkModeContext.Provider value = {{isDarkMode, toggleDarkMode}}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => {
    const context = useContext(DarkModeContext)
    if (!context) {
        throw new Error('useDarkMode must be used inside DarkModeProvider')
    };
    return context;
};
import React, { useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useCustomize } from '../../contexts/CustomizeContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();
    const { settings } = useCustomize();
    const position = settings?.notifications?.position || 'top-right';

    const getPositionClass = () => {
        switch (position) {
            case 'top-left': return 'top-5 left-5';
            case 'bottom-right': return 'bottom-5 right-5';
            case 'bottom-left': return 'bottom-5 left-5';
            case 'top-right':
            default:
                return 'top-5 right-5';
        }
    };
    
    // Play sound effect
    useEffect(() => {
        if (toasts.length > 0 && settings?.notifications?.soundEnabled) {
            // In a real app, you'd have different audio files.
            // For now, we'll just log to the console to simulate the effect.
            console.log(`Playing notification sound: ${settings?.notifications?.soundName}`);
        }
    }, [toasts, settings?.notifications?.soundEnabled, settings?.notifications?.soundName]);


    return (
        <div className={`fixed ${getPositionClass()} z-50 space-y-2`}>
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

export default ToastContainer;
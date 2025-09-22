import React from "react";
import styles from "../../App.module.css";

interface StatusBarProps {
    apiLoading: boolean;
    apiError: string | null;
    toggleOnlineMode: () => void;
    refreshFromServer: () => void;
    clearError: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({

    apiLoading,
    apiError,
    refreshFromServer,
    clearError,
}) => (
    <div className={styles.statusBar}>

        {apiLoading && <span>⏳</span>}

        <button
            onClick={refreshFromServer}
            className={styles.refreshBtn}
            title="Refresh from server (preserves local positions)"
        >
            🔄
        </button>
        {apiError && (
            <>
                <span style={{ color: "#f44336" }}>❌</span>
                <button
                    onClick={clearError}
                    className={styles.clearBtn}
                    title="Clear error"
                >
                    Clear
                </button>
            </>
        )}
    </div>
);
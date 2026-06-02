import { Track } from './webamp/webamp.bundle'

declare global {
    interface Window {
        minimizeElectronWindow: () => void
        closeElectronWindow: () => void
        setupRendered: () => void
        onOpenFileFromOS: (callback: (fileUrl: string) => void) => void
        webampOnTrackDidChange: (track: Track) => void
        webampPlay: () => void
        webampPause: () => void
        webampNext: () => void
        webampPrevious: () => void

        // Spectron smoke tests only
        spectronRequire: (path: string) => void
    }
}

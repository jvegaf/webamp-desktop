const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const electron = require('electron')
const isDev = require('electron-is-dev')
const htmlToText = require('html-to-text')

function checkForUpdatesAndNotify() {
  if (isDev) {
    console.warn('Updates are not checked in dev mode')
    return
  }

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.fullChangelog = true
  autoUpdater.logger = log

  autoUpdater.on('update-available', (info) => {
    log.info('Got info about update available', info)
    const releaseNotesText = htmlToText.fromString(
      info.releaseNotes.reduce((acc, n) => acc + n.version + '<hr>' + n.note, ''),
      { singleNewLineParagraphs: true }
    )
    
    electron.dialog.showMessageBox({
      type: 'info',
      buttons: ['Update', 'Later'],
      title: 'New version available',
      message: `Version ${info.version} is available. Would you like to download and install it now?`,
      detail: releaseNotesText,
      noLink: true,
    }).then((result) => {
      if (result.response === 0) {
        // User clicked "Update" - start download
        autoUpdater.downloadUpdate()
      }
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded', info)
    electron.dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart Now', 'Later'],
      title: 'Update Ready',
      message: 'Update downloaded',
      detail: `Version ${info.version} has been downloaded. Restart the application to apply the update?`,
      noLink: true,
    }).then((result) => {
      if (result.response === 0) {
        // User clicked "Restart Now" - install and restart
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on('error', (err) => {
    log.error('Update check failed', err)
  })

  autoUpdater.checkForUpdates()
}

module.exports = checkForUpdatesAndNotify

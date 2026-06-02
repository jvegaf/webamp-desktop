const fs = require('fs')
const path = require('path')
const { fileURLToPath } = require('url')
const mime = require('mime-types')
const isDev = require('electron-is-dev')

function interceptStreamProtocol() {
  // Content security policy
  const cspSrc = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' data:",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "media-src 'self' blob: file: webamp-file:",
    "object-src 'self' blob:"
  ]

  if (isDev) {
    cspSrc.push("connect-src 'self' ws://127.0.0.1:54439 webamp-file:")
  } else {
    cspSrc.push("connect-src 'self' webamp-file:")
  }

  return function (request, callback) {
    // AIDEV-NOTE: Use fileURLToPath for correct cross-platform file:// URL handling.
    // This correctly handles both app-relative URLs (file://./dist/...) and
    // absolute paths from OS "Open with..." (file:///C:/Users/.../song.mp3).
    let filePath
    try {
      filePath = fileURLToPath(request.url)
    } catch {
      // Fallback for malformed URLs
      filePath = path.normalize(`${__dirname}/../../${request.url.substr(8)}`)
    }
    const contentType = mime.contentType(path.extname(request.url))

    callback({
      statusCode: fs.existsSync(filePath) ? 200 : 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'private, max-age=0',
        'Content-Type': contentType,
        'Content-Security-Policy': cspSrc.join(';'),
        'Date': (new Date).toUTCString(),
        'Server': 'Electron',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
      data: fs.createReadStream(filePath)
    })
  }
}

module.exports = interceptStreamProtocol

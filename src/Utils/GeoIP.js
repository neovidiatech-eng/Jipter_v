import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import maxmind from "maxmind";

const DB_DIR = path.resolve("./src/database/geoip");
const DB_PATH = path.join(DB_DIR, "GeoLite2-City.mmdb");
const DOWNLOAD_URL = "https://github.com/P3TERX/GeoLite.mmdb/releases/latest/download/GeoLite2-City.mmdb";

let lookupInstance = null;

/**
 * Helper to download file and follow redirects
 */
const downloadFile = (url, destPath, maxRedirects = 5) => {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      return reject(new Error("Too many redirects"));
    }

    const request = https.get(url, (response) => {
      const { statusCode } = response;

      // Handle Redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(statusCode)) {
        const location = response.headers.location;
        if (!location) {
          return reject(new Error(`Redirect status ${statusCode} received but no location header provided`));
        }
        // Resolve relative URL if needed
        const nextUrl = new URL(location, url).toString();
        return downloadFile(nextUrl, destPath, maxRedirects - 1).then(resolve).catch(reject);
      }

      if (statusCode !== 200) {
        return reject(new Error(`Failed to download file. Status Code: ${statusCode}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        resolve(true);
      });

      fileStream.on("error", (err) => {
        fs.unlink(destPath, () => {}); // clean up partial file
        reject(err);
      });
    });

    request.on("error", (err) => {
      fs.unlink(destPath, () => {}); // clean up partial file
      reject(err);
    });
  });
};

/**
 * Initializes MaxMind database. Downloads the db file if not present.
 */
export const initGeoIP = async () => {
  if (lookupInstance) return lookupInstance;

  if (!fs.existsSync(DB_PATH)) {
    console.log(`[GeoIP] Database file not found at ${DB_PATH}. Starting download...`);
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      await downloadFile(DOWNLOAD_URL, DB_PATH);
      console.log("[GeoIP] Database downloaded and saved successfully.");
    } catch (err) {
      console.error("[GeoIP] Error downloading database:", err.message);
      return null;
    }
  }

  try {
    lookupInstance = await maxmind.open(DB_PATH);
    console.log("[GeoIP] Database loaded successfully.");
    return lookupInstance;
  } catch (err) {
    console.error("[GeoIP] Error opening MaxMind database:", err.message);
    return null;
  }
};

/**
 * Get Geo information from an IP address
 * @param {string} ip
 * @returns {object|null}
 */
export const getGeoInfo = async (ip) => {
  if (!ip) return null;

  // Normalize IP
  let cleanIp = ip.trim();
  if (cleanIp.startsWith("::ffff:")) {
    cleanIp = cleanIp.substring(7);
  }

  // Check for local / loopback IPs
  if (
    cleanIp === "::1" ||
    cleanIp === "127.0.0.1" ||
    cleanIp.startsWith("fe80:") ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(cleanIp)
  ) {
    return null;
  }

  const lookup = await initGeoIP();
  if (!lookup) return null;

  try {
    const data = lookup.get(cleanIp);
    return data;
  } catch (err) {
    console.error(`[GeoIP] Lookup error for IP ${cleanIp}:`, err.message);
    return null;
  }
};

/**
 * Get timezone string from IP address
 * @param {string} ip
 * @returns {string|null}
 */
export const getTimezoneFromIp = async (ip) => {
  const geo = await getGeoInfo(ip);
  return geo?.location?.time_zone || null;
};

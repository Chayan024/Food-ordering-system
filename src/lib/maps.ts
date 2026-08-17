export interface Coordinate {
  lat: number;
  lng: number;
}

/**
 * Calculates distance between two GPS coordinates using Haversine formula (km)
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Estimates delivery duration based on distance (assuming 25km/h avg urban speed + 10 min buffer)
 */
export function calculateEstimatedDuration(distanceKm: number): number {
  const speedKmPerMin = 25 / 60;
  const travelMinutes = distanceKm / speedKmPerMin;
  return Math.round(travelMinutes + 10);
}

/**
 * Generates intermediate waypoints between restaurant and customer for realistic animated delivery tracking
 */
export function generateRouteWaypoints(
  start: Coordinate,
  end: Coordinate,
  steps: number = 8
): Coordinate[] {
  const points: Coordinate[] = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    // Add slight natural curve offset for realistic road path
    const curveOffset = Math.sin(ratio * Math.PI) * 0.003;
    points.push({
      lat: start.lat + (end.lat - start.lat) * ratio + curveOffset,
      lng: start.lng + (end.lng - start.lng) * ratio,
    });
  }
  return points;
}

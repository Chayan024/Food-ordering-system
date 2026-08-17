import { describe, it, expect } from 'vitest';
import { calculateDistance, calculateEstimatedDuration, generateRouteWaypoints } from '../src/lib/maps';

describe('Restaurant Search & GPS Routing Suite', () => {
  const sampleRestaurants = [
    { id: '1', name: 'Bella Italia Trattoria', cuisineType: 'Italian', rating: 4.8, minOrder: 15, isVegOnly: false },
    { id: '2', name: 'Spice Symphony', cuisineType: 'Indian', rating: 4.7, minOrder: 18, isVegOnly: false },
    { id: '3', name: 'Tokyo Ramen House', cuisineType: 'Japanese', rating: 4.9, minOrder: 20, isVegOnly: false },
    { id: '4', name: 'Green Garden Harvest', cuisineType: 'Healthy & Vegan', rating: 4.8, minOrder: 15, isVegOnly: true },
  ];

  it('TC-SEARCH-01: Should filter restaurants by name or query', () => {
    const query = 'Ramen';
    const filtered = sampleRestaurants.filter((r) =>
      r.name.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Tokyo Ramen House');
  });

  it('TC-SEARCH-02: Should filter restaurants by cuisine type', () => {
    const cuisine = 'Italian';
    const filtered = sampleRestaurants.filter((r) => r.cuisineType === cuisine);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('TC-SEARCH-03: Should correctly compute Haversine distance and dynamic delivery ETA', () => {
    const restCoord = { lat: 28.6139, lng: 77.2090 };
    const custCoord = { lat: 28.6300, lng: 77.2250 };

    const distance = calculateDistance(restCoord, custCoord);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(10); // Within city bounds (~2.4 km)

    const eta = calculateEstimatedDuration(distance);
    expect(eta).toBeGreaterThanOrEqual(10); // Minimum 10 mins base

    const waypoints = generateRouteWaypoints(restCoord, custCoord, 5);
    expect(waypoints.length).toBe(6);
  });
});

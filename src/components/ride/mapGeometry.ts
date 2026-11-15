export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ProjectionBox {
  offsetLeft: number;
  offsetTop: number;
  width: number;
  height: number;
}

export interface ProjectedPosition {
  left: number;
  top: number;
}

/**
 * Builds a projector that maps a geographic coordinate onto a 2D preview box.
 *
 * Latitude/longitude are normalized against the bounding box of the supplied
 * points, then scaled into the projection box. The small epsilon guards against
 * a zero-width span when every point shares a coordinate (e.g. a single rider).
 */
export function createGeoProjector(points: GeoPoint[], box: ProjectionBox) {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (lat: number, lng: number): ProjectedPosition => ({
    left: box.offsetLeft + ((lng - minLng) / Math.max(maxLng - minLng, 0.0001)) * box.width,
    top: box.offsetTop + ((maxLat - lat) / Math.max(maxLat - minLat, 0.0001)) * box.height
  });
}

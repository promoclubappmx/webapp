import { supabase } from '../lib/supabase';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;
const GEOCODING_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

/**
 * Geocode an address string using Mapbox Geocoding API
 * @param {string} address - Address to geocode
 * @returns {Promise<Array>} Array of suggestions with label, lat, lng
 */
export const geocodeAddress = async (address) => {
  if (!address || address?.trim()?.length < 3) return [];
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-public-token-here') return [];

  try {
    const encoded = encodeURIComponent(address?.trim());
    const url = `${GEOCODING_BASE}/${encoded}.json?access_token=${MAPBOX_TOKEN}&country=mx&language=es&limit=5&types=address,place,poi`;
    const res = await fetch(url);
    if (!res?.ok) return [];
    const data = await res?.json();
    return (data?.features || [])?.map((f) => ({
      label: f?.place_name,
      lat: f?.center?.[1],
      lng: f?.center?.[0],
      id: f?.id,
    }));
  } catch (err) {
    console.error('geocodeAddress error:', err);
    return [];
  }
};

/**
 * Reverse geocode coordinates to get address
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string|null>} Address string or null
 */
export const reverseGeocode = async (lat, lng) => {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-public-token-here') return null;
  try {
    const url = `${GEOCODING_BASE}/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=1`;
    const res = await fetch(url);
    if (!res?.ok) return null;
    const data = await res?.json();
    return data?.features?.[0]?.place_name || null;
  } catch (err) {
    console.error('reverseGeocode error:', err);
    return null;
  }
};

/**
 * Get business location from Supabase
 * @param {string} businessId
 * @returns {Promise<Object|null>}
 */
export const getBusinessLocation = async (businessId) => {
  if (!businessId) return null;
  try {
    const { data, error } = await supabase?.from('business_locations')?.select('*')?.eq('business_id', businessId)?.single();
    if (error && error?.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error('getBusinessLocation error:', err);
    return null;
  }
};

/**
 * Save (upsert) business location to Supabase
 * @param {string} businessId
 * @param {Object} locationData - { address_normalized, address_references, latitude, longitude }
 * @returns {Promise<Object|null>}
 */
export const saveBusinessLocation = async (businessId, locationData) => {
  if (!businessId) return null;
  try {
    const { data: existing } = await supabase?.from('business_locations')?.select('id')?.eq('business_id', businessId)?.single();

    const payload = {
      business_id: businessId,
      address_normalized: locationData?.address_normalized || locationData?.address || '',
      address_references: locationData?.address_references || locationData?.howToGet || '',
      latitude: locationData?.latitude,
      longitude: locationData?.longitude,
      updated_at: new Date()?.toISOString(),
    };

    if (existing?.id) {
      const { data, error } = await supabase?.from('business_locations')?.update(payload)?.eq('id', existing?.id)?.select()?.single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase?.from('business_locations')?.insert(payload)?.select()?.single();
      if (error) throw error;
      return data;
    }
  } catch (err) {
    console.error('saveBusinessLocation error:', err);
    return null;
  }
};

/**
 * Get business geofence from Supabase
 * @param {string} businessId
 * @returns {Promise<Object|null>}
 */
export const getBusinessGeofence = async (businessId) => {
  if (!businessId) return null;
  try {
    const { data, error } = await supabase?.from('business_geofences')?.select('*')?.eq('business_id', businessId)?.eq('is_active', true)?.order('created_at', { ascending: false })?.limit(1)?.single();
    if (error && error?.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error('getBusinessGeofence error:', err);
    return null;
  }
};

/**
 * Save (upsert) business geofence to Supabase
 * @param {string} businessId
 * @param {Object} geofenceData - { name, geofence_type, radius_meters, latitude, longitude }
 * @returns {Promise<Object|null>}
 */
export const saveBusinessGeofence = async (businessId, geofenceData) => {
  if (!businessId) return null;
  try {
    const { data: existing } = await supabase?.from('business_geofences')?.select('id')?.eq('business_id', businessId)?.eq('is_active', true)?.single();

    const lat = geofenceData?.latitude || geofenceData?.lat;
    const lng = geofenceData?.longitude || geofenceData?.lng;

    const payload = {
      business_id: businessId,
      name: geofenceData?.name || 'Geofence principal',
      geofence_type: geofenceData?.geofence_type || 'circle',
      radius_meters: geofenceData?.radius_meters || 200,
      is_active: true,
      updated_at: new Date()?.toISOString(),
    };

    if (existing?.id) {
      const { data, error } = await supabase?.from('business_geofences')?.update(payload)?.eq('id', existing?.id)?.select()?.single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase?.from('business_geofences')?.insert(payload)?.select()?.single();
      if (error) throw error;
      return data;
    }
  } catch (err) {
    console.error('saveBusinessGeofence error:', err);
    return null;
  }
};

/**
 * Get geo events as GeoJSON via PostGIS function
 * @param {string} businessId
 * @param {string} from - ISO date string
 * @param {string} to - ISO date string
 * @returns {Promise<Object|null>} GeoJSON FeatureCollection
 */
export const getGeoEventsGeoJSON = async (businessId, from, to) => {
  if (!businessId) return null;
  try {
    const { data, error } = await supabase?.rpc('fn_geofence_events_geojson', {
      p_business_id: businessId,
      p_from: from,
      p_to: to,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('getGeoEventsGeoJSON error:', err);
    return null;
  }
};

/**
 * Check if a point is inside a business geofence
 * @param {number} lat
 * @param {number} lng
 * @param {string} businessId
 * @returns {Promise<boolean>}
 */
export const checkPointInGeofence = async (lat, lng, businessId) => {
  if (!businessId) return false;
  try {
    const { data, error } = await supabase?.rpc('fn_point_in_geofence', {
      p_point: `SRID=4326;POINT(${lng} ${lat})`,
      p_business_id: businessId,
    });
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error('checkPointInGeofence error:', err);
    return false;
  }
};

/**
 * Get heatmap data for a business aggregated from geo_events
 * @param {string} businessId
 * @param {string} period - 'today' | '7days' | '30days'
 * @returns {Promise<Array>} Array of { lat, lng, weight }
 */
export const getHeatmapData = async (businessId, period = '30days') => {
  if (!businessId) return [];
  try {
    const now = new Date();
    let from = new Date();
    if (period === 'today') {
      from.setHours(0, 0, 0, 0);
    } else if (period === '7days') {
      from.setDate(now?.getDate() - 7);
    } else {
      from.setDate(now?.getDate() - 30);
    }

    const { data, error } = await supabase?.from('geo_events')?.select('id, event_type, detected_at, metadata')?.eq('business_id', businessId)?.gte('detected_at', from.toISOString())?.lte('detected_at', now?.toISOString())?.not('location', 'is', null);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getHeatmapData error:', err);
    return [];
  }
};

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { formatCoords, geocodeAddress, type GeoPoint } from '../maps/geocode';
import { colors, radius, type } from '../theme/tokens';
import { StreetMap } from './StreetMap';

type Props = {
  line1: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
};

export function AddressMap({ line1, city, pincode, latitude, longitude }: Props) {
  const selected = parseCoords(latitude, longitude);
  const [coords, setCoords] = useState<GeoPoint | null>(selected);
  const [view, setView] = useState<GeoPoint | null>(selected);
  const [failed, setFailed] = useState(false);
  const query = `${line1}, ${city} ${pincode}, India`;

  useEffect(() => {
    const pinned = parseCoords(latitude, longitude);
    if (pinned) {
      setCoords(pinned);
      setView(pinned);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setCoords(null);
    setView(null);
    setFailed(false);

    void geocodeAddress(query)
      .then((point) => {
        if (cancelled) return;
        if (point) {
          setCoords(point);
          setView(point);
        } else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [query, latitude, longitude]);

  if (!coords || !view) {
    return (
      <View style={styles.placeholder}>
        {failed ? (
          <Text style={styles.fallback}>Could not place this address on the map.</Text>
        ) : (
          <ActivityIndicator color={colors.accent} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <StreetMap
        center={view}
        pin={coords}
        height={180}
        interactive
        onCenterChange={setView}
      />
      <Text style={styles.coords}>{formatCoords(coords)}</Text>
    </View>
  );
}

function parseCoords(latitude?: number, longitude?: number): GeoPoint | null {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

const styles = StyleSheet.create({
  block: {
    alignSelf: 'stretch',
  },
  placeholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  fallback: {
    color: colors.inkMuted,
    fontSize: type.sm,
    textAlign: 'center',
  },
  coords: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: type.sm,
    fontWeight: '700',
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.line,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
});

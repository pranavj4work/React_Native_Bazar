import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BENGALURU, formatCoords, geocodeAddress, type GeoPoint } from '../../../shared/maps/geocode';
import { colors, space, type } from '../../../shared/theme/tokens';
import { StreetMap } from '../../../shared/ui/StreetMap';

type Props = {
  value: GeoPoint | null;
  city: string;
  pincode: string;
  error?: string;
  onChange: (point: GeoPoint) => void;
};

export function LocationPicker({ value, city, pincode, error, onChange }: Props) {
  const [preview, setPreview] = useState<GeoPoint>(value ?? BENGALURU);

  useEffect(() => {
    if (value) return;
    const query = [city.trim(), pincode.trim(), 'India'].filter(Boolean).join(' ');
    if (query.length < 8) return;
    const handle = setTimeout(() => {
      void geocodeAddress(query).then((point) => {
        if (point) setPreview(point);
      });
    }, 500);
    return () => clearTimeout(handle);
  }, [city, pincode, value]);

  return (
    <View style={styles.block}>
      <Text style={styles.hint}>Two-finger drag to move. Tap to drop a pin. Use + / − to zoom.</Text>
      <StreetMap
        center={preview}
        pin={value}
        height={240}
        interactive
        error={Boolean(error)}
        onCenterChange={setPreview}
        onPick={onChange}
      />
      {value ? (
        <Text style={styles.coords}>{formatCoords(value)}</Text>
      ) : (
        <Text style={styles.coordsMuted}>No pin yet</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: space.sm,
  },
  hint: {
    fontSize: type.sm,
    color: colors.inkMuted,
  },
  coords: {
    fontSize: type.sm,
    fontWeight: '700',
    color: colors.ink,
  },
  coordsMuted: {
    fontSize: type.sm,
    color: colors.inkMuted,
  },
  error: {
    fontSize: type.xs,
    color: colors.danger,
  },
});

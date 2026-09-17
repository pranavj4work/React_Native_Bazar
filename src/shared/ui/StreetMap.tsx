import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { type GeoPoint } from '../maps/geocode';
import { colors, radius, type } from '../theme/tokens';

const TILE_SIZE = 256;
const GRID = 5;
const MIN_ZOOM = 3;
const MAX_ZOOM = 19;
const TILE_URL = 'https://basemaps.cartocdn.com/rastertiles/voyager';

type Props = {
  center: GeoPoint;
  height?: number;
  pin?: GeoPoint | null;
  interactive?: boolean;
  error?: boolean;
  onPick?: (point: GeoPoint) => void;
  onCenterChange?: (point: GeoPoint) => void;
};

export function StreetMap({
  center,
  height = 220,
  pin,
  interactive = false,
  error = false,
  onPick,
  onCenterChange,
}: Props) {
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(15);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [view, setView] = useState(center);
  const live = useRef({
    center: view,
    zoom,
    width,
    height,
    onPick,
    onCenterChange,
  });
  live.current = { center: view, zoom, width, height, onPick, onCenterChange };

  useEffect(() => {
    setView(center);
  }, [center.latitude, center.longitude]);

  const mosaic = useMemo(
    () => (width > 0 ? buildMosaic(view, zoom, width, height) : null),
    [view, zoom, width, height],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(interactive)
        .minPointers(2)
        .maxPointers(2)
        .averageTouches(true)
        .enableTrackpadTwoFingerGesture(true)
        .minDistance(1)
        .shouldCancelWhenOutside(false)
        .cancelsTouchesInView(true)
        .runOnJS(true)
        .onUpdate((event) => {
          setDrag({ x: event.translationX, y: event.translationY });
        })
        .onEnd((event) => {
          const dx = event.translationX;
          const dy = event.translationY;
          const { center: origin, zoom: z, onCenterChange: notify } = live.current;
          const world = latLngToWorld(origin.latitude, origin.longitude, z);
          const next = worldToLatLng(
            world.x - dx / TILE_SIZE,
            world.y - dy / TILE_SIZE,
            z,
          );
          setDrag({ x: 0, y: 0 });
          setView(next);
          notify?.(next);
        })
        .onFinalize((_event, success) => {
          if (!success) setDrag({ x: 0, y: 0 });
        }),
    [interactive],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(interactive && Boolean(onPick))
        .maxDistance(10)
        .maxDuration(250)
        .cancelsTouchesInView(false)
        .runOnJS(true)
        .onEnd((event) => {
          const { center: origin, zoom: z, width: w, height: h, onPick: pick } = live.current;
          if (w <= 0) return;
          pick?.(screenToLatLng(origin, z, event.x, event.y, w, h));
        }),
    [interactive, onPick],
  );

  const composed = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  const pinStyle = pin && width > 0 ? latLngToPinStyle(view, pin, zoom, width, height) : null;

  const mapBody = (
    <View style={[styles.clip, { height }]} collapsable={false}>
      {mosaic ? (
        <View
          style={{
            position: 'absolute',
            width: TILE_SIZE * GRID,
            height: TILE_SIZE * GRID,
            left: mosaic.originX + drag.x,
            top: mosaic.originY + drag.y,
          }}
        >
          {mosaic.tiles.map((tile) => (
            <Image
              key={`${zoom}-${tile.x}-${tile.y}`}
              source={{ uri: `${TILE_URL}/${zoom}/${tile.x}/${tile.y}.png` }}
              style={{
                position: 'absolute',
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: tile.left,
                top: tile.top,
              }}
            />
          ))}
        </View>
      ) : null}
      {pinStyle ? (
        <View
          pointerEvents="none"
          style={[styles.pinWrap, { left: pinStyle.left + drag.x, top: pinStyle.top + drag.y }]}
        >
          <Ionicons name="location" size={32} color={colors.accent} />
        </View>
      ) : null}
    </View>
  );

  return (
    <View
      style={[styles.wrap, { height }, error ? styles.wrapError : null]}
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        if (next > 0 && next !== width) setWidth(next);
      }}
    >
      {interactive ? <GestureDetector gesture={composed}>{mapBody}</GestureDetector> : mapBody}
      {interactive ? (
        <View style={styles.zoom} pointerEvents="box-none">
          <Pressable
            onPress={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
            disabled={zoom >= MAX_ZOOM}
            style={[styles.zoomBtn, zoom >= MAX_ZOOM ? styles.zoomBtnOff : null]}
          >
            <Text style={styles.zoomText}>+</Text>
          </Pressable>
          <Text style={styles.zoomLevel}>{zoom}</Text>
          <Pressable
            onPress={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
            disabled={zoom <= MIN_ZOOM}
            style={[styles.zoomBtn, zoom <= MIN_ZOOM ? styles.zoomBtnOff : null]}
          >
            <Text style={styles.zoomText}>−</Text>
          </Pressable>
        </View>
      ) : null}
      <Text pointerEvents="none" style={styles.credit}>
        Map © CARTO, OSM
      </Text>
    </View>
  );
}

function buildMosaic(center: GeoPoint, zoom: number, width: number, height: number) {
  const world = latLngToWorld(center.latitude, center.longitude, zoom);
  const half = Math.floor(GRID / 2);
  const originTileX = Math.floor(world.x) - half;
  const originTileY = Math.floor(world.y) - half;
  const n = 2 ** zoom;
  const tiles = [];
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      tiles.push({
        x: wrapTile(originTileX + col, n),
        y: clampTile(originTileY + row, n),
        left: col * TILE_SIZE,
        top: row * TILE_SIZE,
      });
    }
  }
  return {
    tiles,
    originX: width / 2 - (world.x - originTileX) * TILE_SIZE,
    originY: height / 2 - (world.y - originTileY) * TILE_SIZE,
  };
}

function screenToLatLng(
  center: GeoPoint,
  zoom: number,
  x: number,
  y: number,
  width: number,
  height: number,
): GeoPoint {
  const world = latLngToWorld(center.latitude, center.longitude, zoom);
  return worldToLatLng(world.x + (x - width / 2) / TILE_SIZE, world.y + (y - height / 2) / TILE_SIZE, zoom);
}

function latLngToPinStyle(
  center: GeoPoint,
  pin: GeoPoint,
  zoom: number,
  width: number,
  height: number,
) {
  const origin = latLngToWorld(center.latitude, center.longitude, zoom);
  const target = latLngToWorld(pin.latitude, pin.longitude, zoom);
  return {
    left: width / 2 + (target.x - origin.x) * TILE_SIZE - 16,
    top: height / 2 + (target.y - origin.y) * TILE_SIZE - 32,
  };
}

function latLngToWorld(latitude: number, longitude: number, zoom: number) {
  const n = 2 ** zoom;
  const x = ((longitude + 180) / 360) * n;
  const latRad = (latitude * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

function worldToLatLng(x: number, y: number, zoom: number): GeoPoint {
  const n = 2 ** zoom;
  const longitude = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  return { latitude: (latRad * 180) / Math.PI, longitude };
}

function wrapTile(value: number, n: number) {
  return ((value % n) + n) % n;
}

function clampTile(value: number, n: number) {
  return Math.min(n - 1, Math.max(0, value));
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#d7d3cc',
  },
  wrapError: {
    borderColor: colors.danger,
  },
  clip: {
    overflow: 'hidden',
  },
  pinWrap: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  zoom: {
    position: 'absolute',
    right: 10,
    top: 10,
    gap: 6,
    zIndex: 2,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  zoomBtnOff: {
    opacity: 0.35,
  },
  zoomLevel: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  credit: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    fontSize: 10,
    color: colors.inkMuted,
  },
});

import type { DroneDataProvider, DroneSensorObservation } from "../types";

/**
 * LOKALE TESTDATA - ikke en rigtig sensor eller datakilde.
 *
 * Denne "provider" viser blot nogle faste, tydeligt markerede
 * eksempelobservationer, saa UI'et (kort, tidslinje) kan demonstreres.
 * `connected` er bevidst `false`, fordi der IKKE er tilsluttet nogen
 * reel sensor - se statusteksten vist i selve UI'et.
 */
const TEST_OBSERVATIONS: DroneSensorObservation[] = [
  {
    id: "test-1",
    source: "local-test-data",
    observedAt: "2026-08-04T09:12:00Z",
    telemetry: { timestamp: "2026-08-04T09:12:00Z", latitude: 64.135, longitude: -21.895, altitudeMeters: 120, headingDegrees: 270, speedMetersPerSecond: 8 },
    note: "Eksempeldata - ingen rigtig sensor tilsluttet.",
  },
  {
    id: "test-2",
    source: "local-test-data",
    observedAt: "2026-08-04T09:13:30Z",
    telemetry: { timestamp: "2026-08-04T09:13:30Z", latitude: 64.14, longitude: -21.92, altitudeMeters: 115, headingDegrees: 260, speedMetersPerSecond: 7 },
    note: "Eksempeldata - ingen rigtig sensor tilsluttet.",
  },
  {
    id: "test-3",
    source: "local-test-data",
    observedAt: "2026-08-04T09:15:00Z",
    telemetry: { timestamp: "2026-08-04T09:15:00Z", latitude: 64.148, longitude: -21.94, altitudeMeters: 95, headingDegrees: 245, speedMetersPerSecond: 5 },
    remoteId: { serialOrSessionId: "TEST-SESSION-0001", operatorIdKnown: false, broadcastFormatNote: "Eksempel - ikke et rigtigt Remote ID-signal" },
    note: "Eksempeldata - ingen rigtig sensor tilsluttet.",
  },
];

export const localTestDataProvider: DroneDataProvider = {
  id: "local-test-data",
  labelId: "drone.provider.localTestData",
  isLiveSource: false,
  connected: false,
  fetchObservations: async () => TEST_OBSERVATIONS,
};

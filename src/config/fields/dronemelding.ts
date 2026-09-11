import type { FieldSection } from "../../types";
import { dtgField, gpsField, mgrsField, coordinatesField, remarksField, mediaField } from "./common";

/** Kernefelter - vises i baade Hurtig og Grundig observation. */
export const DRONE_CORE_SECTIONS: FieldSection[] = [
  {
    id: "observation",
    titleId: "fields.dronemelding.section.observation",
    fields: [
      dtgField,
      { id: "observer", labelId: "fields.dronemelding.observer", type: "text", required: true },
      gpsField,
      mgrsField,
      coordinatesField,
      { id: "lastKnownPosition", labelId: "fields.dronemelding.lastKnownPosition", type: "text" },
    ],
  },
];

/** Grundfelter fra den oprindelige Dronemelding - vises fortsat i Grundig observation. */
export const DRONE_BASIC_SECTIONS: FieldSection[] = [
  {
    id: "udseende",
    titleId: "fields.dronemelding.section.udseende",
    fields: [
      { id: "direction", labelId: "fields.dronemelding.direction", type: "text" },
      { id: "altitude", labelId: "fields.dronemelding.altitude", type: "text" },
      {
        id: "wingType",
        labelId: "fields.dronemelding.wingType",
        type: "radio",
        options: [
          { value: "fixed", labelId: "fields.dronemelding.wingTypeChoice.fixed" },
          { value: "multirotor", labelId: "fields.dronemelding.wingTypeChoice.multirotor" },
          { value: "unknown", labelId: "fields.dronemelding.wingTypeChoice.unknown" },
        ],
      },
      { id: "rotorCount", labelId: "fields.dronemelding.rotorCount", type: "text" },
      { id: "size", labelId: "fields.dronemelding.size", type: "text" },
      { id: "shape", labelId: "fields.dronemelding.shape", type: "text" },
      { id: "color", labelId: "fields.dronemelding.color", type: "text" },
      { id: "lights", labelId: "fields.dronemelding.lights", type: "text" },
      { id: "sound", labelId: "fields.dronemelding.sound", type: "text" },
    ],
  },
  {
    id: "adfaerd",
    titleId: "fields.dronemelding.section.adfaerd",
    fields: [
      { id: "behavior", labelId: "fields.dronemelding.behavior", type: "textarea" },
      { id: "visiblePayload", labelId: "fields.dronemelding.visiblePayload", type: "textarea" },
      { id: "distanceDirection", labelId: "fields.dronemelding.distanceDirection", type: "text" },
    ],
  },
];

export const DRONE_SUPPLERENDE_SECTION: FieldSection = {
  id: "supplerende",
  titleId: "fields.dronemelding.section.supplerende",
  fields: [remarksField, mediaField],
};

/** Tilbagevendende valgmuligheder "Ukendt"/"Kan ikke vurderes" - brugeren maa aldrig tvinges til at gaette. */
const UNKNOWN_OPTIONS = [
  { value: "unknown", labelId: "fields.dronemelding.uncertain.unknown" },
  { value: "cannotAssess", labelId: "fields.dronemelding.uncertain.cannotAssess" },
];

export const DRONE_DETAILS_SECTION: FieldSection = {
  id: "drone-details",
  titleId: "fields.dronemelding.section.droneDetails",
  defaultCollapsed: true,
  fields: [
    { id: "droneCount", labelId: "fields.dronemelding.droneCount", type: "text" },
    {
      id: "droneCertainty",
      labelId: "fields.dronemelding.droneCertainty",
      type: "radio",
      options: [
        { value: "known", labelId: "fields.dronemelding.droneCertaintyChoice.known" },
        { value: "unknownType", labelId: "fields.dronemelding.droneCertaintyChoice.unknownType" },
        { value: "uncertain", labelId: "fields.dronemelding.droneCertaintyChoice.uncertain" },
      ],
    },
    {
      id: "droneClass",
      labelId: "fields.dronemelding.droneClass",
      type: "select",
      options: [
        { value: "fixed", labelId: "fields.dronemelding.wingTypeChoice.fixed" },
        { value: "multirotor", labelId: "fields.dronemelding.wingTypeChoice.multirotor" },
        { value: "vtol", labelId: "fields.dronemelding.droneClassChoice.vtol" },
        ...UNKNOWN_OPTIONS,
      ],
    },
    { id: "estimatedSize", labelId: "fields.dronemelding.estimatedSize", type: "text" },
    { id: "colorMarkings", labelId: "fields.dronemelding.colorMarkings", type: "text" },
    { id: "lightPattern", labelId: "fields.dronemelding.lightPattern", type: "text" },
    { id: "soundDetail", labelId: "fields.dronemelding.soundDetail", type: "text" },
    { id: "estimatedAltitude", labelId: "fields.dronemelding.estimatedAltitude", type: "text" },
    { id: "estimatedSpeed", labelId: "fields.dronemelding.estimatedSpeed", type: "text" },
    { id: "visiblePayloadDetail", labelId: "fields.dronemelding.visiblePayloadDetail", type: "textarea" },
    {
      id: "cameraOrGimbal",
      labelId: "fields.dronemelding.cameraOrGimbal",
      type: "radio",
      options: [
        { value: "yes", labelId: "fields.dronemelding.yesNo.yes" },
        { value: "no", labelId: "fields.dronemelding.yesNo.no" },
        ...UNKNOWN_OPTIONS,
      ],
    },
    {
      id: "antennaOrRf",
      labelId: "fields.dronemelding.antennaOrRf",
      type: "radio",
      options: [
        { value: "yes", labelId: "fields.dronemelding.yesNo.yes" },
        { value: "no", labelId: "fields.dronemelding.yesNo.no" },
        ...UNKNOWN_OPTIONS,
      ],
    },
    { id: "dropMechanism", labelId: "fields.dronemelding.dropMechanism", type: "textarea" },
    { id: "lastSeenDirection", labelId: "fields.dronemelding.lastSeenDirection", type: "text" },
  ],
};

export const DRONE_FLIGHT_PATTERN_SECTION: FieldSection = {
  id: "flight-pattern",
  titleId: "fields.dronemelding.section.flightPattern",
  defaultCollapsed: true,
  fields: [
    {
      id: "flightPattern",
      labelId: "fields.dronemelding.flightPattern",
      type: "select",
      options: [
        { value: "directOverflight", labelId: "fields.dronemelding.flightPatternChoice.directOverflight" },
        { value: "stationaryHover", labelId: "fields.dronemelding.flightPatternChoice.stationaryHover" },
        { value: "circling", labelId: "fields.dronemelding.flightPatternChoice.circling" },
        { value: "repeatingRoute", labelId: "fields.dronemelding.flightPatternChoice.repeatingRoute" },
        { value: "following", labelId: "fields.dronemelding.flightPatternChoice.following" },
        { value: "switchingPositions", labelId: "fields.dronemelding.flightPatternChoice.switchingPositions" },
        { value: "landedOrGone", labelId: "fields.dronemelding.flightPatternChoice.landedOrGone" },
        { value: "possibleRelay", labelId: "fields.dronemelding.flightPatternChoice.possibleRelay" },
        { value: "other", labelId: "fields.dronemelding.flightPatternChoice.other" },
      ],
    },
    { id: "flightPatternOther", labelId: "fields.dronemelding.flightPatternOther", type: "text" },
    { id: "flightStartTime", labelId: "fields.dronemelding.flightStartTime", type: "datetime" },
    {
      id: "flightOngoing",
      labelId: "fields.dronemelding.flightOngoing",
      type: "checkbox",
    },
    { id: "flightEndTime", labelId: "fields.dronemelding.flightEndTime", type: "datetime", showWhen: (v) => v.flightOngoing !== true },
  ],
};

const NETWORK_INDICATOR_OPTIONS = [
  "multipleSimultaneous",
  "sequential",
  "repeatedPositions",
  "circlingSameArea",
  "stationaryPossibleRelay",
  "altitudeSwitching",
  "possibleVehicleLink",
  "possibleBuildingLink",
  "possibleMastLink",
  "possibleLaunchSite",
  "possibleOperatorPosition",
  "possibleRelayPosition",
  "none",
  "unknown",
].map((value) => ({ value, labelId: `fields.dronemelding.networkIndicator.${value}` }));

export const DRONE_NETWORK_SECTION: FieldSection = {
  id: "network-indicators",
  titleId: "fields.dronemelding.section.networkIndicators",
  defaultCollapsed: true,
  fields: [
    {
      id: "networkIndicators",
      labelId: "fields.dronemelding.networkIndicators",
      type: "select",
      helpId: "fields.dronemelding.networkIndicatorsHelp",
      options: NETWORK_INDICATOR_OPTIONS,
    },
    { id: "networkIndicatorsNote", labelId: "fields.dronemelding.networkIndicatorsNote", type: "textarea" },
  ],
};

const DISRUPTION_TYPE_OPTIONS = [
  "mobileOutage",
  "mobileWeakUnstable",
  "radioOutage",
  "radioNoise",
  "gpsInaccuracy",
  "gpsJumping",
  "gpsUnavailable",
  "compassAbnormal",
  "none",
  "unknown",
  "other",
].map((value) => ({ value, labelId: `fields.dronemelding.disruptionType.${value}` }));

export const DRONE_DISRUPTION_SECTION: FieldSection = {
  id: "disruptions",
  titleId: "fields.dronemelding.section.disruptions",
  defaultCollapsed: true,
  fields: [
    { id: "disruptionType", labelId: "fields.dronemelding.disruptionTypeLabel", type: "select", options: DISRUPTION_TYPE_OPTIONS },
    { id: "disruptionTime", labelId: "fields.dronemelding.disruptionTime", type: "datetime" },
    { id: "disruptionDuration", labelId: "fields.dronemelding.disruptionDuration", type: "text" },
    { id: "disruptionPosition", labelId: "fields.dronemelding.disruptionPosition", type: "text" },
    { id: "disruptionAffected", labelId: "fields.dronemelding.disruptionAffected", type: "text" },
    {
      id: "disruptionTiming",
      labelId: "fields.dronemelding.disruptionTiming",
      type: "radio",
      options: [
        { value: "before", labelId: "fields.dronemelding.disruptionTimingChoice.before" },
        { value: "during", labelId: "fields.dronemelding.disruptionTimingChoice.during" },
        { value: "after", labelId: "fields.dronemelding.disruptionTimingChoice.after" },
        { value: "unknown", labelId: "fields.dronemelding.uncertain.unknown" },
      ],
    },
  ],
};

/** Alle sektioner for Grundig observation, i visningsraekkefoelge. */
export const DRONE_GRUNDIG_SECTIONS: FieldSection[] = [
  ...DRONE_CORE_SECTIONS,
  ...DRONE_BASIC_SECTIONS,
  DRONE_DETAILS_SECTION,
  DRONE_FLIGHT_PATTERN_SECTION,
  DRONE_NETWORK_SECTION,
  DRONE_DISRUPTION_SECTION,
  DRONE_SUPPLERENDE_SECTION,
];

/** Alle sektioner for Hurtig observation - minimalt, medie-foerst. */
export const DRONE_HURTIG_SECTIONS: FieldSection[] = [
  {
    id: "hurtig",
    titleId: "fields.dronemelding.section.hurtig",
    fields: [
      dtgField,
      gpsField,
      {
        id: "quickObservationType",
        labelId: "fields.dronemelding.quickObservationType",
        type: "select",
        options: [
          { value: "sighting", labelId: "fields.dronemelding.quickObservationTypeChoice.sighting" },
          { value: "suspiciousActivity", labelId: "fields.dronemelding.quickObservationTypeChoice.suspiciousActivity" },
          { value: "disruption", labelId: "fields.dronemelding.quickObservationTypeChoice.disruption" },
          { value: "other", labelId: "fields.dronemelding.quickObservationTypeChoice.other" },
        ],
      },
      remarksField,
      mediaField,
    ],
  },
];

/** Bagudkompatibelt navn - bruges af eksisterende historik-/eksport-kode. */
export const DRONEMELDING_SECTIONS: FieldSection[] = DRONE_GRUNDIG_SECTIONS;

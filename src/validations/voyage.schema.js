import * as Yup from 'yup';
import { twoDigitsOnly } from '../utils/decimalCommaFormat';

const message = "The value should be a decimal with maximum two digits after comma";

export const voyageSchema = Yup.object().shape({
  voyageId: Yup.string().required('Voyage id is required').test('len', 'Voyage ID must not be more than 12 characters', val => val !== undefined && val.length <= 12),
  vessel: Yup.number().required('Vessel is required'),
  originPort: Yup.string().required('Origin Port is required'),
  destinationPort: Yup.string().required('Destination port is required'),
  fromDate: Yup.date().required('Departure date is required'),
  toDate: Yup.date().required('Arrival date is required'),
  mgo: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  lfo: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  hfo: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  vlsfoAD: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  vlsfoEK: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  vlsfoXB: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  lng: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  fuelCost: Yup.number(),
  bioFuel: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  bunkerCost: Yup.number().positive(),
  freightCharges: Yup.number(),
  distanceTraveled: Yup.number().min(1).max(9999999),
  freightProfit: Yup.number().positive(),
  lpgPp: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  lpgBt: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  voyageType: Yup.string().required('Voyage Type is required'),
  grades: Yup.array().of(Yup.object().shape({
    inboundEu: Yup.number().nullable(true),
    outboundEu: Yup.number().nullable(true),
    euPort: Yup.number().nullable(true),
    withinEu: Yup.number().nullable(true)
  })),
});


export const aggregateSchema = Yup.object().shape({
  voyageId: Yup.string().required('Voyage id is required').test('len', 'Voyage ID must not be more than 12 characters', val => val !== undefined && val.length <= 12),
  vessel: Yup.number().required('Vessel is required'),
  mgo: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  lfo: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  hfo: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  vlsfoAD: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  vlsfoEK: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  vlsfoXB: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  lng: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  fuelCost: Yup.number(),
  bioFuel: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  bunkerCost: Yup.number().positive(),
  freightCharges: Yup.number(),
  distanceTraveled: Yup.number().min(1).max(9999999),
  freightProfit: Yup.number().positive(),
  lpgPp: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  lpgBt: Yup.number().min(0).max(10000).test(
    "inputEntry",
    message,
    twoDigitsOnly
  ),
  voyageType: Yup.string().required('Voyage Type is required'),
  grades: Yup.array().of(Yup.object().shape({
    inboundEu: Yup.number().nullable(true),
    outboundEu: Yup.number().nullable(true),
    euPort: Yup.number().nullable(true),
    withinEu: Yup.number().nullable(true)
  })),
});
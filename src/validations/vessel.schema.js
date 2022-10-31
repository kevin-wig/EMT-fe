import * as Yup from 'yup';
import { threeDigitsOnly } from '../utils/decimalCommaFormat';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const message = "The value should be a decimal with maximum three digits after comma";

export const vesselSchema = Yup.object().shape({
  name: Yup.string(),
  email: Yup.string().email('Check the format of the email you entered').required('Email is required'),
  company: Yup.number(),
  fleet: Yup.number(),
  imo: Yup.number().required('IMO is required').min(1).max(999999999999),
  netTonnage: Yup.number().required('Net tonnage is required').min(0).max(1000000),
  grossTonnage: Yup.number().required('Gross tonnage is required').min(0).max(1000000),
  dwt: Yup.number().required('DWT is required').min(0).max(600000).test(
    "inputEntry",
    message,
    threeDigitsOnly
  ),
  propulsionPower: Yup.number().required('Propulsion power is required').min(0).max(100000).test(
    "inputEntry",
    message,
    threeDigitsOnly
  ),
  iceClass: Yup.string().required('Ice class is required'),
  eedi: Yup.number().required('EEDI is required').min(0).max(100).test(
    "inputEntry",
    message,
    threeDigitsOnly
  ),
  eexi: Yup.number().min(0).max(100).test(
    "inputEntry",
    message,
    threeDigitsOnly
  ),
  powerOutput: Yup.number().required('Power output is required').min(0).max(100000).test(
    "inputEntry",
    message,
    threeDigitsOnly
  ),
  dateOfBuilt: Yup.date().min(new Date('01-01-1970'),'dateOfBuilt field must be later than 01-01-1970').max(tomorrow,'dateOfBuilt field must be at equal or earlier than today'),
});

import * as Yup from 'yup';

export const companySchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  primaryContactName: Yup.string().required('Primary contact name is required'),
  primaryContactEmailAddress: Yup.string()
    .email('Check the format of the email you entered')
    .required('Email is required'),
  packageType: Yup.string().required('Package type is required'),
  country: Yup.string().required('Country is required'),
  contactPhoneNumber: Yup.string().required('Contact phone number is required'),
});

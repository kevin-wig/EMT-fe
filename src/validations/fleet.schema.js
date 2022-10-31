import * as Yup from 'yup';

export const fleetSchema = Yup.object().shape({
  name: Yup.string()
    .required('First name is required'),
  company: Yup.number(),
});

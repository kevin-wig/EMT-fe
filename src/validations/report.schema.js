import * as Yup from 'yup';

export const reportSchema = Yup.object().shape({
  reportType: Yup.string()
    .required('Report type is required'),
});

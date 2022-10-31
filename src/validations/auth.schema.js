import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Check the format of the email you entered')
    .max(80, 'Maximum length is 80 characters')
    .required('Email is required'),
  password: Yup.string()
    // .matches(/^(?=.*?[A-Z|a-z])(?=.*?[0-9])(?=.*?[!@#\$&*~]).{6,}$/, 'Passwords must include at least six numbers, letters, and special characters (like ! and &).')
    // .min(6, 'Passwords must include at least six numbers, letters, and special characters (like ! and &).')
    .required('Password is required'),
});

export const passwordSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'The passwords do not match')
    .required('Confirm Password is required'),
});

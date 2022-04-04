import * as Yup from 'yup';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// material
import {
  Link,
  Stack,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Grid,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { createTheme, styled, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

// ----------------------------------------------------------------------

const useStyles = makeStyles((theme) => ({
  login: {
    border: '1px solid #ccc',
    padding: '70px',
    boxShadow: '0px 0px 23px 1px rgba(0,0,0,0.75)',
    ['@media (min-width: 660px)']: {
      border: '1px solid #ccc',
      padding: '110px',
      boxShadow: '0px 0px 23px 1px rgba(0,0,0,0.75)'
    }
  }
}));

export default function LoginForm() {
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: true
    },
    validationSchema: LoginSchema,
    onSubmit: () => {
      navigate('/dashboard', { replace: true });
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <Stack>
      <Grid className={classes.login}>
        <Typography variant="h3" gutterBottom component="div">
            Own Your Space
          </Typography>
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Login Using MySky
          </LoadingButton>
      </Grid>
    </Stack>
  );

}

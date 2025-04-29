import { Route } from 'react-router-dom';
import Signup, { action as signupAction } from './Signup';
import Login, { action as loginAction } from './Login';
import ForgotPassword, {
  action as forgotPasswordAction,
} from './ForgotPassword';
import EmailSent, { loader as emailSentLoader } from './EmailSent';
import JoinTeam from './JoinTeam';
export const authRoutes = [
  <Route
    key='signup'
    path='signup'
    element={<Signup />}
    action={signupAction}
  />,
  <Route key='login' path='login' element={<Login />} action={loginAction} />,
  <Route
    key='forgot-password'
    path='forgot-password'
    element={<ForgotPassword />}
    action={forgotPasswordAction}
  />,
  <Route
    key='email-sent'
    path='email-sent'
    element={<EmailSent />}
    loader={emailSentLoader}
  />,
  <Route key='join-team' path='join-team' element={<JoinTeam />} />,
];

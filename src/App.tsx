// routes
import Router from './routes';
// theme
import ThemeConfig from './theme';
import GlobalStyles from './theme/globalStyles';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/charts/BaseOptionChart';
import { SkynetProvider, FileManagerProvider, SkynetManagerProvider, UserProfileProvider, ActionProvider } from './contexts';
// ----------------------------------------------------------------------

export default function App() {
  return (
    <ThemeConfig>
      <ActionProvider>
        <SkynetProvider>
          <UserProfileProvider>
            <SkynetManagerProvider>
              <FileManagerProvider>
                <GlobalStyles />
                <BaseOptionChartStyle />
                <Router />
              </FileManagerProvider>
            </SkynetManagerProvider>
          </UserProfileProvider>
        </SkynetProvider>
      </ActionProvider>
    </ThemeConfig>
  );
}

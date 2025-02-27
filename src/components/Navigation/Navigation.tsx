import LaunchIcon from '@mui/icons-material/Launch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import ViewDashboardOutlineIcon from 'mdi-react/ViewDashboardOutlineIcon';
import { default as React, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { FF_NAV_PATHS } from '../../interfaces';
import { MenuLogo } from '../MenuLogo';
import { ActivityNav } from './ActivityNav';
import { BlockchainNav } from './BlockchainNav';
import { MyNodeNav } from './MyNodeNav';
import { NavItem } from './NavItem';
import { NetworkNav } from './NetworkNav';
import { OffChainNav } from './OffChainNav';
import { TokensNav } from './TokensNav';

export const NAV_BASENAME = '/ui';
export const NAV_WIDTH = 225;

export const Navigation: React.FC = () => {
  const { orgName, selectedNamespace } = useContext(ApplicationContext);
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const makeDrawerContents = (
    <>
      <NavItem
        name={t('dashboard')}
        icon={<ViewDashboardOutlineIcon />}
        action={() => navigate(FF_NAV_PATHS.homePath(selectedNamespace))}
        itemIsActive={pathname === FF_NAV_PATHS.homePath(selectedNamespace)}
        isRoot
      />
      <ActivityNav />
      <BlockchainNav />
      <OffChainNav />
      <TokensNav />
      <NetworkNav />
      <MyNodeNav />
      <NavItem
        name={t('docs')}
        icon={<MenuBookIcon />}
        action={() => window.open(FF_NAV_PATHS.docsPath, '_blank')}
        itemIsActive={false}
        rightIcon={<LaunchIcon />}
        isRoot
      />
    </>
  );

  return (
    <>
      <Drawer
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: NAV_WIDTH,
            backgroundColor: 'background.default',
          },
        }}
        color="primary"
        variant="permanent"
        anchor="left"
      >
        <MenuLogo />
        <List>
          <ListItem>
            <ListItemText>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {orgName}
              </Typography>
            </ListItemText>
          </ListItem>
          {makeDrawerContents}
        </List>
      </Drawer>
    </>
  );
};

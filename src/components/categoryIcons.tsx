import type { ReactElement } from 'react';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LandslideIcon from '@mui/icons-material/Landslide';
import GroupsIcon from '@mui/icons-material/Groups';
import ParkIcon from '@mui/icons-material/Park';

export const categoryIcons: Record<string, ReactElement> = {
  LocationCity: <LocationCityIcon />,
  School: <SchoolIcon />,
  LocalHospital: <LocalHospitalIcon />,
  Landslide: <LandslideIcon />,
  Groups: <GroupsIcon />,
  Park: <ParkIcon />,
};

export const categoryIcon = (name: string) => categoryIcons[name] ?? <GroupsIcon />;

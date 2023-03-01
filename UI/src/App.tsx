import { Route } from "react-router-dom";
import { Admin, Resource, defaultTheme, CustomRoutes } from "react-admin";
import jsonServerProvider from "ra-data-json-server";

import PostIcon from "@mui/icons-material/Book";
import UserIcon from "@mui/icons-material/Group";

import Layout from './core/components/Layout';

import { PostList, PostEdit, PostCreate } from "./admin/posts";
import { UserList } from "./admin/users";
import { Dashboard } from './admin/dashboard';
import { authProvider } from './core/authProvider';

import IssuesNavigator from "./sirius/IssuesNavigator";
import InventoryNavigator from "./sirius/InventoryNavigator";
import ScanControl from "./sirius/ScanControl";
import SingleReport from "./sirius/SingleReport";

//import { dataProvider } from './dataProvider';


const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');

import indigo from '@mui/material/colors/indigo';
import purple from '@mui/material/colors/purple';
import green from '@mui/material/colors/green';


// What is the Sirius theme color schema?
// Main options:
// #428dd1 - light blue
// #1b2a3b - darker scheme
// #00274b - darker scheme but more blue

const theme = {
    ...defaultTheme,
    palette: {
        primary: {
          main: '#428dd1',
        },
        secondary: {
          main: green[500],
        },
        background: {
            default: '#eaeaea',
        },
      },
};

const App = () => (
 <Admin 
    authProvider={authProvider} 
    dataProvider={dataProvider}
    layout={Layout} 
    dashboard={IssuesNavigator}
        theme={{
        ...theme,
    }}
  >
   <CustomRoutes>
      <Route path="/inventory" element={<InventoryNavigator />} />
      <Route path="/scan" element={<ScanControl />} />
      <Route path="/report/host/" element={<SingleReport />} />
      <Route path="/report/vulnerability/" element={<SingleReport />} />
   </CustomRoutes>

   {/* Administration */}
   <Resource name="users" list={UserList} edit={PostEdit} create={PostCreate} icon={UserIcon} />
   <Resource name="users" list={UserList} recordRepresentation="name" />
   <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon} />
 </Admin>
);

export default App;
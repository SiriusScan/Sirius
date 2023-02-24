import createComponent from '../utils/createComponent';
import deprecateComponent from '../utils/deprecateComponent';
var NavbarHeader = createComponent({
  name: 'NavbarHeader'
});
export default deprecateComponent(NavbarHeader, '<Navbar.Header> has been deprecated, use <Navbar.Brand> instead.');
import createComponent from '../utils/createComponent';
import deprecateComponent from '../utils/deprecateComponent';
var NavbarBody = createComponent({
  name: 'NavbarBody'
});
export default deprecateComponent(NavbarBody, '<Navbar.Body> has been deprecated, you should <Nav> as direct child of <Navbar>');
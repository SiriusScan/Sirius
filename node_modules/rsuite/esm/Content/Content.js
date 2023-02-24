import createComponent from '../utils/createComponent';

/**
 * For Internet Explorer 11 and lower, it's suggested that an ARIA role of "main"
 * be added to the <main> element to ensure it is accessible
 */
var Content = createComponent({
  name: 'Content',
  componentAs: 'main'
});
export default Content;
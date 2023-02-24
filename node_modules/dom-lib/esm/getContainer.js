/**
 * Get a DOM container
 * @param container
 * @param defaultContainer
 * @returns
 */
export default function getContainer(container, defaultContainer) {
  container = typeof container === 'function' ? container() : container;
  return container || defaultContainer;
}
/**
 * Returns the top-level document object of the node.
 * @param node The DOM element
 * @returns The top-level document object of the node
 */
export default function ownerDocument(node) {
  return node && node.ownerDocument || document;
}
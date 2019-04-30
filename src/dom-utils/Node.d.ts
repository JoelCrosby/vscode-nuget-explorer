export interface Node {
    attributes: any;
    /**
     * Returns node's node document's document base URL.
     */
    readonly baseURI: string;
    /**
     * Returns the children.
     */
    readonly childNodes: Node[];
    /**
     * Returns the first child.
     */
    readonly firstChild: Node | null;
    /**
     * Returns true if node is connected and false otherwise.
     */
    readonly isConnected: boolean;
    /**
     * Returns the last child.
     */
    readonly lastChild: Node | null;
    /** @deprecated */
    readonly namespaceURI: string | null;
    /**
     * Returns the next sibling.
     */
    readonly nextSibling: Node | null;
    /**
     * Returns a string appropriate for the type of node, as
     * follows:
     * Element
     * Its HTML-uppercased qualified name.
     * Attr
     * Its qualified name.
     * Text
     * "#text".
     * CDATASection
     * "#cdata-section".
     * ProcessingInstruction
     * Its target.
     * Comment
     * "#comment".
     * Document
     * "#document".
     * DocumentType
     * Its name.
     * DocumentFragment
     * "#document-fragment".
     */
    readonly nodeName: string;
    readonly nodeType: number;
    nodeValue: string | null;
    /**
     * Returns the node document.
     * Returns null for documents.
     */
    /**
     * Returns the parent element.
     */
    /**
     * Returns the parent.
     */
    /**
     * Returns the previous sibling.
     */
    readonly previousSibling: Node | null;
    textContent: string | null;
    appendChild<T extends Node>(newChild: T): T;
    /**
     * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
     */
    cloneNode(deep?: boolean): Node;
    compareDocumentPosition(other: Node): number;
    /**
     * Returns true if other is an inclusive descendant of node, and false otherwise.
     */
    contains(other: Node | null): boolean;
    /**
     * Returns node's shadow-including root.
     */
    /**
     * Returns whether node has children.
     */
    hasChildNodes(): boolean;
    insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
    isDefaultNamespace(namespace: string | null): boolean;
    /**
     * Returns whether node and otherNode have the same properties.
     */
    isEqualNode(otherNode: Node | null): boolean;
    isSameNode(otherNode: Node | null): boolean;
    lookupNamespaceURI(prefix: string | null): string | null;
    lookupPrefix(namespace: string | null): string | null;
    /**
     * Removes empty exclusive Text nodes and concatenates the data of remaining contiguous exclusive Text nodes into the first of their nodes.
     */
    normalize(): void;
    removeChild<T extends Node>(oldChild: T): T;
    replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
}
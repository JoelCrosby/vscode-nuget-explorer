import { DOMParser } from 'xmldom';
import { Project, ProjectTree } from './types/Project';

export class ProjectParser {

    constructor(private xml: string, private arrayTags: any) { }

    parse(): ProjectTree | undefined {

        const dom = (new DOMParser()).parseFromString(this.xml, "text/xml");

        const result: Project = {};
        for (let i = 0; i < dom.childNodes.length; i++) {
            this.parseNode(dom.childNodes[i], result);
        }

        return result.Project;
    }

    private isArray(o: any) {
        return Object.prototype.toString.apply(o) === '[object Array]';
    }

    private parseNode(xmlNode: any, result: any) {

        if (xmlNode.nodeName === "#text") {
            const v = xmlNode.nodeValue;
            if (v && v.trim()) {
                result['#text'] = v;
            }
            return;
        }

        const jsonNode: any = {};
        const existing = result[xmlNode.nodeName];
        if (existing) {
            if (!this.isArray(existing)) {
                result[xmlNode.nodeName] = [existing, jsonNode];
            }
            else {
                result[xmlNode.nodeName].push(jsonNode);
            }
        }
        else {
            if (this.arrayTags && this.arrayTags.indexOf(xmlNode.nodeName) !== -1) {
                result[xmlNode.nodeName] = [jsonNode];
            }
            else {
                result[xmlNode.nodeName] = jsonNode;
            }
        }

        if (xmlNode.hasOwnProperty('attributes')) {
            const length = xmlNode.attributes.length;
            for (let i = 0; i < length; i++) {
                const attribute = xmlNode.attributes[i];
                jsonNode[attribute.nodeName] = attribute.nodeValue;
            }
        }

        if (xmlNode.childNodes) {
            const length = xmlNode.childNodes.length;
            for (let i = 0; i < length; i++) {
                this.parseNode(xmlNode.childNodes[i], jsonNode);
            }
        }
    }
}

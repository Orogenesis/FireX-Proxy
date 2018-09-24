import parser from './pac/pac-parser.js';

export const NODE_TEXT = 'text';
export const NODE_EXPRESSION = 'expression';

/**
 * Placeholder replacer based on pegjs grammar
 * pac/grammar.pegjs
 */
export class TemplateEngine {
    /**
     * @param {object} placeholders
     */
    constructor(placeholders = {}) {
        this.placeholders = placeholders;
    }

    /**
     * @param {object} placeholders
     * @returns {TemplateEngine}
     */
    setPlaceholders(placeholders = {}) {
        this.placeholders = placeholders;

        return this;
    }

    /**
     * @param {string} templateUrl
     * @returns {Promise<any>}
     */
    buildUrl(templateUrl) {
        return new Promise(
            (resolve, reject) => {
                fetch(browser.runtime.getURL(templateUrl))
                    .then(response => response.text())
                    .then(response => {
                        resolve(this.build(response));
                    }).catch(reject)
            }
        )
    }

    /**
     * @param {string} template
     * @returns {string}
     */
    build(template) {
        let output = String();

        parser(template)
            .forEach(
                node => {
                    const { type, value } = node;

                    switch (type) {
                        case NODE_TEXT: {
                            output += value;

                            break;
                        }
                        case NODE_EXPRESSION: {
                            const { path } = node;

                            if (this.placeholders.hasOwnProperty(path)) {
                                output += this.resolvePlaceholder(path);
                            }

                            break;
                        }
                    }
                }
            );

        return output;
    }

    /**
     * @param {string} placeholder
     * @returns {string}
     */
    resolvePlaceholder(placeholder) {
        const value = this.placeholders[placeholder];

        switch (typeof value) {
            case 'object':
                return JSON.stringify(value);
            default:
                return value.toString();
        }
    }
}

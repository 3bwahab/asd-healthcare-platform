const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

/**
 * Render an email template with provided data
 * @param {string} templateName - Name of the template file (without .html extension)
 * @param {Object} data - Data to inject into the template
 * @returns {Promise<string>} - Rendered HTML email content
 */
const renderEmailTemplate = async (templateName, data) => {
  try {
    // Read the base template
    const baseTemplatePath = path.join(
      __dirname,
      "emailTemplates",
      "base.html"
    );
    const baseTemplate = fs.readFileSync(baseTemplatePath, "utf8");

    // Read the content template
    const contentTemplatePath = path.join(
      __dirname,
      "emailTemplates",
      `${templateName}.html`
    );
    const contentTemplate = fs.readFileSync(contentTemplatePath, "utf8");

    // Compile the content template
    const contentCompiled = handlebars.compile(contentTemplate);
    const contentHtml = contentCompiled(data);

    // Compile the base template with the rendered content
    const baseCompiled = handlebars.compile(baseTemplate);
    const finalHtml = baseCompiled({
      ...data,
      content: contentHtml,
      year: new Date().getFullYear(),
    });

    return finalHtml;
  } catch (error) {
    console.error(`Error rendering email template ${templateName}:`, error);
    throw new Error(`Failed to render email template: ${error.message}`);
  }
};

module.exports = renderEmailTemplate;

// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // Luat documentation sidebar
  tutorialSidebar: [
    'getting-started',
    {
      type: 'category',
      label: 'LUAT Templating',
      items: [
        {
          type: 'doc',
          id: 'templating/intro',
          label: 'Overview',
        },
        'templating/syntax',
        'templating/dynamic-attributes',
        'templating/components',
        'templating/scripts',
        'templating/cli',
        'templating/configuration',
        'templating/toolchain',
        'templating/examples',
      ],
    },
    {
      type: 'category',
      label: 'Routing & Projects',
      items: [
        {
          type: 'doc',
          id: 'application/overview',
          label: 'Introduction',
        },
        'application/structure',
        'application/routing',
        'application/functions',
        'application/api-routes',
        'application/dynamic-routes',
        'application/development',
        'application/embedding',
      ],
    },
  ],
};

export default sidebars;

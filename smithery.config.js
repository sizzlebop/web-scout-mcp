export default {
  esbuild: {
    // Mark problematic packages as external
    external: ["jsdoctypeparser"],

    // Enable minification for production
    minify: true,

    // Set Node.js target version
    target: "node18",
  },
};
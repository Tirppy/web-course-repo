module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "/" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist",
      data: "content"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
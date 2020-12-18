module.exports = {
  "devServer": {
    "proxy": {
      "/api": {
        "target": "https://adventofcode.com",
        "pathRewrite": {
          "^/api": ""
        }
      }
    }
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
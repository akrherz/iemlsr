import path from "path";

export default {
  build: {
    sourcemap: true,
  },
  base: '/lsr/',
  resolve: {
    alias: [
        {
          find: "@",
          replacement: path.resolve(__dirname, "src"),
        }
    ],
  }
}

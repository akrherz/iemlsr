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
        },
        // not mandatory
        {
          find: "jquery",
          replacement: path.resolve(
            __dirname,
            "node_modules/jquery/dist/jquery.min.js"
          ),
        },
        {
          find: "datatables.net-css",
          replacement: path.resolve(
            __dirname,
            "node_modules/datatables.net-dt/css/jquery.dataTables.min.css"
          ),
        },
      ],
  }
}

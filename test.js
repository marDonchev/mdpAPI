var mdpAPI = require("./index");

var myAPI = new mdpAPI({
  // logEnabled: true,
  // logPrefix: "MySimpleAPI >",
  // logStyle: "color: red",
  // includeDetails: true,
  // middlewareFunctions: {
  //   200: function (res) {
  //     console.info("WE HAVE 200", res);
  //   },
  // },
});

myAPI.setMiddleware(200, function (res) {
  console.info("------------- WE HAVE 200 statusText", res.statusText);
});
myAPI.removeMiddleware(200);

myAPI.get(
  "https://jsonplaceholder.typicode.com/posts/1",
  null,
  function (data) {
    console.info("data", data);
  },
  function (error) {
    console.error("error", error);
  }
);

// myAPI
//   .delete("https://jsonplaceholder.typicode.com/posts/1")
//   .then((result) => {
//     console.info("result => ", result);
//   })
//   .catch((err) => {
//     console.error("err => ", err);
//   });

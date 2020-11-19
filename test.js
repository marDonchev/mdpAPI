var mdpAPI = require("./index");
const fetch = require("node-fetch");

var myAPI = new mdpAPI({
  logEnabled: true,
  // logPrefix: "MySimpleAPI >",
  // logStyle: "color: red",
  includeDetails: true,
  middlewareFunctions: {
    200: function (res) {
      console.info("WE HAVE 200", res);
    },
    403: function (res) {
      console.info("WE HAVE 403", res);
    },
  },
  fetchLib: fetch, // passing the fetchLibrary that we want to use
  // fetchLibName: "axios",
});

myAPI.setMiddleware(200, function (res) {
  console.info("------------- WE HAVE 200 statusText", res.statusText);
});
myAPI.removeMiddleware(200);

// myAPI.get(
//   "https://jsonplaceholder.typicode.com/posts/1",
//   null,
//   function (data) {
//     console.info("data >>> ", data);
//   },
//   function (error) {
//     console.error("error >>> ", error);
//   }
// );

myAPI
  .post(
    "http://localhost:5000/challenges-fba64/us-central1/webApi/api/v1/graphql",
    {
      query: `{
                                    users {
                                        key,
                                        disabled,
                                        email,
                                        displayName,
                                        provider,
                                        level,
                                        avatar
                                    }
                                }
                                `,
    }
  )
  .then((result) => {
    console.info("result => ", result);
  })
  .catch((err) => {
    console.error("err => ", err);
  });

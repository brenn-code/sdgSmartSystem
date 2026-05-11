const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "weather.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const weatherProto = grpc.loadPackageDefinition(packageDefinition).weather;

//unary RPC handles single request and response
function AssessWeatherImpact(call, callback) {

  //request clients data
const { temperature, windSpeed, storm } = call.request;

  let risk = "LOW";
  let productivityImpact = 0;

  if (storm || windSpeed > 80) {
    risk = "EXTREME";
    productivityImpact = 60;
  }
  else if (temperature > 35) {
    risk = "HIGH HEAT";
    productivityImpact = 30;
  }

  callback(null, {
    risk,
    productivityImpact
  });
}
//Bidirectional Streaming, keeps connection open
function LiveSimulation(call) {

  call.on("data", (request) => {

    const scenario = request.scenario;

    let update = "";

    if (scenario === "storm") {
      update = "Storm detected. Outdoor work reduced by 70%";
    }
    else if (scenario === "heat") {
      update = "Heatwave warning. Mandatory breaks activated";
    }
    else {
      update = "Normal working conditions";
    }
//pushes message back to open stream ie continuous
    call.write({ update });
  });

  call.on("end", () => {
    call.end();
  });
}
//grpc server instance
const server = new grpc.Server();

server.addService(weatherProto.WeatherService.service, {
  AssessWeatherImpact,
  LiveSimulation
});

server.bindAsync(
  "127.0.0.1:50053",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Weather Service running on 50053");
    server.start();
  }
);


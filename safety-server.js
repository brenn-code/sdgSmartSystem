const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "safety.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const safetyProto = grpc.loadPackageDefinition(packageDefinition).safety;

function CheckFatigue(call, callback) {
  const { workerName, hoursWorked, unsafeCondition } = call.request;

  if (hoursWorked < 0) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Hours cannot be negative"
    });
  }

  let status = "SAFE";
  let alert = false;

  if (hoursWorked > 10 || unsafeCondition) {
    status = "FATIGUE OR SAFETY RISK DETECTED";
    alert = true;
  }

  callback(null, {
    status,
    alert
  });
}

function StreamAlerts(call) {

  const alerts = [
    "Worker fatigue detected",
    "Unsafe temperature levels",
    "Equipment malfunction",
    "Emergency drill activated"
  ];

  let index = 0;

  const interval = setInterval(() => {

    if (index >= alerts.length) {
      clearInterval(interval);
      call.end();
      return;
    }

    call.write({
      message: alerts[index]
    });

    index++;

  }, 3000);
}

const server = new grpc.Server();

server.addService(safetyProto.SafetyService.service, {
  CheckFatigue,
  StreamAlerts
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Safety Service running on 50051");
    server.start();
  }
);




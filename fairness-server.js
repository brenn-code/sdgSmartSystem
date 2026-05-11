const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "fairness.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const fairnessProto = grpc.loadPackageDefinition(packageDefinition).fairness;

const benchmarks = {
  Developer: 50000,
  Engineer: 60000,
  Manager: 70000
};

function CheckSalary(call, callback) {

  const { role, salary } = call.request;

  if (!benchmarks[role]) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: "Role benchmark not found"
    });
  }

  const benchmark = benchmarks[role];

  const underpaid = salary < benchmark;

  let result;

  if (underpaid) {
    result = "Potential underpayment detected";
  } else {
    result = "Salary appears fair";
  }

  callback(null, {
    result: result,
    underpaid: underpaid
  });
}

function UploadContracts(call, callback) {

  let stableContracts = 0;
  let unstableContracts = 0;

  call.on("data", (contract) => {

    if (contract.stable) {
      stableContracts = stableContracts + 1;
    } else {
      unstableContracts = unstableContracts + 1;
    }

  });

  call.on("end", () => {

    callback(null, {
      stableContracts: stableContracts,
      unstableContracts: unstableContracts
    });

  });
}

const server = new grpc.Server();

server.addService(fairnessProto.FairnessService.service, {
  CheckSalary,
  UploadContracts
});

server.bindAsync(
  "127.0.0.1:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Fairness Service running on 50052");
    server.start();
  }
);
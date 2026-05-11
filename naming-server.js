const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "naming.proto");

// Load proto file into a gRPC-compatible object
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const namingProto = grpc.loadPackageDefinition(packageDefinition).naming;

// Simple in-memory registry (no persistence)
const registry = {};

function RegisterService(call, callback) {
  const { serviceName, address } = call.request;

  registry[serviceName] = address;

  console.log(`${serviceName} registered at ${address}`);

  callback(null, {
    message: "Service registered successfully"
  });
}

function DiscoverService(call, callback) {
  const { serviceName } = call.request;

  // Return gRPC NOT_FOUND if service doesn't exist
  if (!registry[serviceName]) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: "Service not found"
    });
  }

  callback(null, {
    address: registry[serviceName]
  });
}

const server = new grpc.Server();

// Register service implementation with gRPC server
server.addService(namingProto.NamingService.service, {
  RegisterService,
  DiscoverService
});

// Start server on local port
server.bindAsync(
  "127.0.0.1:50050",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Naming Service running on 50050");
    server.start();
  }
);
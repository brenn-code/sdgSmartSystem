const express = require("express");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const app = express();

/*
  Serve frontend (index.html is in same folder)
*/
app.use(express.static(__dirname));

/*
  Load proto helper
*/
function loadProto(file, packageName) {
	const packageDefinition = protoLoader.loadSync(file);
	return grpc.loadPackageDefinition(packageDefinition)[packageName];
}

/*
  Load protos (ALL in same folder)
*/
const safetyProto = loadProto(
	path.join(__dirname, "safety.proto"),
	"safety"
);

const fairnessProto = loadProto(
	path.join(__dirname, "fairness.proto"),
	"fairness"
);

const weatherProto = loadProto(
	path.join(__dirname, "weather.proto"),
	"weather"
);

/*
  gRPC clients
*/
const safetyClient = new safetyProto.SafetyService(
	"127.0.0.1:50051",
	grpc.credentials.createInsecure()
);

const fairnessClient = new fairnessProto.FairnessService(
	"127.0.0.1:50052",
	grpc.credentials.createInsecure()
);

const weatherClient = new weatherProto.WeatherService(
	"127.0.0.1:50053",
	grpc.credentials.createInsecure()
);

/*
  API ROUTES
*/

// Safety
app.get("/api/fatigue", (req, res) => {
	safetyClient.CheckFatigue(
		{
			workerName: req.query.name,
			hoursWorked: Number(req.query.hours),
			unsafeCondition: req.query.unsafe === "true"
		},
		(err, reply) => {
			if (err) return res.status(500).json(err);
			res.json(reply);
		}
	);
});

// Fairness
app.get("/api/salary", (req, res) => {
	fairnessClient.CheckSalary(
		{
			role: req.query.role,
			salary: Number(req.query.salary)
		},
		(err, reply) => {
			if (err) return res.status(500).json(err);
			res.json(reply);
		}
	);
});

// Weather
app.get("/api/weather", (req, res) => {
	weatherClient.AssessWeatherImpact(
		{
			temperature: Number(req.query.temp),
			windSpeed: Number(req.query.wind),
			storm: req.query.storm === "true"
		},
		(err, reply) => {
			if (err) return res.status(500).json(err);
			res.json(reply);
		}
	);
});

/*
  START SERVER
*/
app.listen(8080, () => {
	console.log("Gateway running on http://localhost:8080");
});





































